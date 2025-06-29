create database rto_db;
use rto_db;

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role ENUM('admin', 'customer'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

alter table users
add column phone_no varchar(15) not null unique,
add constraint check_phone_no check(phone_no REGEXP '^[0-9]{10,15}$');

insert into users(name,email,password,phone_no,role) values
('admin1', 'admin1@gmail.com', '$2b$10$8v2SSENxrwKCUP0W1DNsMeDAFJ6Gb7QdnplUqzKxnrujEK01LVtna','9999222201', 'admin');

UPDATE users 
SET password = '$2b$10$DR513yOaev7CzvdvujB69uw1evmHtr4eJq59CpgSO/Vef69DzreU.' 
WHERE email = 'admin1@gmail.com';

CREATE TABLE vehicle (
    vehicle_id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT,  
    reg_no VARCHAR(20) UNIQUE,
    reg_date DATE,
    vehicle_name VARCHAR(100),
    vehicle_type ENUM('2-wheeler', '4-wheeler'),
    vehicle_brand VARCHAR(100),
    chassis_no VARCHAR(50),
    color VARCHAR(50),
    engine_capacity VARCHAR(50),
    mileage VARCHAR(50),
    license_doc VARCHAR(255),     
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

alter table vehicle
add constraint unique_chassis unique(chassis_no);

CREATE TABLE report (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    issued_date DATE,
    verification_status ENUM('Pending', 'Approved', 'Rejected'),
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE CASCADE
);

ALTER TABLE report 
ADD CONSTRAINT unique_vehicle_report UNIQUE(vehicle_id);

select * from users;
select * from vehicle;
select * from report;
select * from reg_tracker;
select * from vehicle_details;

SET SQL_SAFE_UPDATES = 0;
DELETE FROM vehicle;
SET SQL_SAFE_UPDATES = 1;  

alter table vehicle
drop column addr_proof;

ALTER TABLE vehicle
ADD COLUMN reg_no VARCHAR(20) UNIQUE AFTER owner_id;

ALTER TABLE vehicle
ADD COLUMN mileage INT,
ADD COLUMN engine_no VARCHAR(50) UNIQUE NOT NULL,
ADD COLUMN fuel_type ENUM('Petrol', 'Diesel', 'Electric', 'CNG') NOT NULL,
ADD COLUMN no_of_seats INT CHECK (no_of_seats > 0),
ADD COLUMN reg_exp_date DATE,
ADD COLUMN FC_date DATE,
ADD COLUMN identity_proof varchar(255) NOT NULL,
ADD COLUMN addr_proof varchar(255) NOT NULL,
ADD COLUMN vehicle_usage_type ENUM('Private', 'Commercial') NOT NULL;

ALTER TABLE vehicle
ADD COLUMN engine_no VARCHAR(20) UNIQUE
CHECK (engine_no REGEXP '^[A-Z0-9]{6,17}$');

alter table vehicle
add column FC_expiry_date DATE;

alter table users
add column role ENUM('admin', 'owner')
after password;

CREATE TABLE reg_tracker (
    id INT PRIMARY KEY AUTO_INCREMENT,
    series VARCHAR(2) DEFAULT 'AA',
    number INT DEFAULT 0
);
INSERT INTO reg_tracker (series, number) VALUES ('AA', 0);

CREATE TABLE vehicle_details (
    veh_brand VARCHAR(100),
    veh_name VARCHAR(100), 
    veh_type ENUM('2-wheeler', '4-wheeler'),
    engine_capacity VARCHAR(50),
    fuel_type ENUM('Petrol', 'Diesel', 'Electric', 'CNG'),
    no_of_seats INT,
    engine_no_prefix VARCHAR(10),
    chassis_no_prefix VARCHAR(10)
);

INSERT INTO vehicle_details (veh_brand, veh_name, veh_type, engine_capacity, fuel_type, no_of_seats, engine_no_prefix, chassis_no_prefix) VALUES
('Maruti Suzuki', 'Baleno Zeta', '4-wheeler', '1197cc', 'Petrol', 5, 'K12N', 'MA3'),
('Hyundai', 'i20 Sportz', '4-wheeler', '1197cc', 'Petrol', 5, 'G4FG', 'MAL'),
('Honda', 'Activa 6G', '2-wheeler', '109cc', 'Petrol', 2, 'JF90E', 'ME4'),
('Bajaj', 'Pulsar 150', '2-wheeler', '149cc', 'Petrol', 2, 'DHLD', 'MD2'),
('TVS', 'Apache RTR 160', '2-wheeler', '159cc', 'Petrol', 2, 'NF', 'MD6'),
('Hero', 'Splendor Plus', '2-wheeler', '97cc', 'Petrol', 2, 'HF', 'MBL'),
('Tata', 'Nexon EV', '4-wheeler', 'EV', 'Electric', 5, 'EVTAT', 'MAT'),
('Mahindra', 'Bolero', '4-wheeler', '1493cc', 'Diesel', 7, 'MHAWK', 'MA1'),
('Kia', 'Seltos HTX', '4-wheeler', '1497cc', 'Petrol', 5, 'G4FL', 'MZB'),
('Royal Enfield', 'Classic 350', '2-wheeler', '349cc', 'Petrol', 2, 'UCE', 'ME3');


ALTER TABLE vehicle
ADD COLUMN vehicle_model YEAR,
ADD COLUMN vehicle_invoice VARCHAR(255),
ADD COLUMN body_type ENUM('Lorry', 'Bus') DEFAULT NULL,
ADD COLUMN lorry_type ENUM('Open Body', 'Container', 'Tanker') DEFAULT NULL,
ADD COLUMN container_capacity INT DEFAULT NULL, 
ADD COLUMN tanker_capacity INT DEFAULT NULL,   
ADD COLUMN bus_seating_type ENUM('Sleeper', 'Semi Sleeper') DEFAULT NULL,
ADD COLUMN ac_type ENUM('AC', 'NON-AC') DEFAULT NULL,
ADD COLUMN insurance_validity DATE,
ADD COLUMN vehicle_class ENUM('LMV', 'HMV'),
ADD COLUMN road_tax ENUM('LTT') DEFAULT 'LTT';

