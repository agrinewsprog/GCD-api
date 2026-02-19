import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '../config/database';
import { AuthRequest, Company } from '../types';

// Validation rules
export const companyValidation = [
  body('name').notEmpty().withMessage('Company name is required'),
  body('billing_address').optional(),
  body('billing_postal_code').optional(),
  body('billing_city').optional(),
  body('billing_province').optional(),
  body('billing_country').optional(),
  body('tax_number').optional(),
  body('iban').optional(),
];

// Get all companies
export const getAllCompanies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = (req.query.search as string) || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM companies';
    let countQuery = 'SELECT COUNT(*) as total FROM companies';
    const params: any[] = [];
    const countParams: any[] = [];

    if (search) {
      const searchCondition = ` WHERE name LIKE ? OR billing_city LIKE ? OR billing_country LIKE ? OR tax_number LIKE ?`;
      query += searchCondition;
      countQuery += searchCondition;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [companies] = await pool.query<(Company & RowDataPacket)[]>(query, params);
    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get company by ID
export const getCompanyById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [companies] = await pool.query<(Company & RowDataPacket)[]>(
      'SELECT * FROM companies WHERE id = ?',
      [id]
    );

    if (companies.length === 0) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    res.json(companies[0]);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create company
export const createCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      name,
      billing_address,
      billing_postal_code,
      billing_city,
      billing_province,
      billing_country,
      tax_number,
      iban,
    } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO companies 
       (name, billing_address, billing_postal_code, billing_city, billing_province, 
        billing_country, tax_number, iban) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        billing_address || null,
        billing_postal_code || null,
        billing_city || null,
        billing_province || null,
        billing_country || null,
        tax_number || null,
        iban || null,
      ]
    );

    res.status(201).json({
      message: 'Company created successfully',
      companyId: result.insertId,
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update company
export const updateCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const {
      name,
      billing_address,
      billing_postal_code,
      billing_city,
      billing_province,
      billing_country,
      tax_number,
      iban,
    } = req.body;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE companies 
       SET name = ?, billing_address = ?, billing_postal_code = ?, billing_city = ?, 
           billing_province = ?, billing_country = ?, tax_number = ?, iban = ?
       WHERE id = ?`,
      [
        name,
        billing_address || null,
        billing_postal_code || null,
        billing_city || null,
        billing_province || null,
        billing_country || null,
        tax_number || null,
        iban || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    res.json({ message: 'Company updated successfully' });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete company
export const deleteCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if company has campaigns
    const [campaigns] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM campaigns WHERE company_id = ?',
      [id]
    );

    if (campaigns[0].count > 0) {
      res.status(400).json({ 
        error: 'Cannot delete company with existing campaigns' 
      });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM companies WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
