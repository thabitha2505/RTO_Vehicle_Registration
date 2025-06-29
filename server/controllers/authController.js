const authService=require('../services/authService');

exports.registerUser=async(req,res)=>{
    try{
        const result=await authService.register(req.body);
        res.status(200).json({message:"User registered successfully",result});
    }catch(err){
        res.status(400).json({message:err.message});
  }
};

exports.loginUser=async(req,res)=>{
    try{
        const user=await authService.login(req.body);
        res.status(200).json({message:"Login successful",user});
    }catch(err){
        res.status(401).json({message:err.message});
    }
}