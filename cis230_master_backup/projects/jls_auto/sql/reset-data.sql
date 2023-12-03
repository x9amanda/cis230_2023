USE scrapdb;

CREATE TABLE IF NOT EXISTS log_in (
  username VARCHAR(50) NULL,
  password VARCHAR(50) NULL
);

INSERT INTO log_in VALUES ('metaluser', 'metalpw');

CREATE TABLE IF NOT EXISTS vehicles (
    year        VARCHAR(30) NOT NULL,
    make        VARCHAR(20) NOT NULL,
    model       VARCHAR(20) NOT NULL,
    specs       VARCHAR(1000) NULL,
    curb_weight DECIMAL(10,2) NOT NULL
);

LOAD DATA LOCAL INFILE './year-make-model-specs-curbweight.csv'
INTO TABLE vehicles
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;