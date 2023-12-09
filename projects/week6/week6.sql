CREATE DATABASE week6db;

USE week6db;

CREATE OR REPLACE TABLE week6 (
    Make VARCHAR(255),
    Model VARCHAR(255),
    Year INTEGER,
    Engine DECIMAL(4, 2),
    Manufacture_Date DATE,
);

-- Insert 10 lines of data
INSERT INTO week6 (Make, Model, Year, Engine, Manufacture_Date, ) VALUES
    ('Toyota', 'Camry', 2019, 2.5, '2019-05-15'),
    ('Ford', 'Mustang', 2020, 5.0, '2020-08-20'),
    ('Honda', 'Civic', 2018, 1.8, '2018-03-10'),
    ('Chevrolet', 'Silverado', 2021, 6.2, '2021-02-25'),
    ('BMW', 'X5', 2017, 3.0, '2017-11-12'),
    ('Audi', 'A4', 2019, 2.0, '2019-07-30'),
    ('Nissan', 'Altima', 2022, 2.5, '2022-04-05'),
    ('Mercedes-Benz', 'C-Class', 2020, 2.0, '2020-10-18'),
    ('Hyundai', 'Elantra', 2021, 2.0, '2021-09-03'),
    ('Kia', 'Sorento', 2019, 3.3, '2019-06-28');