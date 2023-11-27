USE metaldbdb;

/* SHOW DATABASES; */

CREATE OR REPLACE TABLE log_in
(
  username VARCHAR(50) NULL,
  password VARCHAR(50) NULL
);
/* INSERTS WILL GO HERE... FOR EXAMPLE... */
INSERT INTO log_in values ('metaluser', 'metalpw');


CREATE OR REPLACE TABLE vehicles (
    id      INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    year    VARCHAR(30) NOT NULL,
    make   VARCHAR(20) NOT NULL,
    model  VARCHAR(20) NOT NULL,
    engine  VARCHAR(10) NOT NULL,
    GVW   decimal(10,2) NOT NULL,
);

/* INSERTS WILL GO HERE */
insert into vehicles(year, make, model, engine, GVW)
values (

);