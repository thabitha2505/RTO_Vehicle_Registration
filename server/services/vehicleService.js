const db=require('../config/db');

function isValidChassis(chassis_no) {
    const chck_valid = /^[A-HJ-NPR-Z0-9]{17}$/;
    return chck_valid.test(chassis_no);
}


// function getNextSeries(currentSeries) {
//     const [first, second] = currentSeries.toUpperCase().split('');
//     let nextFirst = first.charCodeAt(0);
//     let nextSecond = second.charCodeAt(0);

//     if (nextSecond === 90) { 
//         nextSecond = 65; 
//         nextFirst++;
//     } else {
//         nextSecond++;
//     }

//     if (nextFirst > 90) throw new Error("Series limit exceeded (ZZ)");

//     return String.fromCharCode(nextFirst) + String.fromCharCode(nextSecond);
// }

// async function generateRegNo() {
//     return new Promise((resolve, reject) => {
//         db.query('SELECT * FROM reg_tracker ORDER BY id DESC LIMIT 1', async (err, results) => {
//             if (err) return reject(err);
//             let { series, number } = results[0];

//             number++;
//             if (number > 9999) {
//                 series = getNextSeries(series);
//                 number = 1;
//             }

//             const formattedNum = String(number).padStart(4, '0');
//             const regNo = `TN37${series}${formattedNum}`;

//             db.query('UPDATE reg_tracker SET series = ?, number = ?', [series, number], (err) => {
//                 if (err) return reject(err);
//                 resolve(regNo);
//             });
//         });
//     });
// }


exports.registrationVehicle = async (vehicleData, identityProofPath, addrProofPath) => {
    return new Promise((resolve, reject) => {
        const {
            owner_id, vehicle_name, vehicle_brand, vehicle_model, vehicle_invoice,
            chassis_no, color, engine_capacity, mileage, engine_no, fuel_type, no_of_seats,
            vehicle_usage_type, reg_date, reg_exp_date, FC_expiry_date, insurance_validity,
            body_type, lorry_type, container_capacity, tanker_capacity,
            bus_seating_type, ac_type, vehicle_class, road_tax
        } = vehicleData;

        const insertQuery = `
            INSERT INTO vehicle (
                owner_id, reg_date, reg_exp_date, FC_expiry_date, insurance_validity,
                vehicle_name, vehicle_brand, vehicle_model, vehicle_invoice,
                chassis_no, color, engine_capacity, mileage, engine_no, fuel_type, no_of_seats, vehicle_usage_type,
                body_type, lorry_type, container_capacity, tanker_capacity,
                bus_seating_type, ac_type, vehicle_class, road_tax,
                identity_proof, addr_proof
            )
            VALUES (
                ?, ?, ?, ?, 
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?
            )
        `;

        const values = [
            owner_id, reg_date, reg_exp_date, FC_expiry_date, insurance_validity,
            vehicle_name, vehicle_brand, vehicle_model, vehicle_invoice,
            chassis_no, color, engine_capacity, mileage, engine_no, fuel_type, no_of_seats, vehicle_usage_type,
            body_type || null, lorry_type || null, container_capacity || null, tanker_capacity || null,
            bus_seating_type || null, ac_type || null, vehicle_class, road_tax,
            identityProofPath, addrProofPath
        ];

        db.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error("Insert Query Error:", err.message);
                return reject(err);
            }

            const vehicleId = result.insertId;

            const reportQuery = `
                INSERT INTO report(vehicle_id, issued_date, verification_status)
                VALUES (?, NOW(), 'Pending')
            `;

            db.query(reportQuery, [vehicleId], (err2) => {
                if (err2) return reject(err2);
                resolve({ vehicle_id: vehicleId });
            });
        });
    });
};



exports.allVehicles = async (userId) => {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT 
                u.name AS owner_name,
                v.vehicle_id,
                v.vehicle_name,
                v.vehicle_brand,
                v.vehicle_model,
                v.color,
                v.engine_capacity,
                v.mileage,
                v.engine_no,
                v.chassis_no,
                v.fuel_type,
                v.no_of_seats,
                v.vehicle_usage_type,
                v.vehicle_class,
                v.body_type,
                v.lorry_type,
                v.container_capacity,
                v.tanker_capacity,
                v.bus_seating_type,
                v.ac_type,
                v.road_tax,
                v.reg_date,
                v.reg_exp_date,
                v.FC_expiry_date,
                v.insurance_validity,
                r.verification_status
            FROM VEHICLE v
            JOIN USERS u ON v.owner_id = u.user_id
            LEFT JOIN REPORT r ON v.vehicle_id = r.vehicle_id
        `;

        const params = [];
        if (userId) {
            query += ` WHERE v.owner_id = ?`;
            params.push(userId);
        }

        db.query(query, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// exports.generateRegNo=generateRegNo;
exports.isValidChassis=isValidChassis;