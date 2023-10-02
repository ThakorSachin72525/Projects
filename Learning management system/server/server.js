
import app from './app.js';
import connectionToDB from './config/dbConnection.js';
const PORT = process.env.PORT || 5000



// if (process.env.NODE_ENV === 'production') 

app.listen(PORT, async () => {
    console.log(`App is running at http:localhost:${PORT}`);
    await connectionToDB()
})
