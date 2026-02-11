import { Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import pool from '../config/database';
import { AuthRequest, Action, ActionWithChannels, Channel } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Validation rules
export const validateAction = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
];

export const validateActionId = [
  param('id').isInt({ min: 1 }).withMessage('Invalid action ID'),
];

// Get all actions
export const getAllActions = async (_req: AuthRequest, res: Response) => {
  try {
    const [actions] = await pool.query<(Action & RowDataPacket)[]>(
      'SELECT * FROM actions ORDER BY name'
    );

    // Get channels for each action
    const actionsWithChannels: ActionWithChannels[] = await Promise.all(
      actions.map(async (action) => {
        const [channels] = await pool.query<(Channel & RowDataPacket)[]>(
          `SELECT c.* FROM channels c
           JOIN channel_actions ca ON c.id = ca.channel_id
           WHERE ca.action_id = ?
           ORDER BY c.name`,
          [action.id]
        );
        return { ...action, channels };
      })
    );

    res.json(actionsWithChannels);
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
};

// Get action by ID
export const getActionById = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    const [actions] = await pool.query<(Action & RowDataPacket)[]>(
      'SELECT * FROM actions WHERE id = ?',
      [id]
    );

    if (actions.length === 0) {
      return res.status(404).json({ error: 'Action not found' });
    }

    return res.json(actions[0]);
  } catch (error) {
    console.error('Error fetching action:', error);
    return res.status(500).json({ error: 'Failed to fetch action' });
  }
};

// Create action
export const createAction = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, magazine_content_type } = req.body;

    // Check if action already exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM actions WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Action with this name already exists' });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO actions (name, magazine_content_type) VALUES (?, ?)',
      [name, magazine_content_type || null]
    );

    return res.status(201).json({
      message: 'Action created successfully',
      actionId: result.insertId,
    });
  } catch (error) {
    console.error('Error creating action:', error);
    return res.status(500).json({ error: 'Failed to create action' });
  }
};

// Update action
export const updateAction = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name, magazine_content_type } = req.body;

    // Check if action exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM actions WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Action not found' });
    }

    // Check if name is already taken by another action
    const [duplicate] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM actions WHERE name = ? AND id != ?',
      [name, id]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({ error: 'Action with this name already exists' });
    }

    await pool.query(
      'UPDATE actions SET name = ?, magazine_content_type = ? WHERE id = ?',
      [name, magazine_content_type || null, id]
    );

    return res.json({ message: 'Action updated successfully' });
  } catch (error) {
    console.error('Error updating action:', error);
    return res.status(500).json({ error: 'Failed to update action' });
  }
};

// Delete action
export const deleteAction = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;

    // Check if action exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM actions WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Action not found' });
    }

    // Check if action is used in campaign_actions
    const [campaignActions] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM campaign_actions WHERE action_id = ? LIMIT 1',
      [id]
    );

    if (campaignActions.length > 0) {
      return res.status(409).json({
        error: 'Cannot delete action because it is used in campaigns',
      });
    }

    // Delete will also remove channel_actions entries (CASCADE)
    await pool.query('DELETE FROM actions WHERE id = ?', [id]);

    return res.json({ message: 'Action deleted successfully' });
  } catch (error) {
    console.error('Error deleting action:', error);
    return res.status(500).json({ error: 'Failed to delete action' });
  }
};
