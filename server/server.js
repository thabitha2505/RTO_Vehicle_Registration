require('dotenv').config();
require('./config/db');
const express=require('express');
const cors=require('cors');
const bodyParser=require('body-parser');
const path = require('path');

const authRoutes=require('./routes/auth');
const vehicleRoutes=require('./routes/vehicle');
const adminRoutes=require('./routes/admin');


const app=express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads',express.static(path.join(__dirname,'uploads')));
app.use('/rc_cards', express.static(path.join(__dirname, 'rc_cards')));


app.use('/api/auth',authRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/admin',adminRoutes);



app.listen(process.env.PORT, ()=>{
    console.log(`server is running on port ${process.env.PORT}`);
});