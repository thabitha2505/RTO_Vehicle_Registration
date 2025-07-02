const {registrationVehicle, allVehicles}=require('../services/vehicleService');
const vehicleService = require('../services/vehicleService');
const db=require('../config/db');
const moment=require('moment');


exports.registerVehicle = async (req, res) => {
    const { 
        chassis_no, engine_no, vehicle_usage_type, vehicle_brand, vehicle_name,
        body_type, lorry_type, container_capacity, tanker_capacity,
        bus_seating_type, ac_type, vehicle_class, road_tax, vehicle_model,
     } = req.body;

    try {
        const vehicleData = req.body;
        const identityProofPath = req.files['identity_proof']?.[0]?.path || null;
        const addrProofPath = req.files['addr_proof']?.[0]?.path || null;
        const invoicePath = req.files['vehicle_invoice']?.[0]?.path || null;

        if (!identityProofPath || !addrProofPath || !invoicePath) {
            return res.status(400).json({ message: 'Both identity proof, address proof and vehicle invoice files are required.' });
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
                return res.status(400).json({ message: "Registration or FC already expired. Please renew first." });
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
                vehicleData.vehicle_model = vehicle_model;

                try {
                    const result = await registrationVehicle(vehicleData, identityProofPath, addrProofPath);
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

