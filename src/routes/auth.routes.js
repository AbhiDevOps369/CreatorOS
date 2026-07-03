import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {registerUser,login,logout,getCurrentUser,verifyEmail,refreshAccessToken,resendEmailVerification,forgotPassword,changePassword,resetForgotPassword} from 
"../controllers/auth.controller.js";

const router=Router({ mergeParams: true });



//public

router.post("/register",/*validator middleware,*/registerUser ) ;
router.post("/login",/*validator middleware,*/login ) ;
router.post("/refresh-token",refreshAccessToken) ;
router.get("/verify-email/:verificationToken",verifyEmail) ; //how get and public user should be logged in right
router.post("/forgot-password",/*validator middleware,*/forgotPassword) ; 
router.post("/reset-password/:resetToken",/*validator middleware,*/resetForgotPassword) ; 



//protected
router.post("/logout",verifyJwt,logout) ;
router.get("/current-user",verifyJwt,getCurrentUser) ;
router.post("/resend-email-verification",verifyJwt,resendEmailVerification) ;
router.post("/change-password",verifyJwt,/*validator middleware*/ changePassword) ;


export default router;
