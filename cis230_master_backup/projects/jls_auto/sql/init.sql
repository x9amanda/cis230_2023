/* login to mariadb using: sudo mysql */
/* source this script using: source init.sql */
/* source your reset file: source reset-data.sql */

DROP DATABASE IF EXISTS scrapmetal;
CREATE DATABASE 'metaldb';

DROP USER IF EXISTS 'metaluser'@localhost;
CREATE USER 'metaluser'@localhost IDENTIFIED BY 'metalpw';

/* SELECT User FROM mysql.user WHERE User = 'week6user'; */

GRANT ALL PRIVILEGES ON 'metaldb'.* TO 'metaluser'@localhost IDENTIFIED BY 'metalpw';
FLUSH PRIVILEGES;

SHOW GRANTS FOR 'metaluser'@localhost;