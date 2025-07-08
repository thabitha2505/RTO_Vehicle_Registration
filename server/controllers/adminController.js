const {updateVehicleStatus}=require('../services/adminService');
const db = require('../config/db');
const PDFDocument = require('pdfkit');
const { generateRegNo } = require("../services/vehicleService");
const { createRC_PDF } = require("../services/rcGenerator");
const path = require('path');
const fs = require('fs');


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

  const query = `SELECT identity_proof, addr_proof, vehicle_invoice, photo_front, photo_left, photo_right, photo_back
                  FROM vehicle WHERE vehicle_id = ?`;

  db.query(query, [vehicle_id], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });

    if (results.length === 0) {
      return res.status(404).json({ message: "No vehicle found with this ID" });
    }

    const { identity_proof, addr_proof, vehicle_invoice, photo_front, photo_left, photo_right, photo_back } = results[0];
    const normalize = (path) => path?.replace(/\\/g, "/");

    res.json({
      identity_proof: `http://localhost:5000/${normalize(identity_proof)}`,
      addr_proof: `http://localhost:5000/${normalize(addr_proof)}`,
      vehicle_invoice: `http://localhost:5000/${normalize(vehicle_invoice)}`,
      photo_front: `http://localhost:5000/${normalize(photo_front)}`,
      photo_left: `http://localhost:5000/${normalize(photo_left)}`,
      photo_right: `http://localhost:5000/${normalize(photo_right)}`,
      photo_back: `http://localhost:5000/${normalize(photo_back)}`,
    });
  });
};




exports.generateRC = async (req, res) => {
  const { vehicle_id } = req.query;

  if (!vehicle_id) return res.status(400).json({ message: "Missing vehicle_id" });

  try {
    const [result] = await db.promise().query(
      `SELECT 
         v.vehicle_id, v.vehicle_name, v.vehicle_brand, v.vehicle_model,
         v.color, v.engine_capacity, v.engine_no, v.chassis_no, v.fuel_type,
         v.vehicle_class, v.reg_date, v.reg_exp_date, v.number_type, v.fancy_number_id, 
         v.reg_no, u.name AS owner_name, fn.vehicle_no AS fancy_reg_no
       FROM vehicle v
       JOIN users u ON v.owner_id = u.user_id
       LEFT JOIN fancy_numbers fn ON v.fancy_number_id = fn.id
       WHERE v.vehicle_id = ?`,
      [vehicle_id]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const v = result[0];

    let finalRegNo = v.reg_no;

    if (!finalRegNo) {
      if (v.number_type === "fancy") {
        finalRegNo = v.fancy_reg_no;
      } else {
        finalRegNo = await generateRegNo();
        await db
          .promise()
          .query("UPDATE vehicle SET reg_no = ? WHERE vehicle_id = ?", [
            finalRegNo,
            vehicle_id,
          ]);
      }
    }

    const fileName = `RC_${finalRegNo || v.vehicle_id}.pdf`;
    const filePath = path.join(__dirname, "..", "rc_cards", fileName);
    const fileUrl = `http://localhost:5000/rc_cards/${fileName}`;

    const doc = new PDFDocument({ size: [243, 153], margin: 5 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc
      .fontSize(10)
      .text("Indian Union Registration Certificate Issued by Government of Tamil Nadu", {
        align: "center",
      })
      .moveDown(0.5);

    doc.fontSize(7);
    doc.text(`Reg No: ${finalRegNo}`);
    doc.text(`Reg Date: ${new Date(v.reg_date).toLocaleDateString()}`);
    doc.text(`Exp Date: ${new Date(v.reg_exp_date).toLocaleDateString()}`);
    doc.text(`Chassis No: ${v.chassis_no}`);
    doc.text(`Engine No: ${v.engine_no}`);
    doc.text(`Owner: ${v.owner_name}`);
    doc.text(`Vehicle: ${v.vehicle_name}`);
    doc.text(`Fuel: ${v.fuel_type}`);
    doc.text(`Card Issue: ${new Date().toLocaleDateString()}`);

    doc.addPage({ size: [243, 153], margin: 5 });
    doc.fontSize(7);
    doc.text(`Reg No: ${finalRegNo}`);
    doc.text(`Vehicle Class: ${v.vehicle_class}`);
    doc.text(`Brand: ${v.vehicle_brand}`);
    doc.text(`Model: ${v.vehicle_model}`);
    doc.text(`Color: ${v.color}`);
    doc.text(`Engine Capacity: ${v.engine_capacity}`);

    doc.end();

    stream.on("finish", async () => {
      try {
        await db
          .promise()
          .query("UPDATE vehicle SET rc_generated = ? WHERE vehicle_id = ?", [
            fileUrl,
            vehicle_id,
          ]);

        return res.json({
          message: "RC generated successfully",
          reg_no: finalRegNo,
          rc_url: fileUrl,
        });
      } catch (err) {
        console.error("Failed to save RC URL:", err);
        return res
          .status(500)
          .json({ message: "RC generated but saving failed" });
      }
    });

    stream.on("error", (err) => {
      console.error("PDF generation failed:", err);
      return res.status(500).json({ message: "PDF generation failed" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
