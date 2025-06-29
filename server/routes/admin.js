const express = require('express');
const router = express.Router();
const {updateVehicleStatus, getDocumentsByVehicleId}=require('../controllers/adminController');

router.put('/updateStatus', updateVehicleStatus);
router.get('/documents/:vehicle_id', getDocumentsByVehicleId);

module.exports = router;
