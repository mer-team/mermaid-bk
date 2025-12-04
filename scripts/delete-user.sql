-- Delete user by email
DELETE FROM "Users" WHERE email = 'admin@admin.com';

-- Or delete by ID
-- DELETE FROM "Users" WHERE id = 1;

-- Verify deletion
SELECT * FROM "Users" WHERE email = 'admin@admin.com';

-- Manually confirm user (bypass email confirmation)
UPDATE "Users" SET confirmed = true WHERE email = 'admin@mermaid.com';

-- Set user as admin
UPDATE "Users" SET admin = true WHERE email = 'admin@mermaid.com';

-- Or by ID
UPDATE "Users" SET admin = true WHERE id = 2;

-- Verify admin status
SELECT id, email, name, admin, confirmed FROM "Users" WHERE email = 'admin@mermaid.com';
