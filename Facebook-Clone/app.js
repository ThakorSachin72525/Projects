const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// MongoDB connection
mongoose.connect('mongodb://0.0.0.0:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

// User schema
const userSchema = new mongoose.Schema({
    firstname: String,
    surname: String,
    email: String,
    password: String,
    birthday_day: String,
    birthday_month: String,
    birthday_year: String,
    female: String,
    male: String,
    custom: String
});
const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/signup.html');
});

app.post('/signup', async (req, res) => {
    const userData = {
        firstname: req.body.firstname,
        surname: req.body.surname,
        email: req.body.email,
        password: req.body.password,
        birthday_day: req.body.birthday_day,
        birthday_month: req.body.birthday_month,
        birthday_year: req.body.birthday_year,
        female: req.body.female,
        male: req.body.male,
        custom:req.body.custom,
    };

    try {
        const newUser = await User.create(userData);
        console.log('User registered:', newUser);
        res.send('Signup successful!');
    } catch (err) {
        console.error(err);
        res.send('Signup failed.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});