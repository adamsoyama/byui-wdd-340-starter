-- Insert new record to acount table
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');


-- Modify Tony Stark record to change account_type to Admin
UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- Delete Tony Stark record from database
DELETE FROM account
WHERE account_email = 'tony@starkent.com';

-- Update "GM HUmmer" description to read "huge interior" rather than "small interior"
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Retreive the make and model from the inventory table, along with the classification_name from the classification table only for vehicles in the "Sport" category,
SELECT 
  inventory.inv_make, 
  inventory.inv_model, 
  classification.classification_name
FROM 
  inventory
INNER JOIN 
  classification 
ON 
  inventory.classification_id = classification.classification_id
WHERE 
  classification.classification_name = 'Sport';

-- update all records in the inventory table and insert /vehicles in the middle of the file path for both the inv_image and inv_thumbnail columns
UPDATE inventory
SET 
  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
