-- Migration: Add client_post_sale to magazine_deadline_confirmations enum
-- Date: 2026-02-11
-- Description: Adds double confirmation for magazine ads (comercial + post-venta)

ALTER TABLE magazine_deadline_confirmations 
MODIFY COLUMN deadline_type ENUM(
  'client', 
  'send_to_edition', 
  'edition', 
  'changes_commercial', 
  'changes_post_sale',
  'client_post_sale'
) NOT NULL;
