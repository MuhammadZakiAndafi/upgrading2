const User = require("../models/user");
const db = require("../config/db");
const { dataValid } = require("../utils/dataValidation");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const register = async (req, res) => {
    const valid = {
        username: "required",
        password: "required",
        confirmPassword: "required",
        email: "required,isEmail",
        name: "required",
    };

    const user = await dataValid(valid, req.body);

    try {

        if (user.data.password !== user.data.confirmPassword) {
            user.message.push("Password tidak sama");
        }

        if (user.message.length > 0) {
            return res.status(400).json({
                message: user.message,
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.data.password = await bcrypt.hash(user.data.password, salt);

        const usernameExist = await User.findAll({
            where: {
                username: user.data.username,
            },
        });

        const emailExist = await User.findAll({
            where: {
                email: user.data.email,
            },
        });

        if (usernameExist.length > 0) {
            return res.status(400).json({
                message: "Username telah digunakan",
            });
        }

        if (emailExist.length > 0) {
            return res.status(400).json({
                message: "Email telah digunakan",
            });
        }

        const newUser = await User.create(user.data);

        return res.status(201).json({
            message: "success",
            data: newUser,
        });
    } catch (error) {
        console.log("Error di register", error);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.log("Error in login", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { register, login };