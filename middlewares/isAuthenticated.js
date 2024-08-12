const User = require('../models/User');

const isAuthenticated = async (req, res, next) => {
    try {
        // On récupère le token depuis l'en-tête de la requête
        const token = req.headers.authorization;
        console.log(token);
        
        if (!token) {
            console.log("Token not provided");
            return res.status(401).json({ error: "Token not provided" });
        }

        const tokenValue = token.replace("Bearer ", "");
        console.log(tokenValue);
        
        // On cherche si l'user correspond au token
        const user = await User.findOne({ token: tokenValue });

        if (!user) {
            console.log("Invalid Token");
            return res.status(401).json({ error: "Invalid Token" });
        }

        // On ajoute le user à l'objet de la requête
        req.user = user;

        next();
    } catch (error) {
        console.log("Error in authentication middleware:", error.message);
        return res.status(500).json({ error: error.message });
    }
};

module.exports = isAuthenticated;