import { Request, Response } from 'express';
import pool from '../config/database';
import bcrypt from 'bcrypt';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Get all users with their roles
export const getAll = async (_req: Request, res: Response) => {
  try {
    const [users] = await pool.query<RowDataPacket[]>(`
      SELECT 
        u.id,
        u.name,
        u.surname,
        u.email,
        u.created_at,
        u.updated_at,
        GROUP_CONCAT(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    
    // Parse roles string to array
    const usersWithRoles = users.map((user: any) => ({
      ...user,
      roles: user.roles ? user.roles.split(',') : []
    }));
    
    res.json(usersWithRoles);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Get single user
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [users] = await pool.query<RowDataPacket[]>(`
      SELECT 
        u.id,
        u.name,
        u.surname,
        u.email,
        u.created_at,
        u.updated_at,
        GROUP_CONCAT(r.id) as role_ids,
        GROUP_CONCAT(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = ?
      GROUP BY u.id
    `, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const user = {
      ...users[0],
      role_ids: users[0].role_ids ? users[0].role_ids.split(',').map(Number) : [],
      roles: users[0].roles ? users[0].roles.split(',') : []
    };
    
    return res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Create user
export const create = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const { name, surname, email, password, role_ids } = req.body;
    
    // Validate required fields
    if (!name || !surname || !email || !password || !role_ids || role_ids.length === 0) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    await connection.beginTransaction();
    
    // Check if email already exists
    const [existingUsers] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO users (name, surname, email, password) VALUES (?, ?, ?, ?)',
      [name, surname, email, hashedPassword]
    );
    
    const userId = result.insertId;
    
    // Insert user roles
    for (const roleId of role_ids) {
      await connection.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [userId, roleId]
      );
    }
    
    await connection.commit();
    
    return res.status(201).json({ id: userId, message: 'Usuario creado exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Error al crear usuario' });
  } finally {
    connection.release();
  }
};

// Update user
export const update = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { name, surname, email, password, role_ids } = req.body;
    
    // Validate required fields
    if (!name || !surname || !email || !role_ids || role_ids.length === 0) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    await connection.beginTransaction();
    
    // Check if email is taken by another user
    const [existingUsers] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    );
    
    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    // Update user (with or without password)
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.query(
        'UPDATE users SET name = ?, surname = ?, email = ?, password = ? WHERE id = ?',
        [name, surname, email, hashedPassword, id]
      );
    } else {
      await connection.query(
        'UPDATE users SET name = ?, surname = ?, email = ? WHERE id = ?',
        [name, surname, email, id]
      );
    }
    
    // Delete existing roles
    await connection.query('DELETE FROM user_roles WHERE user_id = ?', [id]);
    
    // Insert new roles
    for (const roleId of role_ids) {
      await connection.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [id, roleId]
      );
    }
    
    await connection.commit();
    
    return res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Error al actualizar usuario' });
  } finally {
    connection.release();
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();
    
    // Delete user roles
    await connection.query('DELETE FROM user_roles WHERE user_id = ?', [id]);
    
    // Delete user
    await connection.query('DELETE FROM users WHERE id = ?', [id]);
    
    await connection.commit();
    
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  } finally {
    connection.release();
  }
};

// Get all roles
export const getRoles = async (_req: Request, res: Response) => {
  try {
    const [roles] = await pool.query<RowDataPacket[]>(
      'SELECT id, name FROM roles ORDER BY name'
    );
    
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
};
