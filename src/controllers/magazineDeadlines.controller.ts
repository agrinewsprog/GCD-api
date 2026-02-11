import { Response } from 'express';
import { AuthRequest } from '../types';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Get confirmations for a campaign action
export const getConfirmations = async (req: AuthRequest, res: Response) => {
  try {
    const { campaignActionId } = req.params;

    const [confirmations] = await pool.query<RowDataPacket[]>(
      `SELECT 
        mdc.*,
        u.name as confirmed_by_name,
        u.email as confirmed_by_email,
        ru.name as reverted_by_name
      FROM magazine_deadline_confirmations mdc
      JOIN users u ON mdc.confirmed_by = u.id
      LEFT JOIN users ru ON mdc.reverted_by = ru.id
      WHERE mdc.campaign_action_id = ?
      ORDER BY mdc.confirmed_at DESC`,
      [campaignActionId]
    );

    res.json(confirmations);
  } catch (error) {
    console.error('Error fetching confirmations:', error);
    res.status(500).json({ error: 'Error al obtener confirmaciones' });
  }
};

// Confirm a deadline
export const confirmDeadline = async (req: AuthRequest, res: Response) => {
  try {
    const { campaignActionId } = req.params;
    const { deadline_type, link } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    // Check if already confirmed (and not reverted)
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM magazine_deadline_confirmations 
       WHERE campaign_action_id = ? 
       AND deadline_type = ? 
       AND reverted = FALSE`,
      [campaignActionId, deadline_type]
    );

    if (existing.length > 0) {
      res.status(400).json({ error: 'Deadline ya confirmado' });
      return;
    }

    // Insert confirmation
    await pool.query<ResultSetHeader>(
      `INSERT INTO magazine_deadline_confirmations 
       (campaign_action_id, deadline_type, confirmed_by, link) 
       VALUES (?, ?, ?, ?)`,
      [campaignActionId, deadline_type, userId, link || null]
    );

    // Get updated confirmations
    const [confirmations] = await pool.query<RowDataPacket[]>(
      `SELECT 
        mdc.*,
        u.name as confirmed_by_name,
        u.email as confirmed_by_email
      FROM magazine_deadline_confirmations mdc
      JOIN users u ON mdc.confirmed_by = u.id
      WHERE mdc.campaign_action_id = ?
      ORDER BY mdc.confirmed_at DESC`,
      [campaignActionId]
    );

    res.json(confirmations);
  } catch (error) {
    console.error('Error confirming deadline:', error);
    res.status(500).json({ error: 'Error al confirmar deadline' });
  }
};

// Revert a confirmation
export const revertConfirmation = async (req: AuthRequest, res: Response) => {
  try {
    const { confirmationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    // Update confirmation as reverted
    await pool.query(
      `UPDATE magazine_deadline_confirmations 
       SET reverted = TRUE, reverted_at = NOW(), reverted_by = ?
       WHERE id = ?`,
      [userId, confirmationId]
    );

    res.json({ message: 'Confirmación revertida correctamente' });
  } catch (error) {
    console.error('Error reverting confirmation:', error);
    res.status(500).json({ error: 'Error al revertir confirmación' });
  }
};
