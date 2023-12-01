USE scrapdb;

CREATE OR REPLACE TABLE log_in
(
  username VARCHAR(50) NULL,
  password VARCHAR(50) NULL
);

INSERT INTO log_in VALUES ('metaluser', 'metalpw');


CREATE OR REPLACE TABLE vehicles (
    id      INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    year    VARCHAR(30) NOT NULL,
    make    VARCHAR(20) NOT NULL,
    model   VARCHAR(20) NOT NULL,
    curb_weight     DECIMAL(10,2) NOT NULL
);

INSERT INTO vehicles (year, make, model, curb_weight)
VALUES (2018, 'jeep', 'compass', 4561.23);