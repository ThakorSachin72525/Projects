const express = require('express')
const app = express()
const authRouter = require('./router/authRoute');
const databaseConnect = require('./config/databaseConfig');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const exphbs = require('express-handlebars');
const path = require("path")

databaseConnect()

app.use(express.json()); 
app.use(cookieParser())
app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true
}))

// Configure Handlebars as the view engine
app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main', layoutsDir: path.join(__dirname, 'views/layouts') }));
app.set('view engine', 'hbs'); // Set the view engine to Handlebars

// Configure Express to serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth/', authRouter)

app.get('/', (req, res) => {
    res.render('home', { pageTitle: 'Home', year: new Date().getFullYear() });
});

app.get('/signup', (req, res) => {
    res.render('signup', { pageTitle: 'About', year: new Date().getFullYear() });
});


module.exports = app