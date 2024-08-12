const express = require('express');
const router = express.Router();

const Offer = require('../models/Offer');

router.get('/offers', async (req, res) => {
    try {
        console.log(req.query);

        const result = await Offer.find({ product_name: "casquette" });
        console.log(result);
        
        // return res.status(200).json(result)       
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;