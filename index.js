const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost/Vinted');

const userRoutes = require('./routes/user');
app.use(userRoutes);

const publishRoutes = require('./routes/offer');
app.use(publishRoutes);

const offersRoutes = require('./routes/offers');
app.use(offersRoutes);

app.all('*', (req, res) => {
    res.json({ message: "Page not found"})
});

app.listen(3000, () => {
    console.log('Server has started');
});