-- Add region column to mediums table
ALTER TABLE mediums ADD COLUMN region VARCHAR(50) NULL AFTER name;

-- Update existing mediums with their regions
UPDATE mediums SET region = 'Spain' WHERE name LIKE '%España%' OR name LIKE '%Spain%';
UPDATE mediums SET region = 'International' WHERE name LIKE '%Internacional%' OR name LIKE '%International%';
UPDATE mediums SET region = 'Latam' WHERE name LIKE '%Latam%' OR name LIKE '%Latinoamérica%';

-- Show result
SELECT id, name, region FROM mediums;
