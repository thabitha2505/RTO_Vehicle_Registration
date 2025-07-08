const express = require('express');
const router = express.Router();
const {updateVehicleStatus, getDocumentsByVehicleId, generateRC}=require('../controllers/adminController');

router.put('/updateStatus', updateVehicleStatus);
router.get('/documents/:vehicle_id', getDocumentsByVehicleId);
router.get('/generate-rc', generateRC);

module.exports = router;
