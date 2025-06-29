const db = require('../config/db');

exports.updateVehicleStatus=async(vehicle_id, status)=>{
    return new Promise((resolve,reject)=>{
        const query=`UPDATE report SET verification_status=? WHERE vehicle_id=?`;
        db.query(query,[status,vehicle_id],(err,result)=>{
            if(err) return reject(err);
            resolve(result);
        });
    });
};
