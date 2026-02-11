import { Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest, Channel, ChannelWithActions, ChannelWithMediums, Action, Medium } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Validation rules
export const validateChannel = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
];

export const validateChannelId = [
  param('id').isInt({ min: 1 }).withMessage('Invalid channel ID'),
];

export const validateAssignActions = [
  body('action_ids')
    .isArray({ min: 1 })
    .withMessage('action_ids must be a non-empty array'),
  body('action_ids.*')
    .isInt({ min: 1 })
    .withMessage('Each action ID must be a positive integer'),
];

// Get all channels
export const getAllChannels = async (_req: AuthRequest, res: Response) => {
  try {
    const [channels] = await pool.query<(Channel & RowDataPacket)[]>(
      'SELECT * FROM channels ORDER BY name'
    );

    // Get mediums for each channel
    const channelsWithMediums: ChannelWithMediums[] = await Promise.all(
      channels.map(async (channel) => {
        const [mediums] = await pool.query<(Medium & RowDataPacket)[]>(
          `SELECT m.* FROM mediums m
           JOIN medium_channels mc ON m.id = mc.medium_id
           WHERE mc.channel_id = ?
           ORDER BY m.name`,
          [channel.id]
        );
        return { ...channel, mediums };
      })
    );

    res.json(channelsWithMediums);
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
};

// Get channel by ID with actions
export const getChannelById = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    // Get channel
    const [channels] = await pool.query<(Channel & RowDataPacket)[]>(
      'SELECT * FROM channels WHERE id = ?',
      [id]
    );

    if (channels.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Get actions for this channel
    const [actions] = await pool.query<(Action & RowDataPacket)[]>(
      `SELECT a.* FROM actions a
       JOIN channel_actions ca ON a.id = ca.action_id
       WHERE ca.channel_id = ?
       ORDER BY a.name`,
      [id]
    );

    const channelWithActions: ChannelWithActions = {
      ...channels[0],
      actions,
    };

    return res.json(channelWithActions);
  } catch (error) {
    console.error('Error fetching channel:', error);
    return res.status(500).json({ error: 'Failed to fetch channel' });
  }
};

// Create channel
export const createChannel = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;

    // Check if channel already exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM channels WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Channel with this name already exists' });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO channels (name) VALUES (?)',
      [name]
    );

    return res.status(201).json({
      message: 'Channel created successfully',
      channelId: result.insertId,
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    return res.status(500).json({ error: 'Failed to create channel' });
  }
};

// Update channel
export const updateChannel = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check if channel exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM channels WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if name is already taken by another channel
    const [duplicate] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM channels WHERE name = ? AND id != ?',
      [name, id]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({ error: 'Channel with this name already exists' });
    }

    await pool.query(
      'UPDATE channels SET name = ? WHERE id = ?',
      [name, id]
    );

    return res.json({ message: 'Channel updated successfully' });
  } catch (error) {
    console.error('Error updating channel:', error);
    return res.status(500).json({ error: 'Failed to update channel' });
  }
};

// Delete channel
export const deleteChannel = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    // Check if channel exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM channels WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Delete will also remove medium_channels and channel_actions entries (CASCADE)
    await pool.query('DELETE FROM channels WHERE id = ?', [id]);

    return res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Error deleting channel:', error);
    return res.status(500).json({ error: 'Failed to delete channel' });
  }
};

// Assign actions to channel
export const assignActions = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { action_ids } = req.body;

    // Check if channel exists
    const [channel] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM channels WHERE id = ?',
      [id]
    );

    if (channel.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Verify all actions exist
    const placeholders = action_ids.map(() => '?').join(',');
    const [actions] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM actions WHERE id IN (${placeholders})`,
      action_ids
    );

    if (actions.length !== action_ids.length) {
      return res.status(400).json({ error: 'One or more actions not found' });
    }

    // Remove existing assignments
    await pool.query('DELETE FROM channel_actions WHERE channel_id = ?', [id]);

    // Add new assignments
    if (action_ids.length > 0) {
      const values = action_ids.map((actionId: number) => `(${id}, ${actionId})`).join(',');
      await pool.query(
        `INSERT INTO channel_actions (channel_id, action_id) VALUES ${values}`
      );
    }

    return res.json({ message: 'Actions assigned successfully' });
  } catch (error) {
    console.error('Error assigning actions:', error);
    return res.status(500).json({ error: 'Failed to assign actions' });
  }
};

// Remove action from channel
export const removeAction = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id, actionId } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM channel_actions WHERE channel_id = ? AND action_id = ?',
      [id, actionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Action assignment not found' });
    }

    return res.json({ message: 'Action removed from channel successfully' });
  } catch (error) {
    console.error('Error removing action:', error);
    return res.status(500).json({ error: 'Failed to remove action' });
  }
};
