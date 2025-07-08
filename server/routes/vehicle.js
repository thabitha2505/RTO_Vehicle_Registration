const express=require('express');
const router=express.Router();
const multer=require('multer');
const path=require('path');
const {registerVehicle, displayVehicles, getVehicleMetadata, getFancyNumbers, reserveFancyNumber, 
    canProceedPayment, getRegFee, makePayment, updatePaymentStatus }=require('../controllers/vehicleController');

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/');
    },
    filename:function(req,file,cb){
        const unique = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload=multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },//10MB 
});

router.post('/register',upload.fields([
        { name: "passport_photo", maxCount: 1 },
        { name: "photo_front", maxCount: 1 },
        { name: "photo_left", maxCount: 1 },
        { name: "photo_right", maxCount: 1 },
        { name: "photo_back", maxCount: 1 },
        { name: 'identity_proof', maxCount: 1 },
        { name: 'addr_proof', maxCount: 1 },
        {name: 'vehicle_invoice', maxCount: 1}
    ]),
    registerVehicle
);

router.get('/allVehicles',displayVehicles);
router.get('/metadata',getVehicleMetadata);

router.post('/fancy-numbers',getFancyNumbers);
router.post('/fancy-numbers/reserve',reserveFancyNumber);

router.get('/can-proceed-payment',canProceedPayment);

router.get('/fee', getRegFee);
router.post('/payment', makePayment);
router.post('/paymentStatus', updatePaymentStatus);


module.exports=router;

