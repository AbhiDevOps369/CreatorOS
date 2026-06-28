
import app from "./app.js";
import { connectDb } from './db/index.js';


const port=process.env.PORT || 3000;

connectDb()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on PORT: ${port}`)
        })
    })
    .catch((error) => {
        console.log("Database connection failed", error)
        process.exit(1)
    });
    
