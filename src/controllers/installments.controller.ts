import { Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Get all installments for a campaign
export const getInstallmentsByCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { campaignId } = req.params;

    // Check if campaign exists and user has access
    const [campaigns] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM campaigns WHERE id = ?',
      [campaignId]
    );

    if (campaigns.length === 0) {
      res.status(404).json({ message: 'Campaña no encontrada' });
      return;
    }

    const campaign = campaigns[0];
    const userRoles = req.user?.roles || [];

    // Check access: comercial only sees own campaigns
    if (userRoles.includes('comercial') && !userRoles.includes('admin')) {
      if (campaign.created_by !== req.user?.id) {
        res.status(403).json({ message: 'No tienes permiso para ver estas cuotas' });
        return;
      }
    }

    const [installments] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM campaign_installments 
       WHERE campaign_id = ? 
       ORDER BY installment_number ASC`,
      [campaignId]
    );

    res.json(installments);
  } catch (error) {
    console.error('Error fetching installments:', error);
    res.status(500).json({ message: 'Error al obtener las cuotas' });
  }
};

// Create installment
export const createInstallment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { campaignId } = req.params;
    const { installment_number, amount, due_date, status, paid_date, notes } = req.body;

    // Check campaign exists and access
    const [campaigns] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM campaigns WHERE id = ?',
      [campaignId]
    );

    if (campaigns.length === 0) {
      res.status(404).json({ message: 'Campaña no encontrada' });
      return;
    }

    const campaign = campaigns[0];
    const userRoles = req.user?.roles || [];

    if (userRoles.includes('comercial') && !userRoles.includes('admin')) {
      if (campaign.created_by !== req.user?.id) {
        res.status(403).json({ message: 'No tienes permiso para crear cuotas en esta campaña' });
        return;
      }
    }

    // Validate installment sum doesn't exceed total_amount
    const [installments] = await pool.query<RowDataPacket[]>(
      'SELECT SUM(amount) as total FROM campaign_installments WHERE campaign_id = ?',
      [campaignId]
    );

    const currentTotal = installments[0]?.total || 0;
    const newTotal = parseFloat(currentTotal) + parseFloat(amount);

    if (campaign.total_amount && newTotal > campaign.total_amount) {
      res.status(400).json({ 
        message: `La suma de las cuotas (${newTotal}) supera el total de la campaña (${campaign.total_amount})` 
      });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO campaign_installments 
       (campaign_id, installment_number, amount, due_date, status, paid_date, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [campaignId, installment_number, amount, due_date, status || 'pending', paid_date || null, notes || null]
    );

    const [newInstallment] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM campaign_installments WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newInstallment[0]);
  } catch (error: any) {
    console.error('Error creating installment:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Ya existe una cuota con ese número para esta campaña' });
      return;
    }
    res.status(500).json({ message: 'Error al crear la cuota' });
  }
};

// Update installment
export const updateInstallment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { amount, due_date, status, paid_date, notes } = req.body;

    // Get installment and campaign
    const [installments] = await pool.query<RowDataPacket[]>(
      `SELECT ci.*, c.created_by, c.total_amount 
       FROM campaign_installments ci
       JOIN campaigns c ON ci.campaign_id = c.id
       WHERE ci.id = ?`,
      [id]
    );

    if (installments.length === 0) {
      res.status(404).json({ message: 'Cuota no encontrada' });
      return;
    }

    const installment = installments[0];
    const userRoles = req.user?.roles || [];

    if (userRoles.includes('comercial') && !userRoles.includes('admin')) {
      if (installment.created_by !== req.user?.id) {
        res.status(403).json({ message: 'No tienes permiso para modificar esta cuota' });
        return;
      }
    }

    // If amount is being updated, validate total
    if (amount !== undefined) {
      const [otherInstallments] = await pool.query<RowDataPacket[]>(
        'SELECT SUM(amount) as total FROM campaign_installments WHERE campaign_id = ? AND id != ?',
        [installment.campaign_id, id]
      );

      const otherTotal = otherInstallments[0]?.total || 0;
      const newTotal = parseFloat(otherTotal) + parseFloat(amount);

      if (installment.total_amount && newTotal > installment.total_amount) {
        res.status(400).json({ 
          message: `La suma de las cuotas (${newTotal}) supera el total de la campaña (${installment.total_amount})` 
        });
        return;
      }
    }

    const updateFields: string[] = [];
    const values: any[] = [];

    if (amount !== undefined) {
      updateFields.push('amount = ?');
      values.push(amount);
    }
    if (due_date !== undefined) {
      updateFields.push('due_date = ?');
      values.push(due_date);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      values.push(status);
    }
    if (paid_date !== undefined) {
      updateFields.push('paid_date = ?');
      values.push(paid_date);
    }
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      values.push(notes);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ message: 'No hay campos para actualizar' });
      return;
    }

    values.push(id);

    await pool.query(
      `UPDATE campaign_installments SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    const [updated] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM campaign_installments WHERE id = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating installment:', error);
    res.status(500).json({ message: 'Error al actualizar la cuota' });
  }
};

// Delete installment
export const deleteInstallment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get installment and campaign
    const [installments] = await pool.query<RowDataPacket[]>(
      `SELECT ci.*, c.created_by 
       FROM campaign_installments ci
       JOIN campaigns c ON ci.campaign_id = c.id
       WHERE ci.id = ?`,
      [id]
    );

    if (installments.length === 0) {
      res.status(404).json({ message: 'Cuota no encontrada' });
      return;
    }

    const installment = installments[0];
    const userRoles = req.user?.roles || [];

    if (userRoles.includes('comercial') && !userRoles.includes('admin')) {
      if (installment.created_by !== req.user?.id) {
        res.status(403).json({ message: 'No tienes permiso para eliminar esta cuota' });
        return;
      }
    }

    await pool.query('DELETE FROM campaign_installments WHERE id = ?', [id]);
    res.json({ message: 'Cuota eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting installment:', error);
    res.status(500).json({ message: 'Error al eliminar la cuota' });
  }
};

// Auto-generate installments for a campaign
export const generateInstallments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { campaignId } = req.params;

    // Get campaign
    const [campaigns] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM campaigns WHERE id = ?',
      [campaignId]
    );

    if (campaigns.length === 0) {
      res.status(404).json({ message: 'Campaña no encontrada' });
      return;
    }

    const campaign = campaigns[0];
    const userRoles = req.user?.roles || [];

    if (userRoles.includes('comercial') && !userRoles.includes('admin')) {
      if (campaign.created_by !== req.user?.id) {
        res.status(403).json({ message: 'No tienes permiso para generar cuotas en esta campaña' });
        return;
      }
    }

    if (!campaign.total_amount || !campaign.number_of_installments) {
      res.status(400).json({ 
        message: 'La campaña debe tener total_amount y number_of_installments definidos' 
      });
      return;
    }

    // Delete existing installments
    await pool.query('DELETE FROM campaign_installments WHERE campaign_id = ?', [campaignId]);

    const installmentAmount = campaign.total_amount / campaign.number_of_installments;
    const baseDate = new Date();
    
    for (let i = 1; i <= campaign.number_of_installments; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      await pool.query(
        `INSERT INTO campaign_installments 
         (campaign_id, installment_number, amount, due_date, status) 
         VALUES (?, ?, ?, ?, 'pending')`,
        [campaignId, i, installmentAmount.toFixed(2), dueDate.toISOString().split('T')[0]]
      );
    }

    const [newInstallments] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM campaign_installments WHERE campaign_id = ? ORDER BY installment_number ASC',
      [campaignId]
    );

    res.status(201).json(newInstallments);
  } catch (error) {
    console.error('Error generating installments:', error);
    res.status(500).json({ message: 'Error al generar las cuotas' });
  }
};

// Validation rules
export const validateInstallment = [
  // Validation logic here if needed
];
