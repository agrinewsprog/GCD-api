import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '../config/database';
import { AuthRequest, Contact } from '../types';

// Validation rules
export const contactValidation = [
  body('company_id').isInt().withMessage('Valid company ID is required'),
  body('name').notEmpty().withMessage('Contact name is required'),
  body('surname').notEmpty().withMessage('Contact surname is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional(),
];

// Get all contacts
export const getAllContacts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = (req.query.search as string) || '';
    const company_id = req.query.company_id as string;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, co.name as company_name 
      FROM contacts c
      INNER JOIN companies co ON c.company_id = co.id
    `;
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM contacts c
      INNER JOIN companies co ON c.company_id = co.id
    `;
    const params: any[] = [];
    const countParams: any[] = [];
    const conditions: string[] = [];

    if (search) {
      conditions.push(`(c.name LIKE ? OR c.surname LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR co.name LIKE ?)`);
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (company_id) {
      conditions.push('c.company_id = ?');
      params.push(company_id);
      countParams.push(company_id);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY c.name ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [contacts] = await pool.query<RowDataPacket[]>(query, params);
    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get contact by ID
export const getContactById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [contacts] = await pool.query<(Contact & RowDataPacket)[]>(
      `SELECT c.*, co.name as company_name 
       FROM contacts c
       INNER JOIN companies co ON c.company_id = co.id
       WHERE c.id = ?`,
      [id]
    );

    if (contacts.length === 0) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.json(contacts[0]);
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create contact
export const createContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { company_id, name, surname, email, phone } = req.body;

    // Verify company exists
    const [companies] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM companies WHERE id = ?',
      [company_id]
    );

    if (companies.length === 0) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO contacts (company_id, name, surname, email, phone) 
       VALUES (?, ?, ?, ?, ?)`,
      [company_id, name, surname, email || null, phone || null]
    );

    res.status(201).json({
      message: 'Contact created successfully',
      contactId: result.insertId,
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update contact
export const updateContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { company_id, name, surname, email, phone } = req.body;

    // Verify company exists
    const [companies] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM companies WHERE id = ?',
      [company_id]
    );

    if (companies.length === 0) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE contacts 
       SET company_id = ?, name = ?, surname = ?, email = ?, phone = ?
       WHERE id = ?`,
      [company_id, name, surname, email || null, phone || null, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.json({ message: 'Contact updated successfully' });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete contact
export const deleteContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if contact is used in campaigns
    const [campaigns] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM campaigns WHERE contact_id = ?',
      [id]
    );

    if (campaigns[0].count > 0) {
      res.status(400).json({ 
        error: 'Cannot delete contact used in campaigns' 
      });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM contacts WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
