const Users = require('../models/UserModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validation = require('../middleware/validation')
const { model } = require('mongoose')

const userCtrl = {

    register: async (req, res) =>{
        try {
            console.log(req.body);
            const { error } = validation.registerValidation(req.body);
            if (error) return res.status(400).send(error.details[0].message);

            const {last_name, first_name, email, phone, address, password} = req.body

            const user = await Users.findOne({email})
            if(user) return res.json({msg: "The email already exists."})

           
            // Password Encryption
            const passwordHash = await bcrypt.hash(password, 10)
            const newUser = new Users({
                last_name,
                first_name, 
                email, 
                phone,
                address,
                password : passwordHash
            })

            // Save mongodb
            await newUser.save()

            // Then create jsonwebtoken to authentication
            const accesstoken = createAccessToken({id: newUser._id})
           
            res.json({msg: 'successfully', 'Client' : newUser, accesstoken})


        } catch (err) {
            return res.json({message: err.message})
        }
    },

    
    login: async(req, res) =>{

        try {
            const {email, password} = req.body;

            const user = await Users.findOne({email})
            if(!user) return res.json({msg: "User does not exist."})

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.json({msg: "Incorrect password."})

            // If login success , create access token 
             const accesstoken = createAccessToken({id: user._id})
           
            res.json({msg:"You have signed in successfully", user, accesstoken})

        } catch (err) {
            return res.json({msg: err.message})
        }

    },

}



const createAccessToken = (user) =>{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
}

module.exports = userCtrl
