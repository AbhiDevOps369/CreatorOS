import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();

// default middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
));
app.use(cookieParser());

//middlewares


//aggregate route handling 


export default app;