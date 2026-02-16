import { Response } from 'express';
import pool from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { AuthRequest } from '../types';
import { getDeadlineForState } from '../utils/deadlineCalculator';

/**
 * Obtener todas las tareas de workflow (newsletter y RRSS)
 * Filtros: estado, rol del usuario
 */
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { workflow_state } = req.query;
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];
    const isAdmin = userRoles.includes('admin');

    let query = `
      SELECT 
        ca.id,
        ca.campaign_id,
        ca.medium_id,
        ca.channel_id,
        ca.action_id,
        ca.quantity,
        ca.start_date,
        ca.end_date,
        ca.status,
        ca.notes,
        ca.content_type,
        ca.workflow_state,
        ca.deadline_date,
        ca.design_responsible,
        ca.newsletter_link,
        ca.rrss_publication_date,
        ca.rrss_link,
        ca.created_at,
        ca.updated_at,
        c.name as campaign_name,
        m.name as medium_name,
        ch.name as channel_name,
        a.name as action_name,
        comp.name as company_name
      FROM campaign_actions ca
      JOIN campaigns c ON ca.campaign_id = c.id
      JOIN mediums m ON ca.medium_id = m.id
      JOIN channels ch ON ca.channel_id = ch.id
      JOIN actions a ON ca.action_id = a.id
      JOIN companies comp ON c.company_id = comp.id
      WHERE a.id IN (34, 38)
    `;

    const params: any[] = [];

    // Filtrar por medios asignados al usuario (si no es admin)
    if (!isAdmin && userId) {
      query += ` AND ca.medium_id IN (SELECT medium_id FROM user_mediums WHERE user_id = ?)`;
      params.push(userId);
    }

    // Filtrar por estado si se proporciona
    if (workflow_state) {
      query += ` AND ca.workflow_state = ?`;
      params.push(workflow_state);
    }

    query += ` ORDER BY ca.deadline_date ASC, ca.created_at DESC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ message: 'Error al obtener tareas' });
  }
};

/**
 * Actualizar el tipo de contenido (banner o artículo técnico)
 */
export const updateContentType = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content_type } = req.body;

    if (!content_type || !['banner', 'articulo_tecnico'].includes(content_type)) {
      res.status(400).json({ message: 'Tipo de contenido inválido' });
      return;
    }

    // Obtener la información de la tarea para calcular deadline si es necesario
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT start_date, workflow_state FROM campaign_actions WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Tarea no encontrada' });
      return;
    }

    const { start_date, workflow_state } = rows[0];

    // Calcular deadline automático según tipo de contenido
    let updateQuery = 'UPDATE campaign_actions SET content_type = ?';
    const updateParams: any[] = [content_type];

    if (start_date) {
      const deadline = getDeadlineForState(start_date, content_type, workflow_state);
      if (deadline) {
        updateQuery += ', deadline_date = ?';
        updateParams.push(deadline);
      }
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(id);

    const [result] = await pool.query<ResultSetHeader>(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Tarea no encontrada' });
      return;
    }

    res.json({ message: 'Tipo de contenido actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar tipo de contenido:', error);
    res.status(500).json({ message: 'Error al actualizar tipo de contenido' });
  }
};

/**
 * Actualizar el estado del workflow
 */
export const updateWorkflowState = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { workflow_state } = req.body;
    const userRoles = req.user?.roles || [];

    const validStates = ['por_recibir', 'enviado_diseno', 'en_edicion', 'cambios'];
    if (!workflow_state || !validStates.includes(workflow_state)) {
      res.status(400).json({ message: 'Estado inválido' });
      return;
    }

    // Obtener el estado actual de la tarea
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT workflow_state, start_date, content_type FROM campaign_actions WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Tarea no encontrada' });
      return;
    }

    const currentState = rows[0].workflow_state;
    const startDate = rows[0].start_date;
    const contentType = rows[0].content_type;

    // Validar transiciones de estado según rol
    const isPostVenta = userRoles.includes('post-venta');
    const isComercial = userRoles.includes('comercial');
    const isAdmin = userRoles.includes('admin');

    // Admin puede hacer cualquier transición
    // Post-venta puede: enviado_diseno → en_edicion, en_edicion → cambios
    // Comercial puede: por_recibir → enviado_diseno (confirma recepción), cambios → por_recibir (confirma cambios)
    if (!isAdmin) {
      if (isPostVenta) {
        const allowedTransitions = [
          { from: 'enviado_diseno', to: 'en_edicion' },
          { from: 'en_edicion', to: 'cambios' }
        ];
        
        const isAllowed = allowedTransitions.some(
          t => t.from === currentState && t.to === workflow_state
        );

        if (!isAllowed && currentState !== workflow_state) {
          res.status(403).json({ 
            message: 'No tienes permiso para realizar esta transición de estado' 
          });
          return;
        }
      } else if (isComercial) {
        // Comercial confirma recepción (queda en por_recibir) y confirma cambios (queda en cambios)
        // En la práctica, comercial puede confirmar que ha recibido el material o confirmar cambios
        const allowedTransitions = [
          { from: 'por_recibir', to: 'enviado_diseno' },
          { from: 'cambios', to: 'por_recibir' }
        ];
        const isAllowed = allowedTransitions.some(
          t => t.from === currentState && t.to === workflow_state
        );
        if (!isAllowed && currentState !== workflow_state) {
          res.status(403).json({ 
            message: 'No tienes permiso para realizar esta transición de estado' 
          });
          return;
        }
      }
    }

    // Calcular el deadline automáticamente según el tipo de contenido
    let newDeadline = null;
    if (startDate) {
      newDeadline = getDeadlineForState(startDate, contentType, workflow_state);
    }

    // Actualizar estado y deadline
    const updateQuery = newDeadline 
      ? 'UPDATE campaign_actions SET workflow_state = ?, deadline_date = ? WHERE id = ?'
      : 'UPDATE campaign_actions SET workflow_state = ? WHERE id = ?';
    
    const updateParams = newDeadline 
      ? [workflow_state, newDeadline, id]
      : [workflow_state, id];

    const [result] = await pool.query<ResultSetHeader>(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Tarea no encontrada' });
      return;
    }

    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
};

/**
 * Actualizar el responsable de diseño
 */
export const updateDesignResponsible = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { design_responsible } = req.body;

    if (!design_responsible || !['propio', 'cliente'].includes(design_responsible)) {
      res.status(400).json({ message: 'Responsable de diseño inválido' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE campaign_actions SET design_responsible = ? WHERE id = ?',
      [design_responsible, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Tarea no encontrada' });
      return;
    }

    res.json({ message: 'Responsable de diseño actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar responsable de diseño:', error);
    res.status(500).json({ message: 'Error al actualizar responsable de diseño' });
  }
};

/**
 * Actualizar la fecha límite
 */
export const updateDeadline = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { deadline_date } = req.body;

    if (!deadline_date) {
      res.status(400).json({ message: 'Fecha límite requerida' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE campaign_actions SET deadline_date = ? WHERE id = ?',
      [deadline_date, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Tarea no encontrada' });
      return;
    }

    res.json({ message: 'Fecha límite actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar fecha límite:', error);
    res.status(500).json({ message: 'Error al actualizar fecha límite' });
  }
};

/**
 * Recalcular y actualizar deadlines automáticos para todas las tareas
 */
export const recalculateDeadlines = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Obtener todas las tareas de newsletter (artículo técnico)
    const [tasks] = await pool.query<RowDataPacket[]>(`
      SELECT id, start_date, content_type, workflow_state
      FROM campaign_actions
      WHERE action_id IN (34, 38) 
        AND content_type = 'articulo_tecnico'
        AND start_date IS NOT NULL
    `);

    let updated = 0;
    
    for (const task of tasks) {
      const deadline = getDeadlineForState(
        task.start_date, 
        task.content_type, 
        task.workflow_state
      );
      
      if (deadline) {
        await pool.query(
          'UPDATE campaign_actions SET deadline_date = ? WHERE id = ?',
          [deadline, task.id]
        );
        updated++;
      }
    }

    res.json({ 
      message: `Deadlines recalculados correctamente`,
      updated,
      total: tasks.length
    });
  } catch (error) {
    console.error('Error al recalcular deadlines:', error);
    res.status(500).json({ message: 'Error al recalcular deadlines' });
  }
};

/**
 * Actualizar el link de la newsletter publicada (post-venta)
 */
export const updateNewsletterLink = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newsletter_link } = req.body;
    const userRoles = req.user?.roles || [];

    const isPostVenta = userRoles.includes('post-venta');
    const isAdmin = userRoles.includes('admin');

    if (!isPostVenta && !isAdmin) {
      res.status(403).json({ message: 'Solo post-venta puede actualizar el link de la newsletter' });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE campaign_actions SET newsletter_link = ? WHERE id = ?',
      [newsletter_link || null, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Tarea no encontrada' });
      return;
    }

    res.json({ message: 'Link de newsletter actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar link de newsletter:', error);
    res.status(500).json({ message: 'Error al actualizar link de newsletter' });
  }
};

/**
 * Actualizar la fecha de publicación del post en RRSS (post-venta)
 */
export const updateRRSSPublication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rrss_publication_date, rrss_link } = req.body;
    const userRoles = req.user?.roles || [];

    const isPostVenta = userRoles.includes('post-venta');
    const isAdmin = userRoles.includes('admin');

    if (!isPostVenta && !isAdmin) {
      res.status(403).json({ message: 'Solo post-venta puede actualizar la publicación en RRSS' });
      return;
    }

    let updateFields = [];
    let updateParams: any[] = [];

    if (rrss_publication_date !== undefined) {
      updateFields.push('rrss_publication_date = ?');
      updateParams.push(rrss_publication_date ? rrss_publication_date.split('T')[0] : null);
    }
    if (rrss_link !== undefined) {
      updateFields.push('rrss_link = ?');
      updateParams.push(rrss_link || null);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ message: 'No se proporcionaron campos para actualizar' });
      return;
    }

    updateParams.push(id);
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE campaign_actions SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Tarea no encontrada' });
      return;
    }

    res.json({ message: 'Publicación RRSS actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar publicación RRSS:', error);
    res.status(500).json({ message: 'Error al actualizar publicación RRSS' });
  }
};
