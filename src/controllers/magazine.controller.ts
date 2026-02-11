import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Helper function to calculate first Monday of a month
const calculateFirstMonday = (year: number, month: number): string => {
  // month is 1-12
  const firstDay = new Date(year, month - 1, 1);
  const dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate days to add to get to first Monday
  // If first day is Sunday (0), add 1 day
  // If first day is Monday (1), add 0 days
  // If first day is Tuesday (2), add 6 days (next Monday)
  const daysToAdd = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  
  const firstMonday = new Date(year, month - 1, 1 + daysToAdd);
  
  // Format as YYYY-MM-DD
  const yearStr = firstMonday.getFullYear();
  const monthStr = String(firstMonday.getMonth() + 1).padStart(2, '0');
  const dayStr = String(firstMonday.getDate()).padStart(2, '0');
  
  return `${yearStr}-${monthStr}-${dayStr}`;
};

// Get all magazine editions
export const getAllMagazineEditions = async (_req: Request, res: Response) => {
  try {
    const [editions] = await pool.query<RowDataPacket[]>(
      `SELECT me.*, m.name as medium_name
       FROM magazine_editions me
       JOIN mediums m ON me.medium_id = m.id
       ORDER BY me.publication_date DESC`
    );
    res.json(editions);
  } catch (error) {
    console.error('Error fetching magazine editions:', error);
    res.status(500).json({ error: 'Error al obtener ediciones de revista' });
  }
};

// Get magazine edition by ID
export const getMagazineEditionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [editions] = await pool.query<RowDataPacket[]>(
      `SELECT me.*, m.name as medium_name
       FROM magazine_editions me
       JOIN mediums m ON me.medium_id = m.id
       WHERE me.id = ?`,
      [id]
    );

    if (editions.length === 0) {
      res.status(404).json({ error: 'Edición no encontrada' });
      return;
    }

    res.json(editions[0]);
  } catch (error) {
    console.error('Error fetching magazine edition:', error);
    res.status(500).json({ error: 'Error al obtener edición' });
  }
};

// Get editions by medium ID
export const getEditionsByMedium = async (req: Request, res: Response) => {
  try {
    const { mediumId } = req.params;
    
    const [editions] = await pool.query<RowDataPacket[]>(
      `SELECT me.*, m.name as medium_name
       FROM magazine_editions me
       JOIN mediums m ON me.medium_id = m.id
       WHERE me.medium_id = ?
       ORDER BY me.publication_date DESC`,
      [mediumId]
    );

    res.json(editions);
  } catch (error) {
    console.error('Error fetching magazine editions by medium:', error);
    res.status(500).json({ error: 'Error al obtener ediciones' });
  }
};

// Create new magazine edition
export const createMagazineEdition = async (req: Request, res: Response) => {
  try {
    const { medium_id, year, month, publication_date } = req.body;

    // Validate required fields
    if (!medium_id) {
      res.status(400).json({ error: 'El medio es requerido' });
      return;
    }

    let finalPublicationDate: string;

    // If publication_date is provided, use it; otherwise calculate first Monday
    if (publication_date) {
      finalPublicationDate = publication_date;
    } else if (year && month) {
      finalPublicationDate = calculateFirstMonday(parseInt(year), parseInt(month));
    } else {
      res.status(400).json({ error: 'Debes proporcionar año y mes, o una fecha de publicación' });
      return;
    }

    // Check if edition already exists for this medium and date
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM magazine_editions WHERE medium_id = ? AND publication_date = ?',
      [medium_id, finalPublicationDate]
    );

    if (existing.length > 0) {
      res.status(400).json({ error: 'Ya existe una edición para este medio en esta fecha' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO magazine_editions (medium_id, publication_date, status) VALUES (?, ?, ?)',
      [medium_id, finalPublicationDate, 'draft']
    );

    res.status(201).json({
      message: 'Edición creada exitosamente',
      id: result.insertId,
      publication_date: finalPublicationDate
    });
  } catch (error) {
    console.error('Error creating magazine edition:', error);
    res.status(500).json({ error: 'Error al crear edición' });
  }
};

// Update magazine edition
export const updateMagazineEdition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { publication_date, status } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (publication_date) {
      updates.push('publication_date = ?');
      values.push(publication_date);
    }

    if (status) {
      if (!['draft', 'active', 'published'].includes(status)) {
        res.status(400).json({ error: 'Estado inválido' });
        return;
      }
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }

    values.push(id);

    await pool.query(
      `UPDATE magazine_editions SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Edición actualizada exitosamente' });
  } catch (error) {
    console.error('Error updating magazine edition:', error);
    res.status(500).json({ error: 'Error al actualizar edición' });
  }
};

// Delete magazine edition
export const deleteMagazineEdition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if there are campaign actions associated
    const [actions] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM campaign_actions WHERE magazine_edition_id = ?',
      [id]
    );

    if (actions[0].count > 0) {
      res.status(400).json({ 
        error: 'No se puede eliminar. Hay campañas asociadas a esta edición.' 
      });
      return;
    }

    await pool.query('DELETE FROM magazine_editions WHERE id = ?', [id]);
    res.json({ message: 'Edición eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting magazine edition:', error);
    res.status(500).json({ error: 'Error al eliminar edición' });
  }
};

// Get edition with associated campaigns
export const getEditionWithCampaigns = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get edition info
    const [editions] = await pool.query<RowDataPacket[]>(
      `SELECT me.*, m.name as medium_name
       FROM magazine_editions me
       JOIN mediums m ON me.medium_id = m.id
       WHERE me.id = ?`,
      [id]
    );

    if (editions.length === 0) {
      res.status(404).json({ error: 'Edición no encontrada' });
      return;
    }

    const edition = editions[0];

    // Get associated campaign actions with campaign and company info
    const [campaigns] = await pool.query<RowDataPacket[]>(
      `SELECT 
        ca.id as campaign_action_id,
        ca.action_id as action_type_id,
        a.name as action_name,
        a.magazine_content_type,
        c.id as campaign_id,
        c.name as campaign_name,
        comp.id as company_id,
        comp.name as company_name,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        ca.start_date,
        ca.end_date,
        ca.status
      FROM campaign_actions ca
      JOIN campaigns c ON ca.campaign_id = c.id
      JOIN companies comp ON c.company_id = comp.id
      JOIN users u ON c.created_by = u.id
      JOIN actions a ON ca.action_id = a.id
      WHERE ca.magazine_edition_id = ?
      ORDER BY comp.name, c.name`,
      [id]
    );

    // Separate into technical articles and ads based on magazine_content_type
    const technicalArticles = campaigns.filter((c: any) => 
      c.magazine_content_type === 'technical'
    );

    const ads = campaigns.filter((c: any) => 
      c.magazine_content_type === 'ad'
    );

    res.json({
      edition,
      technical_articles: technicalArticles,
      ads: ads,
      all_campaigns: campaigns
    });
  } catch (error) {
    console.error('Error fetching edition with campaigns:', error);
    res.status(500).json({ error: 'Error al obtener edición con campañas' });
  }
};

// Complete magazine edition (mark as finished with publication link)
export const completeMagazineEdition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { publication_link } = req.body;

    // Validate publication link
    if (!publication_link || publication_link.trim() === '') {
      res.status(400).json({ error: 'El link de publicación es requerido' });
      return;
    }

    // Verify edition exists
    const [editions] = await pool.query<RowDataPacket[]>(
      'SELECT id, is_completed FROM magazine_editions WHERE id = ?',
      [id]
    );

    if (editions.length === 0) {
      res.status(404).json({ error: 'Edición no encontrada' });
      return;
    }

    if (editions[0].is_completed) {
      res.status(400).json({ error: 'Esta edición ya está completada' });
      return;
    }

    // Get all campaign actions for this edition
    const [campaignActions] = await pool.query<RowDataPacket[]>(
      `SELECT ca.id, a.magazine_content_type
       FROM campaign_actions ca
       JOIN actions a ON ca.action_id = a.id
       WHERE ca.magazine_edition_id = ?`,
      [id]
    );

    if (campaignActions.length === 0) {
      res.status(400).json({ error: 'Esta edición no tiene acciones para completar' });
      return;
    }

    // Verify all required deadlines are confirmed for each action
    const REQUIRED_DEADLINES_TECHNICAL = ['client', 'send_to_edition', 'edition', 'changes_commercial', 'changes_post_sale'];
    const REQUIRED_DEADLINES_AD = ['client'];

    for (const action of campaignActions) {
      const requiredDeadlines = action.magazine_content_type === 'technical' 
        ? REQUIRED_DEADLINES_TECHNICAL 
        : REQUIRED_DEADLINES_AD;

      const [confirmations] = await pool.query<RowDataPacket[]>(
        `SELECT deadline_type 
         FROM magazine_deadline_confirmations 
         WHERE campaign_action_id = ? AND reverted = FALSE`,
        [action.id]
      );

      const confirmedTypes = confirmations.map((c: any) => c.deadline_type);
      const missingDeadlines = requiredDeadlines.filter(d => !confirmedTypes.includes(d));

      if (missingDeadlines.length > 0) {
        res.status(400).json({ 
          error: `No todos los deadlines están confirmados. Faltan: ${missingDeadlines.join(', ')} en acción ${action.id}` 
        });
        return;
      }
    }

    // Update edition with publication link and mark as completed
    await pool.query<ResultSetHeader>(
      'UPDATE magazine_editions SET publication_link = ?, is_completed = TRUE WHERE id = ?',
      [publication_link, id]
    );

    res.json({ 
      message: 'Edición completada exitosamente',
      publication_link 
    });
  } catch (error) {
    console.error('Error completing magazine edition:', error);
    res.status(500).json({ error: 'Error al completar edición' });
  }
};
