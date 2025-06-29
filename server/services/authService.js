const bcrypt=require("bcrypt");
const db=require('../config/db');

exports.register=async({name,email,password,phone_no})=>{
    return new Promise((resolve,reject)=>{
        db.query('SELECT * FROM users WHERE phone_no=?',[phone_no],async (err,results)=>{
            if(err) return reject(err);
            if(results.length>0) return reject(new Error('User already exists'));
            const hashedPassword= await bcrypt.hash(password,10);

            db.query(
                'INSERT INTO users(name,email,password,phone_no,role) values(?,?,?,?,?)',
                [name,email,hashedPassword,phone_no,'owner'],
                (err,result)=>{
                    if(err) return reject(err);
                    resolve({result});
                }
            );
        });
    });
};

exports.login=async({phone_no,password})=>{
    return new Promise((resolve,reject)=>{
        db.query('SELECT * FROM users WHERE phone_no=?',[phone_no],async(err,results)=>{
            if(err) return reject(err);
            if(results.length===0) return reject(new Error('User not found'));
            const user=results[0];

            const isMatch=await bcrypt.compare(password,user.password);
            if(!isMatch) return reject(new Error('Invalid credentials'));

            resolve({
                id: user.user_id, 
                name: user.name, 
                email: user.email, 
                phone_no: user.phone_no,
                role: user.role 
            });

            })
        })
    };

