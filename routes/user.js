const express = require('express');
const router = express.Router();

const uid2 = require('uid2');
const SHA256 = require('crypto-js/sha256');
const encBase64 = require('crypto-js/enc-base64');

const User = require('../models/User');

// const password = "azerty";
// On génère un salt
// const salt = uid2(16);
// console.log("salt", salt);
// On encrypte le mot de passe avec le salt
// const hash = SHA256(password+salt).toString(encBase64);
// console.log("hash :", hash);
// On génère un token
// const token = uid2(64);
// console.log("token :",token);

router.post('/signup', async (req, res) => {
    try {
        const { email, username, password, newsletter } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Missing parameters" });
        }

        const salt = uid2(64);
        const token = uid2(64);
        // console.log("UserPassword :", salt);
        // console.log("UserToken : ", token);
        const hash = SHA256(password+salt).toString(encBase64);
        // console.log("UserPassword :", hash);

        // Gérer les cas d'erreurs si l'email existe déjà ou si le username n'est pas renseigné
        if(!username) {
            return res.status(400).json({ message: 'Username is required' });
        };

        const user = await User.findOne({ email: email });

        if(user) {
            return res.status(409).json({ message: 'Email already taken' });
        };
        
        const newUser = new User({
            email: email,
            account: {
                username: username,
                // avatar: Object,
            },
            newsletter: newsletter,
            token: token,
            hash: hash,
            salt: salt,
        });
        // console.log(newUser);

        await newUser.save();

        return res.status(201).json({
            _id: newUser._id,
            token: newUser.token,
            account: {
                username: newUser.account.username
            }
        });
    } catch(error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // On vérifie que le mail et password sont fournis
        if(!email || !password) {
            return res.status(400).json({ message: "Email and Password are required "});
        }

        // On recherche le User
        const user = await User.findOne({ email: email });

        if(!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // On vérifie le mot de passe
        const passwordToTest = SHA256(password + user.salt).toString(encBase64);

        if(passwordToTest === user.hash) {
            return res.status(200).json({
                _id: user._id,
                token: user.token,
                account: {
                    username: user.account.username
                }
            })
        }
    } catch(error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;