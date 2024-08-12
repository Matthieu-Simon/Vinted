const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

const isAuthenticated = require('../middlewares/isAuthenticated');
const Offer = require('../models/Offer');

cloudinary.config({
    cloud_name: "dug0spluj",
    api_key: "497255626627954",
    api_secret: "94zSJK-7twA5IIO0Ms-rVcivWaI"
});

const convertToBase64 = (file) => {
    return `data:${file.mimetype};base64,${file.data.toString('base64')}`;
};

router.post('/publish', isAuthenticated, fileUpload(), async (req, res) => {
    try {
        const { 
            title, 
            description, 
            price, 
            condition, 
            city, 
            brand, 
            size, 
            color 
        } = req.body;

        if (!req.files || !req.files.picture) {
            return res.status(400).json({ error: "Picture is required" });
        }
        
        const pictureToUpload = req.files.picture;
        // console.log("pictureToUpload : ",pictureToUpload);
        const result = await cloudinary.uploader.upload(convertToBase64(pictureToUpload));
        // console.log("result :", result);

        const newOffer = new Offer({
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [
                { MARQUE: brand },
                { TAILLE: size },
                { ETAT: condition },
                { COULEUR: color },
                { EMPLACEMENT: city }
            ],
            product_image: {
                secure_url: result.secure_url
            },
            owner: req.user._id
        });

        await newOffer.save();

        const populatedOffer = await Offer.findById(newOffer._id).populate({
            path: 'owner',
            select: 'account.username account.avatar'
        });

        return res.json(populatedOffer);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;



// Le but de l’exo est de faire une seule requête à la BDD, du style : await Offer.find({}).sort({}).skip().limit() .
// Dans un premier temps, je vous conseille de vous concentrer sur la partie await Offer.find({}) .
// Vous allez devoir mettre, dans les parenthèses du find, un objet dont les clefs et les valeurs dépendent des queries reçues.
// Par exemple, si vous avez reçu un query title=pantalon , cet objet ressemblera à ça : { product_name: new RegExp("pantalon", "i") }
// Si vous avez reçu les queries suivants : title=pantalon&priceMin=200 , cet objet ressemblera à ça : { product_name: new RegExp("pantalon", "i"), product_price: { $gte: 200 } }
// Je vous conseille, au début de votre route, de créer un objet vide const filters = {}; puis de faire des conditions comme suit :
// Si j’ai reçu un query title , je rajoute une clefs product_name à mon objet contenant ce query
// Si j’ai reçu un query priceMin , je rajoute une clef product_price à mon objet contenant { $gte: 200 } etc.