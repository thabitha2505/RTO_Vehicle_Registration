const {registrationVehicle, allVehicles}=require('../services/vehicleService');
const vehicleService = require('../services/vehicleService');
const db=require('../config/db');
const moment=require('moment');

exports.registerVehicle = async (req, res) => {
    const { 
        chassis_no, engine_no, vehicle_usage_type, vehicle_brand, vehicle_name,
        body_type, lorry_type, container_capacity, tanker_capacity,
        bus_seating_type, ac_type, vehicle_class, road_tax, vehicle_model,
        number_type, fancy_number_id
    } = req.body;

    try {
        const vehicleData = req.body;
        const identityProofPath = req.files['identity_proof']?.[0]?.path || null;
        const addrProofPath = req.files['addr_proof']?.[0]?.path || null;
        const invoicePath = req.files['vehicle_invoice']?.[0]?.path || null;
        const passportPhoto = req.files['passport_photo']?.[0]?.path || null;
        const photoFront = req.files['photo_front']?.[0]?.path || null;
        const photoLeft = req.files['photo_left']?.[0]?.path || null;
        const photoRight = req.files['photo_right']?.[0]?.path || null;
        const photoBack = req.files['photo_back']?.[0]?.path || null;

        if (!identityProofPath || !addrProofPath || !invoicePath || !passportPhoto || !photoFront || !photoLeft || !photoRight || !photoBack) {
            return res.status(400).json({ message: 'Uploading files are required.' });
        }

        const verifyQuery = `
            SELECT * FROM vehicle_details 
            WHERE veh_brand = ? AND veh_name = ?
        `;

        db.query(verifyQuery, [vehicle_brand, vehicle_name], async (err, results) => {
            if (err) return res.status(500).json({ message: 'DB error while verifying vehicle details', error: err.message });

            if (results.length === 0) {
                return res.status(400).json({ message: 'Invalid vehicle brand or model' });
            }

        if (vehicle_usage_type === 'Commercial') {
            if (!body_type) {
                return res.status(400).json({ message: 'Body type is required for commercial vehicles.' });
            }

        if (body_type === 'Lorry') {
            if (!['open body', 'container', 'tanker'].includes(lorry_type)) {
                return res.status(400).json({ message: 'Invalid lorry type.' });
            }
            if (lorry_type === 'container' && !container_capacity) {
                return res.status(400).json({ message: 'Container capacity required.' });
            }
            if (lorry_type === 'tanker' && !tanker_capacity) {
                return res.status(400).json({ message: 'Tanker capacity required.' });
            }
        } else if (body_type === 'Bus') {
            if (!['sleeper', 'semi sleeper'].includes(bus_seating_type)) {
                return res.status(400).json({ message: 'Invalid bus seating type.' });
            }
            if (!['AC', 'NON-AC'].includes(ac_type)) {
                return res.status(400).json({ message: 'Invalid AC type.' });
            }
        }else {
            return res.status(400).json({ message: 'Invalid body type for commercial vehicle.' });
        } 
    }else {
        req.body.body_type = null;
        req.body.lorry_type = null;
        req.body.container_capacity = null;
        req.body.tanker_capacity = null;
        req.body.bus_seating_type = null;
        req.body.ac_type = null;
    }

        if (!['LMV', 'HMV'].includes(vehicle_class)) {
            return res.status(400).json({ message: 'Invalid vehicle class.' });
        }

        if (road_tax !== 'LTT') {
            return res.status(400).json({ message: 'Only LTT road tax allowed.' });
        }
        
        if (!/^\d{4}$/.test(vehicle_model)) {
            return res.status(400).json({ message: 'Invalid vehicle model year.' });
        }

            const vehicleInfo = results[0];
            if (!chassis_no.startsWith(vehicleInfo.chassis_no_prefix)) {
                return res.status(400).json({ message: 'Chassis number does not match expected prefix for this model' });
            }

            if (!engine_no.startsWith(vehicleInfo.engine_no_prefix)) {
                return res.status(400).json({ message: 'Engine number does not match expected prefix for this model' });
            }

            if (!vehicleService.isValidChassis(chassis_no)) {
                return res.status(400).json({ message: "Invalid chassis number format." });
            }

            if (!['Private', 'Commercial'].includes(vehicle_usage_type)) {
                return res.status(400).json({ message: "Invalid vehicle usage type. Must be 'Private' or 'Commercial'." });
            }

            const reg_date = req.body.reg_date ? moment(req.body.reg_date) : moment();
            const reg_exp_date = moment(reg_date).add(15, 'years');
            const fc_expiry_date = vehicle_usage_type === 'Private'
                ? moment(reg_date).add(15, 'years')
                : moment(reg_date).add(1, 'years');
            const insurance_validity = moment(reg_date).add(1, 'years');

            const today = moment();
            if (reg_exp_date.isBefore(today) || fc_expiry_date.isBefore(today)) {
                return res.status(400).json({ message: "Registration or FC already expired" });
            }

            const checkDuplicate = `
                SELECT * FROM vehicle WHERE chassis_no = ? OR engine_no = ?
            `;
            
            db.query(checkDuplicate, [chassis_no, engine_no], async (err, results) => {
                if (err) {
                    return res.status(500).json({ message: "Database error while checking duplicates", error: err.message });
                }

                if (results.length > 0) {
                    return res.status(400).json({ message: "Chassis number or Engine number already exists." });
                }

                vehicleData.reg_date = reg_date.format("YYYY-MM-DD");
                vehicleData.reg_exp_date = reg_exp_date.format("YYYY-MM-DD");
                vehicleData.FC_expiry_date = fc_expiry_date.format("YYYY-MM-DD");
                vehicleData.insurance_validity = insurance_validity.format("YYYY-MM-DD");
                vehicleData.vehicle_invoice = invoicePath;
                vehicleData.passport_photo = passportPhoto;
                vehicleData.photo_front = photoFront;
                vehicleData.photo_left = photoLeft;
                vehicleData.photo_right = photoRight;
                vehicleData.photo_back = photoBack;
                vehicleData.number_type = number_type;
                vehicleData.fancy_number_id = number_type === 'fancy' ? fancy_number_id : null;

                try {
                    const result = await registrationVehicle(vehicleData, identityProofPath, addrProofPath);
                    if (number_type === 'fancy' && fancy_number_id) {
                        await vehicleService.reserveFancyNumber(fancy_number_id, vehicleData.owner_id, result.vehicle_id);
                    }
                    res.status(200).json({
                        message: 'Vehicle registered successfully',
                        vehicle_id: result.vehicle_id,
                        reg_exp_date: vehicleData.reg_exp_date,
                        FC_expiry_date: vehicleData.FC_expiry_date,
                        insurance_validity: vehicleData.insurance_validity
                    });
                } catch (insertErr) {
                    return res.status(500).json({ message: 'Vehicle registration failed', error: insertErr.message });
                }
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Unexpected error occurred', error: err.message });
    }
};


exports.getFancyNumbers = (req, res) => {
  let { category, digits } = req.body;


  if (!category || !['VIP', 'Premium', 'Custom'].includes(category)) {
    return res.status(400).json({ message: 'Invalid or missing category' });
  }

  const query = `
    SELECT id, vehicle_no, category 
    FROM fancy_numbers 
    WHERE category = ? AND reserved = FALSE
  `;

  db.query(query, [category], (err, results) => {
    if (err) {
      console.error('DB error fetching fancy numbers:', err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    const filtered = digits
      ? results.filter((item) => item.vehicle_no.includes(digits))
      : results;

    if (filtered.length === 0) {
      return res.status(404).json({ message: 'No matching fancy numbers found' });
    }

    res.status(200).json({ fancy_numbers: filtered });
  });
};



exports.reserveFancyNumber = (req, res) => {
    const { number_id, owner_id, vehicle_id } = req.body;

    if (!number_id || !owner_id || !vehicle_id) {
        return res.status(400).json({ message: 'Missing required fields: number_id, owner_id, vehicle_id' });
    }

    const checkQuery = `
        SELECT reserved FROM fancy_numbers WHERE id = ?
    `;

    db.query(checkQuery, [number_id], (checkErr, checkResults) => {
        if (checkErr) {
            console.error('Check error:', checkErr);
            return res.status(500).json({ message: 'Database error during check', error: checkErr.message });
        }

        if (checkResults.length === 0) {
            return res.status(404).json({ message: 'Fancy number not found' });
        }

        if (checkResults[0].reserved) {
            return res.status(400).json({ message: 'Fancy number is already reserved' });
        }

        const reserveQuery = `
            UPDATE fancy_numbers 
            SET reserved = TRUE, reserved_by = ?, vehicle_id = ?, reserved_at = NOW() 
            WHERE id = ?
        `;

        db.query(reserveQuery, [owner_id, vehicle_id, number_id], (err, result) => {
            if (err) {
                console.error('Reservation failed:', err);
                return res.status(500).json({ message: 'Reservation failed', error: err.message });
            }
        
        const updateVehicleQuery = `
                UPDATE vehicle SET fancy_number_id = ?, number_type = 'fancy' WHERE vehicle_id = ?
            `;

            db.query(updateVehicleQuery, [number_id, vehicle_id], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Failed to update vehicle with fancy number ID:', updateErr);
                    return res.status(500).json({ message: 'Reservation done, but vehicle update failed', error: updateErr.message });
                }

            res.status(200).json({ message: 'Fancy number reserved successfully' });
        });
    });
});
};



exports.displayVehicles=async(req,res)=>{
    try{
        const userId=req.query.userId;
        const vehiclesInfo=await allVehicles(userId)
        res.status(200).json({vehiclesInfo});
    }catch(err){
        console.log(err);
        res.status(200).json({message: 'Error in displaying Vehicles',error:err.message});
    }
}


exports.getVehicleMetadata = (_req,res) => {
    const query = `
    SELECT veh_name, veh_brand, vehicle_model, color, engine_capacity, fuel_type, no_of_seats FROM vehicle_details
    `;

    db.query(query,(err,results)=>{
        if(err) return res.status(500).json({message: 'Database error', error: err});
        res.json({results});
    })
}


exports.canProceedPayment = async(req, res) => {
  const { vehicle_id } = req.query;

  if( !vehicle_id) {
    return res.status(400).json({ message: 'Vehicle ID is required' });
  }

  const query = `
    SELECT r.verification_status
    FROM report r
    WHERE r.vehicle_id = ?
  `;

  db.query(query, [vehicle_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB Error' });

    if (!results.length || results[0].verification_status !== 'Approved') {
      return res.status(403).json({ message: 'Vehicle not approved for payment' });
    }

    res.status(200).json({ message: 'Eligible for payment' });
  });
};



exports.getRegFee = (req, res) => {
  const { vehicle_id } = req.query;

  const query = `
        SELECT DISTINCT v.vehicle_id, v.vehicle_name, v.vehicle_brand, vd.reg_fee
            FROM vehicle v
            JOIN vehicle_details vd
            ON v.vehicle_name = vd.veh_name AND v.vehicle_brand = vd.veh_brand
        WHERE v.vehicle_id = ?;
    `;

  db.query(query, [vehicle_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });

    if (!results.length) return res.status(404).json({ message: 'Vehicle not found' });

    res.status(200).json({ vehicle_id: results[0].vehicle_id, vehicle_name: results[0].vehicle_name,
         vehicle_brand: results[0].vehicle_brand, reg_fee: results[0].reg_fee });
  });
};



exports.makePayment = (req, res) => {
  const { vehicle_id, owner_id, amount } = req.body;

  const query = `INSERT INTO payments (vehicle_id, owner_id, amount, status) VALUES (?, ?, ?, 'Success')`;

  db.query(query, [vehicle_id, owner_id, amount], (err, result) => {
    if (err) return res.status(500).json({ message: 'Payment failed', error: err });

    res.status(200).json({ message: 'Payment recorded successfully' });
  });
};


exports.updatePaymentStatus = (req, res) => {
  const { vehicle_id } = req.query;

  if (!vehicle_id) return res.status(400).json({ message: "Missing vehicle_id" });

  const query = `UPDATE vehicle SET payment_status = 'Paid' WHERE vehicle_id = ?`;

  db.query(query, [vehicle_id], (err, result) => {
    if (err) {
      console.error("Failed to update payment status:", err);
      return res.status(500).json({ message: "DB error", error: err.message });
    }

    res.status(200).json({ message: "Payment status updated successfully" });
  });
};
