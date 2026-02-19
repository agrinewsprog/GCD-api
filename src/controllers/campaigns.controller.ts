import { Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Validation rules
export const validateCampaign = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('company_id')
    .isInt({ min: 1 })
    .withMessage('Valid company_id is required'),
  body('contact_ids')
    .optional()
    .isArray()
    .withMessage('contact_ids must be an array'),
  body('contact_ids.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each contact_id must be a valid integer'),
  body('medium_ids')
    .optional()
    .isArray()
    .withMessage('medium_ids must be an array'),
  body('total_amount')
    .optional()
    .isDecimal()
    .withMessage('Total amount must be a valid number'),
  body('number_of_installments')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of installments must be a positive integer'),
];

export const validateCampaignId = [
  param('id').isInt({ min: 1 }).withMessage('Invalid campaign ID'),
];

export const validateAssignActions = [
  param('id').isInt({ min: 1 }).withMessage('Invalid campaign ID'),
  body('actions')
    .isArray()
    .withMessage('actions must be an array')
    .custom((value) => {
      if (value.length === 0) return true; // Allow empty array
      return value.every((item: any) =>
        item.medium_id && item.channel_id && item.action_id &&
        (!item.start_date || typeof item.start_date === 'string') &&
        (!item.end_date || typeof item.end_date === 'string') &&
        (!item.quantity || (typeof item.quantity === 'number' && item.quantity >= 1))
      );
    })
    .withMessage('Each action must have medium_id, channel_id, action_id, optional start_date, end_date, and quantity (min 1)'),
];

export const validateAssignContacts = [
  param('id').isInt({ min: 1 }).withMessage('Invalid campaign ID'),
  body('contact_ids')
    .isArray({ min: 1 })
    .withMessage('contact_ids must be a non-empty array'),
  body('contact_ids.*')
    .isInt({ min: 1 })
    .withMessage('Each contact_id must be a valid integer'),
];

export const validateRemoveContact = [
  param('id').isInt({ min: 1 }).withMessage('Invalid campaign ID'),
  param('contactId').isInt({ min: 1 }).withMessage('Invalid contact ID'),
];

export const validateActionStatus = [
  param('id').isInt({ min: 1 }).withMessage('Invalid action ID'),
  body('status')
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
];

// Get all campaigns (with role filtering)
export const getAllCampaigns = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];

    let query = `
      SELECT 
        c.*,
        comp.name as company_name,
        cont.name as contact_name,
        cont.surname as contact_surname,
        u.name as created_by_name
      FROM campaigns c
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN contacts cont ON c.contact_id = cont.id
      LEFT JOIN users u ON c.created_by = u.id
    `;

    const params: any[] = [];

    // Filter by user if comercial role (unless also admin)
    if (userRoles.includes('comercial') && !userRoles.includes('admin')) {
      query += ' WHERE c.created_by = ?';
      params.push(userId);
    }

    query += ' ORDER BY c.created_at DESC';

    const [campaigns] = await pool.query<RowDataPacket[]>(query, params);
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Error al obtener las campañas' });
  }
};

// Get campaign by ID with all related data
export const getCampaignById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];

    // Get campaign
    const [campaigns] = await pool.query<RowDataPacket[]>(
      `SELECT 
        c.*,
        comp.name as company_name,
        u.name as created_by_name
      FROM campaigns c
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?`,
      [id]
    );

    if (campaigns.length === 0) {
      res.status(404).json({ message: 'Campaña no encontrada' });
      return;
    }

    const campaign = campaigns[0];

    // Check access
    if (userRoles.includes('comercial') && !userRoles.includes('admin')) {
      if (campaign.created_by !== userId) {
        res.status(403).json({ message: 'No tienes permiso para ver esta campaña' });
        return;
      }
    }

    // Get contacts
    const [contacts] = await pool.query<RowDataPacket[]>(
      `SELECT cc.*, c.name, c.surname, c.email, c.phone
       FROM campaign_contacts cc
       JOIN contacts c ON cc.contact_id = c.id
       WHERE cc.campaign_id = ?
       ORDER BY cc.is_primary DESC, cc.id ASC`,
      [id]
    );

    // Get mediums
    const [mediums] = await pool.query<RowDataPacket[]>(
      `SELECT cm.*, m.name as medium_name
       FROM campaign_mediums cm
       JOIN mediums m ON cm.medium_id = m.id
       WHERE cm.campaign_id = ?`,
      [id]
    );

    // Get actions with full hierarchy
    const [actions] = await pool.query<RowDataPacket[]>(
      `SELECT 
        ca.*,
        m.name as medium_name,
        ch.name as channel_name,
        a.name as action_name
      FROM campaign_actions ca
      JOIN mediums m ON ca.medium_id = m.id
      JOIN channels ch ON ca.channel_id = ch.id
      JOIN actions a ON ca.action_id = a.id
      WHERE ca.campaign_id = ?
      ORDER BY m.name, ch.name, a.name`,
      [id]
    );

    // Format dates to YYYY-MM-DD to avoid timezone issues
    const formattedActions = actions.map(action => {
      // Helper to format date from MySQL DATE field
      const formatDate = (date: any) => {
        if (!date) return null;
        // If it's already a string in YYYY-MM-DD format, use it directly
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return date;
        }
        // If it's a Date object, format it manually without timezone conversion
        if (date instanceof Date) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        return null;
      };

      return {
        ...action,
        start_date: formatDate(action.start_date),
        end_date: formatDate(action.end_date)
      };
    });

    res.json({
      ...campaign,
      contacts,
      mediums,
      actions: formattedActions
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Error al obtener la campaña' });
  }
};

// Create campaign
export const createCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      name,
      description,
      company_id,
      contact_ids,
      medium_ids,
      contract_link,
      total_amount,
      number_of_installments,
      currency,
      billing_zone,
      comments
    } = req.body;

    const userId = req.user?.id;

    // Validate company exists
    const [companies] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM companies WHERE id = ?',
      [company_id]
    );

    if (companies.length === 0) {
      res.status(400).json({ message: 'Empresa no encontrada' });
      return;
    }

    // Validate contacts exist and belong to company
    if (contact_ids && Array.isArray(contact_ids) && contact_ids.length > 0) {
      const [contacts] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM contacts WHERE id IN (?) AND company_id = ?',
        [contact_ids, company_id]
      );

      if (contacts.length !== contact_ids.length) {
        res.status(400).json({ message: 'Uno o más contactos no encontrados o no pertenecen a la empresa' });
        return;
      }
    }

    // Create campaign (without contact_id, it's deprecated)
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO campaigns (
        name, description, company_id,
        contract_link, total_amount, number_of_installments, currency, billing_zone,
        comments, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, company_id,
       contract_link || null, total_amount || null, number_of_installments || null,
       currency || 'EUR', billing_zone || null, comments || null, userId]
    );

    const campaignId = result.insertId;

    // Insert contacts if provided
    if (contact_ids && Array.isArray(contact_ids) && contact_ids.length > 0) {
      const contactValues = contact_ids.map((cid: number, index: number) => 
        [campaignId, cid, index === 0 ? 1 : 0] // First contact is primary
      );
      await pool.query(
        'INSERT INTO campaign_contacts (campaign_id, contact_id, is_primary) VALUES ?',
        [contactValues]
      );
    }

    // Insert mediums if provided
    if (medium_ids && Array.isArray(medium_ids) && medium_ids.length > 0) {
      const mediumValues = medium_ids.map((mid: number) => [campaignId, mid]);
      await pool.query(
        'INSERT INTO campaign_mediums (campaign_id, medium_id) VALUES ?',
        [mediumValues]
      );
    }

    const [newCampaign] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM campaigns WHERE id = ?',
      [campaignId]
    );

    res.status(201).json(newCampaign[0]);
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Error al crear la campaña' });
  }
};

// Update campaign
export const updateCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const {
      name,
      description,
      company_id,
      contact_ids,
      medium_ids,
      contract_link,
      total_amount,
      number_of_installments,
      currency,
      billing_zone,
      comments,
      completed
    } = req.body;

    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];

    // Check campaign exists and ownership
    const [campaigns] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM campaigns WHERE id = ?',
      [id]
    );

    if (campaigns.length === 0) {
      res.status(404).json({ message: 'Campaña no encontrada' });
      return;
    }

    const campaign = campaigns[0];

    // Check access
    if (userRoles.includes('comercial') && !userRoles.includes('admin')) {
      if (campaign.created_by !== userId) {
        res.status(403).json({ message: 'No tienes permiso para modificar esta campaña' });
        return;
      }
    }

    // Validate new company if provided
    if (company_id && company_id !== campaign.company_id) {
      const [companies] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM companies WHERE id = ?',
        [company_id]
      );

      if (companies.length === 0) {
        res.status(400).json({ message: 'Empresa no encontrada' });
        return;
      }
    }

    // Validate contacts if provided
    if (contact_ids !== undefined && Array.isArray(contact_ids) && contact_ids.length > 0) {
      const contactCompanyId = company_id || campaign.company_id;
      const [contacts] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM contacts WHERE id IN (?) AND company_id = ?',
        [contact_ids, contactCompanyId]
      );

      if (contacts.length !== contact_ids.length) {
        res.status(400).json({ message: 'Uno o más contactos no encontrados o no pertenecen a la empresa' });
        return;
      }
    }

    // Update campaign
    const updateFields: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      values.push(description);
    }
    if (company_id !== undefined) {
      updateFields.push('company_id = ?');
      values.push(company_id);
    }
    if (contract_link !== undefined) {
      updateFields.push('contract_link = ?');
      values.push(contract_link);
    }
    if (total_amount !== undefined) {
      updateFields.push('total_amount = ?');
      values.push(total_amount);
    }
    if (number_of_installments !== undefined) {
      updateFields.push('number_of_installments = ?');
      values.push(number_of_installments);
    }
    if (currency !== undefined) {
      updateFields.push('currency = ?');
      values.push(currency);
    }
    if (billing_zone !== undefined) {
      updateFields.push('billing_zone = ?');
      values.push(billing_zone);
    }
    if (comments !== undefined) {
      updateFields.push('comments = ?');
      values.push(comments);
    }
    if (completed !== undefined) {
      updateFields.push('completed = ?');
      values.push(completed);
    }

    if (updateFields.length > 0) {
      values.push(id);
      await pool.query(
        `UPDATE campaigns SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Update mediums if provided
    if (medium_ids !== undefined && Array.isArray(medium_ids)) {
      // Delete existing mediums
      await pool.query('DELETE FROM campaign_mediums WHERE campaign_id = ?', [id]);
      
      // Insert new mediums
      if (medium_ids.length > 0) {
        const mediumValues = medium_ids.map((mid: number) => [id, mid]);
        await pool.query(
          'INSERT INTO campaign_mediums (campaign_id, medium_id) VALUES ?',
          [mediumValues]
        );
      }
    }

    // Update contacts if provided
    if (contact_ids !== undefined && Array.isArray(contact_ids)) {
      // Delete existing contacts
      await pool.query('DELETE FROM campaign_contacts WHERE campaign_id = ?', [id]);
      
      // Insert new contacts
      if (contact_ids.length > 0) {
        const contactValues = contact_ids.map((cid: number, index: number) => 
          [id, cid, index === 0 ? 1 : 0] // First contact is primary
        );
        await pool.query(
          'INSERT INTO campaign_contacts (campaign_id, contact_id, is_primary) VALUES ?',
          [contactValues]
        );
      }
    }

    const [updated] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM campaigns WHERE id = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Error al actualizar la campaña' });
  }
};

// Delete campaign
export const deleteCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];

    const [campaigns] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM campaigns WHERE id = ?',
      [id]
    );

    if (campaigns.length === 0) {
      res.status(404).json({ message: 'Campaña no encontrada' });
      return;
    }

    const campaign = campaigns[0];

    // Check access
    if (userRoles.includes('comercial') && !userRoles.includes('admin')) {
      if (campaign.created_by !== userId) {
        res.status(403).json({ message: 'No tienes permiso para eliminar esta campaña' });
        return;
      }
    }

    await pool.query('DELETE FROM campaigns WHERE id = ?', [id]);
    res.json({ message: 'Campaña eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Error al eliminar la campaña' });
  }
};

// Assign actions to campaign (hierarchical: medium → channel → action)
export const assignActions = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { actions } = req.body; // Array of { medium_id, channel_id, action_id }
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];

    // Check campaign exists and ownership
    const [campaigns] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM campaigns WHERE id = ?',
      [id]
    );

    if (campaigns.length === 0) {
      res.status(404).json({ message: 'Campaña no encontrada' });
      return;
    }

    const campaign = campaigns[0];

    if (userRoles.includes('comercial') && !userRoles.includes('admin')) {
      if (campaign.created_by !== userId) {
        res.status(403).json({ message: 'No tienes permiso para modificar esta campaña' });
        return;
      }
    }

    // --- Incremental diff: preserve workflow data of existing actions ---

    // 1. Fetch existing actions
    const [existingActions] = await pool.query<RowDataPacket[]>(
      `SELECT id, medium_id, channel_id, action_id, quantity, start_date, end_date,
              newsletter_schedule_id, magazine_edition_id, status,
              workflow_state, deadline_date, content_type, design_responsible, notes
       FROM campaign_actions WHERE campaign_id = ?`,
      [id]
    );

    // Build a key for matching: (medium_id, channel_id, action_id, newsletter_schedule_id, magazine_edition_id)
    const makeKey = (a: any) =>
      `${a.medium_id}-${a.channel_id}-${a.action_id}-${a.newsletter_schedule_id || 'null'}-${a.magazine_edition_id || 'null'}`;

    const existingMap = new Map<string, any>();
    for (const ea of existingActions) {
      existingMap.set(makeKey(ea), ea);
    }

    const incomingKeys = new Set<string>();

    if (actions && actions.length > 0) {
      for (const a of actions) {
        const startDate = a.start_date ? a.start_date.split('T')[0] : null;
        const endDate = a.end_date ? a.end_date.split('T')[0] : null;
        const newsletterScheduleId = a.newsletter_schedule_id || null;
        const magazineEditionId = a.magazine_edition_id || null;
        const quantity = a.quantity || 1;

        const key = `${a.medium_id}-${a.channel_id}-${a.action_id}-${newsletterScheduleId || 'null'}-${magazineEditionId || 'null'}`;
        incomingKeys.add(key);

        const existing = existingMap.get(key);

        if (existing) {
          // 2a. Action already exists → update only scheduling fields, preserve workflow data
          await pool.query(
            `UPDATE campaign_actions
             SET quantity = ?, start_date = ?, end_date = ?,
                 newsletter_schedule_id = ?, magazine_edition_id = ?
             WHERE id = ?`,
            [quantity, startDate, endDate, newsletterScheduleId, magazineEditionId, existing.id]
          );
        } else {
          // 2b. New action → insert
          await pool.query(
            `INSERT INTO campaign_actions
             (campaign_id, medium_id, channel_id, action_id, quantity, start_date, end_date,
              newsletter_schedule_id, magazine_edition_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [id, a.medium_id, a.channel_id, a.action_id, quantity, startDate, endDate, newsletterScheduleId, magazineEditionId]
          );
        }
      }
    }

    // 3. Delete actions that were removed by the user
    const idsToDelete = existingActions
      .filter((ea: any) => !incomingKeys.has(makeKey(ea)))
      .map((ea: any) => ea.id);

    if (idsToDelete.length > 0) {
      await pool.query(
        `DELETE FROM campaign_actions WHERE id IN (?)`,
        [idsToDelete]
      );
    }

    // Get updated actions
    const [updatedActions] = await pool.query<RowDataPacket[]>(
      `SELECT 
        ca.*,
        m.name as medium_name,
        ch.name as channel_name,
        a.name as action_name
      FROM campaign_actions ca
      JOIN mediums m ON ca.medium_id = m.id
      JOIN channels ch ON ca.channel_id = ch.id
      JOIN actions a ON ca.action_id = a.id
      WHERE ca.campaign_id = ?
      ORDER BY m.name, ch.name, a.name`,
      [id]
    );

    res.json(updatedActions);
  } catch (error) {
    console.error('Error assigning actions:', error);
    res.status(500).json({ message: 'Error al asignar acciones' });
  }
};

// Update action status (for post-venta role)
export const updateActionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params; // campaign_action id
    const { status, notes } = req.body;

    const [actions] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM campaign_actions WHERE id = ?',
      [id]
    );

    if (actions.length === 0) {
      res.status(404).json({ message: 'Acción no encontrada' });
      return;
    }

    const updateFields: string[] = [];
    const values: any[] = [];

    if (status) {
      updateFields.push('status = ?');
      values.push(status);
    }
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      values.push(notes);
    }

    if (updateFields.length > 0) {
      values.push(id);
      await pool.query(
        `UPDATE campaign_actions SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
    }

    const [updated] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM campaign_actions WHERE id = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating action status:', error);
    res.status(500).json({ message: 'Error al actualizar el estado de la acción' });
  }
};

// Move action to another magazine edition
export const moveActionToEdition = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { target_edition_id } = req.body;

  try {
    // Verify action exists and has magazine edition assigned
    const [actions] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM campaign_actions WHERE id = ?',
      [id]
    );

    if (actions.length === 0) {
      res.status(404).json({ message: 'Acción no encontrada' });
      return;
    }

    const action = actions[0];

    if (!action.magazine_edition_id) {
      res.status(400).json({ message: 'Esta acción no está asignada a ninguna revista' });
      return;
    }

    // Verify target edition exists and is not completed
    const [targetEdition] = await pool.query<RowDataPacket[]>(
      'SELECT id, is_completed FROM magazine_editions WHERE id = ?',
      [target_edition_id]
    );

    if (targetEdition.length === 0) {
      res.status(404).json({ message: 'Edición de destino no encontrada' });
      return;
    }

    if (targetEdition[0].is_completed) {
      res.status(400).json({ message: 'No se puede mover contenido a una edición completada' });
      return;
    }

    // Update magazine_edition_id in campaign_actions
    await pool.query(
      'UPDATE campaign_actions SET magazine_edition_id = ? WHERE id = ?',
      [target_edition_id, id]
    );

    res.json({ message: 'Acción movida exitosamente', action_id: id, new_edition_id: target_edition_id });
  } catch (error) {
    console.error('Error moving action to edition:', error);
    res.status(500).json({ message: 'Error al mover la acción a otra edición' });
  }
};

// Assign contacts to campaign
export const assignContacts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { contact_ids } = req.body;

  try {
    // Verify campaign exists
    const [campaigns] = await pool.query<RowDataPacket[]>(
      'SELECT id, company_id FROM campaigns WHERE id = ?',
      [id]
    );

    if (campaigns.length === 0) {
      res.status(404).json({ message: 'Campaña no encontrada' });
      return;
    }

    const campaign = campaigns[0];

    if (!contact_ids || !Array.isArray(contact_ids) || contact_ids.length === 0) {
      res.status(400).json({ message: 'Debe proporcionar al menos un contacto' });
      return;
    }

    // Validate all contacts exist and belong to the campaign's company
    const [contacts] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM contacts WHERE id IN (?) AND company_id = ?',
      [contact_ids, campaign.company_id]
    );

    if (contacts.length !== contact_ids.length) {
      res.status(400).json({ message: 'Uno o más contactos no encontrados o no pertenecen a la empresa de la campaña' });
      return;
    }

    // Delete existing contacts for this campaign
    await pool.query(
      'DELETE FROM campaign_contacts WHERE campaign_id = ?',
      [id]
    );

    // Insert new contacts (first one is primary)
    const contactValues = contact_ids.map((cid: number, index: number) => 
      [id, cid, index === 0 ? 1 : 0]
    );
    await pool.query(
      'INSERT INTO campaign_contacts (campaign_id, contact_id, is_primary) VALUES ?',
      [contactValues]
    );

    res.json({ message: 'Contactos asignados exitosamente' });
  } catch (error) {
    console.error('Error assigning contacts:', error);
    res.status(500).json({ message: 'Error al asignar contactos' });
  }
};

// Remove a contact from campaign
export const removeContact = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id, contactId } = req.params;

  try {
    // Verify campaign exists
    const [campaigns] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM campaigns WHERE id = ?',
      [id]
    );

    if (campaigns.length === 0) {
      res.status(404).json({ message: 'Campaña no encontrada' });
      return;
    }

    // Check how many contacts are assigned to this campaign
    const [contactsCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM campaign_contacts WHERE campaign_id = ?',
      [id]
    );

    if (contactsCount[0].count <= 1) {
      res.status(400).json({ message: 'No se puede eliminar el último contacto de la campaña' });
      return;
    }

    // Delete the contact from campaign
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM campaign_contacts WHERE campaign_id = ? AND contact_id = ?',
      [id, contactId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Contacto no encontrado en esta campaña' });
      return;
    }

    res.json({ message: 'Contacto eliminado exitosamente' });
  } catch (error) {
    console.error('Error removing contact:', error);
    res.status(500).json({ message: 'Error al eliminar contacto' });
  }
};
