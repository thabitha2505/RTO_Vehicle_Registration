const {updateVehicleStatus}=require('../services/adminService');
const db=require('../config/db');

exports.updateVehicleStatus=async(req,res)=>{
    const {vehicle_id, status}=req.body;
    try {
        if(!vehicle_id){
            return res.status(400).json({ message:'Vehicle ID is required' });
        }

        if(!['Pending', 'Approved', 'Rejected'].includes(status)){
            return res.status(400).json({message:'Invalid status value' });
        }
        
        const result = await updateVehicleStatus(vehicle_id, status);

        if(result.affectedRows===0){
            return res.status(404).json({message:'Vehicle ID not found in report table'});
        }
        res.status(200).json({message:`Vehicle status updated to ${status}`});
    }catch(err){
        console.error(err);
        res.status(500).json({message:'Status update failed', error:err.message });
    }
};



exports.getDocumentsByVehicleId = (req, res) => {
  const { vehicle_id } = req.params;

  if (!vehicle_id) {
    return res.status(400).json({ message: "Vehicle ID is required" });
  }

  const query = `SELECT identity_proof, addr_proof, vehicle_invoice FROM vehicle WHERE vehicle_id = ?`;

  db.query(query, [vehicle_id], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });

    if (results.length === 0) {
      return res.status(404).json({ message: "No vehicle found with this ID" });
    }

    const { identity_proof, addr_proof, vehicle_invoice } = results[0];
    const normalize = (path) => path?.replace(/\\/g, "/");

    res.json({
      identity_proof: `http://localhost:5000/${normalize(identity_proof)}`,
      addr_proof: `http://localhost:5000/${normalize(addr_proof)}`,
      vehicle_invoice: `http://localhost:5000/${normalize(vehicle_invoice)}`,
    });
  });
};
