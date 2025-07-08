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
drop column payment_status;

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
select * from fancy_numbers;


SET SQL_SAFE_UPDATES = 0;
DELETE FROM vehicle;
SET SQL_SAFE_UPDATES = 1;  


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

INSERT INTO vehicle_details(veh_brand, veh_name, veh_type, engine_capacity, fuel_type, no_of_seats, engine_no_prefix, chassis_no_prefix) VALUES
('Ashok Leyland', 'Boss 1115 HB', '4-wheeler', '3839cc', 'Diesel', 2, 'H6ET1', 'MB1'),
('Tata', 'LPT 1613', '4-wheeler', '5675cc', 'Diesel', 2, '697TC', 'MAT'),
('Eicher', 'Pro 3015', '4-wheeler', '3760cc', 'Diesel', 2, 'E474', 'MBN'),

('Tata', 'Starbus 52-Seater', '4-wheeler', '5883cc', 'Diesel', 52, '5.9LTCIC', 'MAT'),
('Ashok Leyland', 'Viking 40-Seater', '4-wheeler', '5660cc', 'Diesel', 40, 'H6ET1', 'MB1'),
('Eicher', 'Skyline 20.15', '4-wheeler', '3770cc', 'Diesel', 32, 'E483', 'MBN');



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

ALTER TABLE vehicle_details
ADD COLUMN vehicle_model VARCHAR(50),
ADD COLUMN color VARCHAR(30);


UPDATE vehicle_details SET vehicle_model = '2023', color = 'Blue' 
WHERE veh_name = 'Baleno Zeta';

UPDATE vehicle_details SET vehicle_model = '2022', color = 'White' 
WHERE veh_name = 'i20 Sportz';

UPDATE vehicle_details SET vehicle_model = '2023', color = 'Black' 
WHERE veh_name = 'Activa 6G';

UPDATE vehicle_details SET vehicle_model = '2023', color = 'Red' 
WHERE veh_name = 'Pulsar 150';

UPDATE vehicle_details SET vehicle_model = '2022', color = 'Grey' 
WHERE veh_name = 'Apache RTR 160';

UPDATE vehicle_details SET vehicle_model = '2023', color = 'Black' 
WHERE veh_name = 'Splendor Plus';

UPDATE vehicle_details SET vehicle_model = '2024', color = 'White' 
WHERE veh_name = 'Nexon EV';

UPDATE vehicle_details SET vehicle_model = '2023', color = 'Silver' 
WHERE veh_name = 'Bolero';

UPDATE vehicle_details SET vehicle_model = '2023', color = 'Blue' 
WHERE veh_name = 'Seltos HTX';

UPDATE vehicle_details SET vehicle_model = '2023', color = 'Green' 
WHERE veh_name = 'Classic 350';

UPDATE vehicle_details SET vehicle_model = '2022', color = 'White' 
WHERE veh_name = 'Boss 1115 HB';

UPDATE vehicle_details SET vehicle_model = '2022', color = 'Orange' 
WHERE veh_name = 'LPT 1613';

UPDATE vehicle_details SET vehicle_model = '2023', color = 'Yellow' 
WHERE veh_name = 'Pro 3015';

UPDATE vehicle_details SET vehicle_model = '2023', color = 'Green' 
WHERE veh_name = 'Starbus 52-Seater';

UPDATE vehicle_details SET vehicle_model = '2023', color = 'Blue' 
WHERE veh_name = 'Viking 40-Seater';

UPDATE vehicle_details SET vehicle_model = '2022', color = 'White' 
WHERE veh_name = 'Skyline 20.15';


ALTER TABLE vehicle
ADD COLUMN reg_no VARCHAR(15) UNIQUE DEFAULT NULL,
ADD COLUMN number_type ENUM('normal', 'fancy') NOT NULL,
ADD COLUMN fancy_number_id INT DEFAULT NULL,
ADD CONSTRAINT fk_fancy_number
  FOREIGN KEY (fancy_number_id) REFERENCES fancy_numbers(id);


CREATE TABLE fancy_numbers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_no VARCHAR(20) UNIQUE NOT NULL,
  category ENUM('VIP', 'Premium', 'Custom') NOT NULL,
  reserved BOOLEAN DEFAULT FALSE,
  reserved_at TIMESTAMP NULL,
  reserved_by INT, -- FK to vehicle.owner_id
  vehicle_id INT,  -- FK to vehicle.vehicle_id
  FOREIGN KEY (reserved_by) REFERENCES users(user_id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id)
);

INSERT INTO fancy_numbers (vehicle_no, category)
VALUES 
  ('TN01AB0001', 'VIP'),
  ('TN01AB0002', 'VIP'),
  ('TN01AB0009', 'VIP'),
  ('TN01AB1111', 'Premium'),
  ('TN01AB2222', 'Premium'),
  ('TN01AB7777', 'Premium'),
  ('TN01AB1', 'Custom'),
  ('TN01AB44', 'Custom'),
  ('TN01AB333', 'Custom'),
  ('TN01AB9119', 'Custom'),
  ('TN01AB7222', 'Custom');


ALTER TABLE vehicle
ADD COLUMN passport_photo VARCHAR(255),
ADD COLUMN photo_front VARCHAR(255),
ADD COLUMN photo_left VARCHAR(255),
ADD COLUMN photo_right VARCHAR(255),
ADD COLUMN photo_back VARCHAR(255);


-- Maruti Suzuki
INSERT INTO vehicle_details VALUES
('Maruti Suzuki', 'Baleno Zeta', '4-wheeler', '1197cc', 'Petrol', 5, 'K12N', 'MA3', '2023', 'Blue'),
('Maruti Suzuki', 'Swift VXi', '4-wheeler', '1197cc', 'Petrol', 5, 'K12M', 'MA3', '2022', 'Red'),
('Maruti Suzuki', 'Wagon R', '4-wheeler', '998cc', 'Petrol', 5, 'K10B', 'MA3', '2023', 'Silver'),
('Maruti Suzuki', 'Ertiga VXi', '4-wheeler', '1462cc', 'Petrol', 7, 'K15C', 'MA3', '2024', 'White');

-- Hyundai
INSERT INTO vehicle_details VALUES
('Hyundai', 'i20 Sportz', '4-wheeler', '1197cc', 'Petrol', 5, 'G4FG', 'MAL', '2022', 'White'),
('Hyundai', 'Venue SX', '4-wheeler', '998cc', 'Petrol', 5, 'G3LC', 'MAL', '2023', 'Grey'),
('Hyundai', 'Creta EX', '4-wheeler', '1497cc', 'Diesel', 5, 'U2CRDi', 'MAL', '2023', 'Black'),
('Hyundai', 'Aura S', '4-wheeler', '1197cc', 'Petrol', 5, 'G4FA', 'MAL', '2024', 'Red');

-- Honda
INSERT INTO vehicle_details VALUES
('Honda', 'Activa 6G', '2-wheeler', '109cc', 'Petrol', 2, 'JF90E', 'ME4', '2023', 'Black'),
('Honda', 'Shine 125', '2-wheeler', '124cc', 'Petrol', 2, 'JF35E', 'ME4', '2023', 'Blue'),
('Honda', 'Dio', '2-wheeler', '109cc', 'Petrol', 2, 'JF06E', 'ME4', '2022', 'Yellow'),
('Honda', 'CB350 Hness', '2-wheeler', '348cc', 'Petrol', 2, 'NC55E', 'ME4', '2024', 'Green');

-- Bajaj
INSERT INTO vehicle_details VALUES
('Bajaj', 'Pulsar 150', '2-wheeler', '149cc', 'Petrol', 2, 'DHLD', 'MD2', '2023', 'Red'),
('Bajaj', 'Pulsar NS200', '2-wheeler', '199cc', 'Petrol', 2, 'DVZZ', 'MD2', '2024', 'White'),
('Bajaj', 'CT100', '2-wheeler', '99cc', 'Petrol', 2, 'DHTL', 'MD2', '2022', 'Black'),
('Bajaj', 'Dominar 400', '2-wheeler', '373cc', 'Petrol', 2, 'DOME', 'MD2', '2023', 'Green');

-- TVS
INSERT INTO vehicle_details VALUES
('TVS', 'Apache RTR 160', '2-wheeler', '159cc', 'Petrol', 2, 'NF', 'MD6', '2022', 'Grey'),
('TVS', 'Ntorq 125', '2-wheeler', '124cc', 'Petrol', 2, 'NTQ1', 'MD6', '2023', 'Blue'),
('TVS', 'Sport', '2-wheeler', '99cc', 'Petrol', 2, 'SPT1', 'MD6', '2022', 'Red'),
('TVS', 'Jupiter ZX', '2-wheeler', '110cc', 'Petrol', 2, 'JUP2', 'MD6', '2024', 'Black');

-- Hero
INSERT INTO vehicle_details VALUES
('Hero', 'Splendor Plus', '2-wheeler', '97cc', 'Petrol', 2, 'HF', 'MBL', '2023', 'Black'),
('Hero', 'Glamour Xtec', '2-wheeler', '124cc', 'Petrol', 2, 'GLM1', 'MBL', '2022', 'Blue'),
('Hero', 'HF Deluxe', '2-wheeler', '97cc', 'Petrol', 2, 'HFDX', 'MBL', '2023', 'Red'),
('Hero', 'Xpulse 200T', '2-wheeler', '199cc', 'Petrol', 2, 'XP200', 'MBL', '2024', 'White');

-- Tata
INSERT INTO vehicle_details VALUES
('Tata', 'Nexon EV', '4-wheeler', 'EV', 'Electric', 5, 'EVTAT', 'MAT', '2024', 'White'),
('Tata', 'LPT 1613', '4-wheeler', '5675cc', 'Diesel', 2, '697TC', 'MAT', '2022', 'Orange'),
('Tata', 'Tiago XE', '4-wheeler', '1199cc', 'Petrol', 5, 'REVTR', 'MAT', '2023', 'Silver'),
('Tata', 'Starbus 52-Seater', '4-wheeler', '5883cc', 'Diesel', 52, '5.9LTCIC', 'MAT', '2023', 'Green');

-- Mahindra
INSERT INTO vehicle_details VALUES
('Mahindra', 'Bolero', '4-wheeler', '1493cc', 'Diesel', 7, 'MHAWK', 'MA1', '2023', 'Silver'),
('Mahindra', 'Thar LX', '4-wheeler', '2184cc', 'Diesel', 4, 'MHCRD', 'MA1', '2024', 'Black'),
('Mahindra', 'XUV300', '4-wheeler', '1497cc', 'Diesel', 5, 'MHXUV', 'MA1', '2023', 'White'),
('Mahindra', 'Jeeto Plus', '4-wheeler', '625cc', 'Petrol', 2, 'JEE25', 'MA1', '2022', 'Red');

-- Kia
INSERT INTO vehicle_details VALUES
('Kia', 'Seltos HTX', '4-wheeler', '1497cc', 'Petrol', 5, 'G4FL', 'MZB', '2023', 'Blue'),
('Kia', 'Sonet GTX+', '4-wheeler', '1493cc', 'Diesel', 5, 'GTXP', 'MZB', '2024', 'Grey'),
('Kia', 'Carens Prestige', '4-wheeler', '1497cc', 'Petrol', 7, 'CRNS1', 'MZB', '2023', 'White'),
('Kia', 'EV6', '4-wheeler', 'EV', 'Electric', 5, 'EVKIA', 'MZB', '2023', 'Black');

-- Royal Enfield
INSERT INTO vehicle_details VALUES
('Royal Enfield', 'Classic 350', '2-wheeler', '349cc', 'Petrol', 2, 'UCE', 'ME3', '2023', 'Green'),
('Royal Enfield', 'Hunter 350', '2-wheeler', '349cc', 'Petrol', 2, 'UCEO', 'ME3', '2023', 'Grey'),
('Royal Enfield', 'Himalayan 450', '2-wheeler', '452cc', 'Petrol', 2, 'HIMX', 'ME3', '2024', 'White'),
('Royal Enfield', 'Meteor 350', '2-wheeler', '349cc', 'Petrol', 2, 'MT350', 'ME3', '2022', 'Red');

-- Ashok Leyland
INSERT INTO vehicle_details VALUES
('Ashok Leyland', 'Boss 1115 HB', '4-wheeler', '3839cc', 'Diesel', 2, 'H6ET1', 'MB1', '2022', 'White'),
('Ashok Leyland', 'Viking 40-Seater', '4-wheeler', '5660cc', 'Diesel', 40, 'H6ET1', 'MB1', '2023', 'Blue'),
('Ashok Leyland', 'Dost Plus', '4-wheeler', '1478cc', 'Diesel', 2, 'DOST', 'MB1', '2023', 'Silver'),
('Ashok Leyland', 'Ecomet 1215', '4-wheeler', '3839cc', 'Diesel', 2, 'ECMT1', 'MB1', '2023', 'Yellow');

-- Eicher
INSERT INTO vehicle_details VALUES
('Eicher', 'Pro 3015', '4-wheeler', '3760cc', 'Diesel', 2, 'E474', 'MBN', '2023', 'Yellow'),
('Eicher', 'Skyline 20.15', '4-wheeler', '3770cc', 'Diesel', 32, 'E483', 'MBN', '2022', 'White'),
('Eicher', 'Pro 2049', '4-wheeler', '2000cc', 'Diesel', 2, 'E204', 'MBN', '2023', 'Red'),
('Eicher', 'Pro 6028', '4-wheeler', '7698cc', 'Diesel', 2, 'E602', 'MBN', '2024', 'Green');


select * from vehicle;
select * from payments;
select * from fancy_numbers;

ALTER TABLE vehicle ADD COLUMN payment_status ENUM('Pending', 'Paid') DEFAULT 'Pending';

ALTER TABLE vehicle ADD COLUMN rc_generated VARCHAR(255) DEFAULT null;


ALTER TABLE vehicle_details
ADD COLUMN reg_fee INT;

-- 2-wheelers (Bikes, Scooters)
UPDATE vehicle_details SET reg_fee = 300 WHERE veh_type = '2-wheeler';

-- 4-wheelers (Cars, LMV)
UPDATE vehicle_details 
SET reg_fee = 500 
WHERE veh_type = '4-wheeler' AND no_of_seats <= 7 AND engine_capacity NOT LIKE '%5%cc%'; -- Rough filter for LMV cars

-- Lorry (commercial heavy goods)
UPDATE vehicle_details 
SET reg_fee = 1500 
WHERE veh_name LIKE '%LPT%' OR veh_name LIKE '%Boss%' OR veh_name LIKE '%Pro%';

-- Bus (commercial heavy passenger)
UPDATE vehicle_details 
SET reg_fee = 2000 
WHERE veh_name LIKE '%Starbus%' OR veh_name LIKE '%Skyline%' OR veh_name LIKE '%Viking%';


-- fro jeeto plus mahindra 
UPDATE vehicle_details
SET reg_fee = 500
WHERE veh_name = 'Jeeto Plus' AND veh_brand = 'Mahindra';



CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT,
    owner_id INT,
    amount DECIMAL(10, 2),
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Success', 'Pending', 'Failed') DEFAULT 'Success'
);


select * from vehicle_details where veh_brand='Eicher';

select * from payments;
DESCRIBE payments;

delete from payments;

