const express=require('express');
const router=express.Router();
const multer=require('multer');
const path=require('path');
const {registerVehicle, displayVehicles}=require('../controllers/vehicleController');

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/');
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+path.extname(file.originalname));
    }
});

const upload=multer({storage});

router.post('/register',upload.fields([
      { name: 'identity_proof', maxCount: 1 },
      { name: 'addr_proof', maxCount: 1 },
      {name: 'vehicle_invoice', maxCount: 1}
    ]),
    registerVehicle
);

router.get('/allVehicles',displayVehicles);



module.exports=router;

