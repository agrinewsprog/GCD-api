import { Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest, Medium, MediumWithChannels, Channel } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Validation rules
export const validateMedium = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
];

export const validateMediumId = [
  param('id').isInt({ min: 1 }).withMessage('Invalid medium ID'),
];

export const validateAssignChannels = [
  body('channel_ids')
    .isArray({ min: 1 })
    .withMessage('channel_ids must be a non-empty array'),
  body('channel_ids.*')
    .isInt({ min: 1 })
    .withMessage('Each channel ID must be a positive integer'),
];

// Get all mediums
export const getAllMediums = async (_req: AuthRequest, res: Response) => {
  try {
    const [mediums] = await pool.query<(Medium & RowDataPacket)[]>(
      'SELECT * FROM mediums ORDER BY name'
    );
    res.json(mediums);
  } catch (error) {
    console.error('Error fetching mediums:', error);
    res.status(500).json({ error: 'Failed to fetch mediums' });
  }
};

// Get medium by ID with channels
export const getMediumById = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    // Get medium
    const [mediums] = await pool.query<(Medium & RowDataPacket)[]>(
      'SELECT * FROM mediums WHERE id = ?',
      [id]
    );

    if (mediums.length === 0) {
      return res.status(404).json({ error: 'Medium not found' });
    }

    // Get channels for this medium
    const [channels] = await pool.query<(Channel & RowDataPacket)[]>(
      `SELECT c.* FROM channels c
       JOIN medium_channels mc ON c.id = mc.channel_id
       WHERE mc.medium_id = ?
       ORDER BY c.name`,
      [id]
    );

    const mediumWithChannels: MediumWithChannels = {
      ...mediums[0],
      channels,
    };

    return res.json(mediumWithChannels);
  } catch (error) {
    console.error('Error fetching medium:', error);
    return res.status(500).json({ error: 'Failed to fetch medium' });
  }
};

// Create medium
export const createMedium = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;

    // Check if medium already exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM mediums WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Medium with this name already exists' });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO mediums (name) VALUES (?)',
      [name]
    );

    return res.status(201).json({
      message: 'Medium created successfully',
      mediumId: result.insertId,
    });
  } catch (error) {
    console.error('Error creating medium:', error);
    return res.status(500).json({ error: 'Failed to create medium' });
  }
};

// Update medium
export const updateMedium = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check if medium exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM mediums WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Medium not found' });
    }

    // Check if name is already taken by another medium
    const [duplicate] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM mediums WHERE name = ? AND id != ?',
      [name, id]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({ error: 'Medium with this name already exists' });
    }

    await pool.query(
      'UPDATE mediums SET name = ? WHERE id = ?',
      [name, id]
    );

    return res.json({ message: 'Medium updated successfully' });
  } catch (error) {
    console.error('Error updating medium:', error);
    return res.status(500).json({ error: 'Failed to update medium' });
  }
};

// Delete medium
export const deleteMedium = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    // Check if medium exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM mediums WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Medium not found' });
    }

    // Check if medium is used in campaigns
    const [campaigns] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM campaigns WHERE medium_id = ? LIMIT 1',
      [id]
    );

    if (campaigns.length > 0) {
      return res.status(409).json({
        error: 'Cannot delete medium because it is used in campaigns',
      });
    }

    // Delete will also remove medium_channels entries (CASCADE)
    await pool.query('DELETE FROM mediums WHERE id = ?', [id]);

    return res.json({ message: 'Medium deleted successfully' });
  } catch (error) {
    console.error('Error deleting medium:', error);
    return res.status(500).json({ error: 'Failed to delete medium' });
  }
};

// Assign channels to medium
export const assignChannels = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { channel_ids } = req.body;

    // Check if medium exists
    const [medium] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM mediums WHERE id = ?',
      [id]
    );

    if (medium.length === 0) {
      return res.status(404).json({ error: 'Medium not found' });
    }

    // Verify all channels exist
    const placeholders = channel_ids.map(() => '?').join(',');
    const [channels] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM channels WHERE id IN (${placeholders})`,
      channel_ids
    );

    if (channels.length !== channel_ids.length) {
      return res.status(400).json({ error: 'One or more channels not found' });
    }

    // Remove existing assignments
    await pool.query('DELETE FROM medium_channels WHERE medium_id = ?', [id]);

    // Add new assignments
    if (channel_ids.length > 0) {
      const values = channel_ids.map((channelId: number) => `(${id}, ${channelId})`).join(',');
      await pool.query(
        `INSERT INTO medium_channels (medium_id, channel_id) VALUES ${values}`
      );
    }

    return res.json({ message: 'Channels assigned successfully' });
  } catch (error) {
    console.error('Error assigning channels:', error);
    return res.status(500).json({ error: 'Failed to assign channels' });
  }
};

// Remove channel from medium
export const removeChannel = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id, channelId } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM medium_channels WHERE medium_id = ? AND channel_id = ?',
      [id, channelId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Channel assignment not found' });
    }

    return res.json({ message: 'Channel removed from medium successfully' });
  } catch (error) {
    console.error('Error removing channel:', error);
    return res.status(500).json({ error: 'Failed to remove channel' });
  }
};
