-- Actualizar ENUM deadline_type eliminando book_assembly y dividiendo changes
ALTER TABLE magazine_deadline_confirmations 
MODIFY COLUMN deadline_type ENUM(
  'client', 
  'send_to_edition', 
  'edition', 
  'changes_commercial', 
  'changes_post_sale'
) NOT NULL;

-- Añadir campos para link de publicación y estado de completado
ALTER TABLE magazine_editions
ADD COLUMN publication_link VARCHAR(500) NULL AFTER description,
ADD COLUMN is_completed BOOLEAN DEFAULT FALSE AFTER publication_link;
