import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '../config/database';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';

// Validation rules
export const loginValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('surname').notEmpty().withMessage('Surname is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('roles').isArray({ min: 1 }).withMessage('At least one role is required'),
];

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Get user with roles
    const [users] = await pool.query<(User & RowDataPacket)[]>(
      'SELECT u.* FROM users u WHERE u.email = ?',
      [email]
    );

    if (users.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Get user roles
    const [roles] = await pool.query<RowDataPacket[]>(
      `SELECT r.name FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [user.id]
    );

    const userRoles = roles.map(r => r.name);

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, roles: userRoles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        roles: userRoles,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, surname, email, password, roles } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.query<(User & RowDataPacket)[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, surname, email, password) VALUES (?, ?, ?, ?)',
      [name, surname, email, hashedPassword]
    );

    const userId = result.insertId;

    // Assign roles
    const roleValues = roles.map((roleId: number) => [userId, roleId]);
    await pool.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ?',
      [roleValues]
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user
export const getCurrentUser = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query<(User & RowDataPacket)[]>(
      'SELECT id, name, surname, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get user roles
    const [roles] = await pool.query<RowDataPacket[]>(
      `SELECT r.name FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [userId]
    );

    const user = users[0];
    const userRoles = roles.map(r => r.name);

    res.json({
      ...user,
      roles: userRoles,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
