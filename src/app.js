import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js"
import agencyRouter from "./routes/agency.routes.js"
import clientRouter from "./routes/client.routes.js"
import projectRouter from "./routes/project.routes.js"
import portalRouter from "./routes/portal.routes.js"
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
app.use("/api/v1/auth", authRouter) //✅
app.use("/api/v1/agencies", agencyRouter) //✅
app.use("/api/v1/clients", clientRouter) //✅
app.use("/api/v1/projects", projectRouter)   // ← this ONE line now carries members, notes, tasks, subtasks — everything nested inside
app.use("/api/v1/portal", portalRouter)

// error handler — converts thrown ApiErrors into the standard JSON shape
// (without this, every ApiError falls through to Express's default HTML 500
// and the frontend can never see real status codes like 401/403/422)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
        statusCode,
        data: null,
        success: false,
        message: err.message || "Something Went Wrong",
        errors: err.errors || []
    });
});

export default app;