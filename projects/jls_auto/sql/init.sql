-- login to mariadb using: sudo mysql
-- source this script using: source init.sql
-- source your reset file: source reset-data.sql

DROP DATABASE IF EXISTS scrapdb;
CREATE DATABASE scrapdb;

-- Use the correct database name in the GRANT statement
DROP USER IF EXISTS 'metaluser'@localhost;
CREATE USER 'metaluser'@localhost IDENTIFIED BY 'metalpw';

-- Use the correct database name in the GRANT statement
GRANT ALL PRIVILEGES ON scrapdb.* TO 'metaluser'@localhost IDENTIFIED BY 'metalpw';
FLUSH PRIVILEGES;

-- Use the correct database name in the SHOW GRANTS statement
SHOW GRANTS FOR 'metaluser'@localhost;