-- ─────────────────────────────────────────────────────────────────────────────
-- AutoAuction LT — MySQL Database Setup
-- Vytautas Magnus University — Term Paper by Fazle Rabbi Mahim
--
-- Run this ONCE before starting Django for the first time:
--   mysql -u root -p < setup_db.sql
-- ─────────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS autoauction_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'autoauction_user'@'localhost'
  IDENTIFIED BY 'StrongPassword123!';

GRANT ALL PRIVILEGES ON autoauction_db.*
  TO 'autoauction_user'@'localhost';

FLUSH PRIVILEGES;

SELECT 'Database autoauction_db created successfully.' AS status;
