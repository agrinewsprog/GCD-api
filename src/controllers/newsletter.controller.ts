import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

// Get newsletter types with filters
export const getNewsletterTypes = async (req: Request, res: Response) => {
  try {
    const { medium_id, region } = req.query;

    let query = `
      SELECT 
        nt.*,
        m.name as medium_name
      FROM newsletter_types nt
      JOIN mediums m ON nt.medium_id = m.id
      WHERE nt.is_active = TRUE
    `;

    const params: any[] = [];

    // If medium_id is provided, find newsletters by the medium's region
    if (medium_id) {
      query = `
        SELECT 
          nt.*,
          m.name as medium_name
        FROM newsletter_types nt
        JOIN mediums m ON nt.medium_id = m.id
        JOIN mediums user_medium ON user_medium.region = nt.region
        WHERE nt.is_active = TRUE
        AND user_medium.id = ?
      `;
      params.push(medium_id);
    } else if (region) {
      // If only region is provided (backward compatibility)
      query += ' AND nt.region = ?';
      params.push(region);
    }

    query += ' ORDER BY m.name, nt.region, nt.week_of_month, nt.name';

    const [types] = await pool.query<RowDataPacket[]>(query, params);
    res.json(types);
  } catch (error) {
    console.error('Error fetching newsletter types:', error);
    res.status(500).json({ error: 'Error al obtener tipos de newsletter' });
  }
};

// Get newsletter schedules (available dates)
export const getNewsletterSchedules = async (req: Request, res: Response) => {
  try {
    const { newsletter_type_id, year, available_only } = req.query;

    if (!newsletter_type_id) {
      res.status(400).json({ error: 'newsletter_type_id es requerido' });
      return;
    }

    let query = `
      SELECT 
        ns.id,
        ns.newsletter_type_id,
        DATE_FORMAT(ns.scheduled_date, '%Y-%m-%d') as scheduled_date,
        ns.year,
        ns.month,
        ns.is_available,
        ns.created_at,
        ns.updated_at,
        nt.name as newsletter_name,
        nt.region,
        m.name as medium_name
      FROM newsletter_schedules ns
      JOIN newsletter_types nt ON ns.newsletter_type_id = nt.id
      JOIN mediums m ON nt.medium_id = m.id
      WHERE ns.newsletter_type_id = ?
    `;

    const params: any[] = [newsletter_type_id];

    if (year) {
      query += ' AND ns.year = ?';
      params.push(year);
    }

    if (available_only === 'true') {
      query += ' AND ns.is_available = TRUE';
      // Solo fechas futuras o del día actual
      query += ' AND ns.scheduled_date >= CURDATE()';
    }

    query += ' ORDER BY ns.scheduled_date';

    const [schedules] = await pool.query<RowDataPacket[]>(query, params);
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching newsletter schedules:', error);
    res.status(500).json({ error: 'Error al obtener fechas de newsletter' });
  }
};

// Get regions for a medium
export const getRegionsByMedium = async (req: Request, res: Response) => {
  try {
    const { medium_id } = req.params;

    const [regions] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT region 
       FROM newsletter_types 
       WHERE medium_id = ? AND is_active = TRUE
       ORDER BY region`,
      [medium_id]
    );

    res.json(regions.map((r: any) => r.region));
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Error al obtener regiones' });
  }
};

// Get schedule by id
export const getScheduleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [schedules] = await pool.query<RowDataPacket[]>(
      `SELECT 
        ns.id,
        ns.newsletter_type_id,
        DATE_FORMAT(ns.scheduled_date, '%Y-%m-%d') as scheduled_date,
        ns.year,
        ns.month,
        ns.is_available,
        ns.created_at,
        ns.updated_at,
        nt.name as newsletter_name,
        nt.region,
        nt.day_of_week,
        nt.week_of_month,
        m.name as medium_name
       FROM newsletter_schedules ns
       JOIN newsletter_types nt ON ns.newsletter_type_id = nt.id
       JOIN mediums m ON nt.medium_id = m.id
       WHERE ns.id = ?`,
      [id]
    );

    if (schedules.length === 0) {
      res.status(404).json({ error: 'Schedule no encontrado' });
      return;
    }

    res.json(schedules[0]);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Error al obtener schedule' });
  }
};

// Mark schedule as unavailable (used when assigning to campaign)
export const markScheduleAsUsed = async (scheduleId: number) => {
  await pool.query(
    'UPDATE newsletter_schedules SET is_available = FALSE WHERE id = ?',
    [scheduleId]
  );
};

// Mark schedule as available (used when removing from campaign)
export const markScheduleAsAvailable = async (scheduleId: number) => {
  await pool.query(
    'UPDATE newsletter_schedules SET is_available = TRUE WHERE id = ?',
    [scheduleId]
  );
};

// ============================================
// ADMIN ENDPOINTS - Newsletter Type Management
// ============================================

// Get all newsletter types (including inactive, for admin)
export const getAllNewsletterTypes = async (_req: Request, res: Response) => {
  try {
    const [types] = await pool.query<RowDataPacket[]>(
      `SELECT 
        nt.*,
        m.name as medium_name
      FROM newsletter_types nt
      JOIN mediums m ON nt.medium_id = m.id
      ORDER BY m.name, nt.region, nt.name`
    );
    res.json(types);
  } catch (error) {
    console.error('Error fetching all newsletter types:', error);
    res.status(500).json({ error: 'Error al obtener tipos de newsletter' });
  }
};

// Create newsletter type
export const createNewsletterType = async (req: Request, res: Response) => {
  try {
    const { medium_id, region, name, day_of_week, week_of_month, frequency, frequency_offset } = req.body;

    // Validate required fields
    if (!medium_id || !region || !name || !day_of_week || !week_of_month || !frequency) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }

    const [result] = await pool.query(
      `INSERT INTO newsletter_types 
        (medium_id, region, name, day_of_week, week_of_month, frequency, frequency_offset, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [medium_id, region, name, day_of_week, week_of_month, frequency, frequency_offset || 0]
    );

    res.status(201).json({ 
      message: 'Newsletter type creado exitosamente',
      id: (result as any).insertId 
    });
  } catch (error) {
    console.error('Error creating newsletter type:', error);
    res.status(500).json({ error: 'Error al crear newsletter type' });
  }
};

// Update newsletter type
export const updateNewsletterType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { medium_id, region, name, day_of_week, week_of_month, frequency, frequency_offset, is_active } = req.body;

    await pool.query(
      `UPDATE newsletter_types 
       SET medium_id = ?, region = ?, name = ?, day_of_week = ?, week_of_month = ?, 
           frequency = ?, frequency_offset = ?, is_active = ?
       WHERE id = ?`,
      [medium_id, region, name, day_of_week, week_of_month, frequency, frequency_offset || 0, is_active, id]
    );

    res.json({ message: 'Newsletter type actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating newsletter type:', error);
    res.status(500).json({ error: 'Error al actualizar newsletter type' });
  }
};

// Delete newsletter type
export const deleteNewsletterType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete schedules first (cascade)
    await pool.query('DELETE FROM newsletter_schedules WHERE newsletter_type_id = ?', [id]);

    // Then delete the newsletter type
    await pool.query('DELETE FROM newsletter_types WHERE id = ?', [id]);
    
    res.json({ message: 'Newsletter type y sus schedules eliminados exitosamente' });
  } catch (error) {
    console.error('Error deleting newsletter type:', error);
    res.status(500).json({ error: 'Error al eliminar newsletter type' });
  }
};

// Toggle active status
export const toggleNewsletterTypeStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE newsletter_types SET is_active = NOT is_active WHERE id = ?',
      [id]
    );

    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    console.error('Error toggling newsletter type status:', error);
    res.status(500).json({ error: 'Error al cambiar estado' });
  }
};

// Regenerate schedules for a year
export const regenerateSchedules = async (req: Request, res: Response) => {
  try {
    const { year } = req.body;

    if (!year) {
      res.status(400).json({ error: 'El año es requerido' });
      return;
    }

    // Delete existing schedules for that year
    await pool.query('DELETE FROM newsletter_schedules WHERE year = ?', [year]);

    // Call the generation script via exec
    const { exec } = require('child_process');
    const path = require('path');
    const scriptPath = path.join(__dirname, '../../scripts/generate-newsletter-schedules.js');

    exec(`node "${scriptPath}" ${year}`, (error: any, stdout: any, _stderr: any) => {
      if (error) {
        console.error('Error executing script:', error);
        res.status(500).json({ error: 'Error al regenerar schedules' });
        return;
      }
      console.log(stdout);
    });

    res.json({ message: `Schedules regenerados para el año ${year}` });
  } catch (error) {
    console.error('Error regenerating schedules:', error);
    res.status(500).json({ error: 'Error al regenerar schedules' });
  }
};
