CREATE DATABASE 'week6db';

USE week6db;

/* SHOW DATABASES; */

CREATE OR REPLACE TABLE log_in
(
  username VARCHAR(50) NULL,
  password VARCHAR(50) NULL
);
/* INSERTS WILL GO HERE... FOR EXAMPLE... */
INSERT INTO log_in values ('eipp', 'not_enctrypted_pw');


CREATE OR REPLACE TABLE myimages (
    id      INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(30) NOT NULL,
    image   LONGBLOB NOT NULL,
    typeid  VARCHAR(20) NOT NULL,
    price   decimal(10,2) NOT NULL,
    size    varchar(25) NOT NULL,
    color   varchar(50) NOT NULL
);

/* INSERTS WILL GO HERE... FOR EXAMPLE... */
insert into myimages(name, image, typeid, price, size, color)
values (
    'My Fave Chair', 
    '/path/to/the/image.jpg', 
    'Chair', 
    1000.00, 
    'Large', 
    'Green'
);