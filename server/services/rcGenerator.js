const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function createRC_PDF(vehicle, regNo) {
  return new Promise((resolve, reject) => {
    const fileName = `RC_${vehicle.vehicle_id}.pdf`;
    const filePath = path.join(__dirname, '../rc_cards', fileName);

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text('Registration Certificate', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Reg. No: ${regNo}`);
    doc.text(`Owner Name: ${vehicle.owner_name}`);
    doc.text(`Vehicle: ${vehicle.vehicle_brand} ${vehicle.vehicle_name}`);
    doc.text(`Model: ${vehicle.vehicle_model}`);
    doc.text(`Fuel Type: ${vehicle.fuel_type}`);
    doc.text(`Chassis No: ${vehicle.chassis_no}`);
    doc.text(`Engine No: ${vehicle.engine_no}`);
    doc.text(`Reg Date: ${new Date(vehicle.reg_date).toLocaleDateString()}`);
    doc.text(`Insurance Validity: ${new Date(vehicle.insurance_validity).toLocaleDateString()}`);

    doc.end();

    doc.on('finish', () => resolve(`http://localhost:5000/rc_cards/${fileName}`));
    doc.on('error', (err) => reject(err));
  });
}

module.exports = {
  createRC_PDF
};
