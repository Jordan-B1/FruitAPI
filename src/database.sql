CREATE DATABASE fruits;

-- \c into fruits

CREATE TYPE SHAPE AS ENUM('straight', 'round', 'curve');

CREATE TABLE fruit(
    _id SERIAL PRIMARY KEY,
    _name VARCHAR(255),
    _look SHAPE,
    _lengthcm SMALLINT,
    _description VARCHAR(255)
);