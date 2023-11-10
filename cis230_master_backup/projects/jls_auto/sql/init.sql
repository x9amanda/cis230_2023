/* login to mariadb using: sudo mysql */
/* source this script using: source init.sql */
/* source your reset file: source reset-data.sql */

DROP DATABASE IF EXISTS week6db;
CREATE DATABASE 'week6db';

DROP USER IF EXISTS 'week6user'@localhost;
CREATE USER 'week6user'@localhost IDENTIFIED BY 'week6pw';

/* SELECT User FROM mysql.user WHERE User = 'week6user'; */

GRANT ALL PRIVILEGES ON 'week6db'.* TO 'week6user'@localhost IDENTIFIED BY 'week6pw';
FLUSH PRIVILEGES;

SHOW GRANTS FOR 'week6user'@localhost;