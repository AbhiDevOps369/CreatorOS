import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {registerUser,login,logout,getCurrentUser,verifyEmail,refreshAccessToken,resendEmailVerification,forgotPassword,changePassword,resetForgotPassword} from 
"../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";

import {registrationValidator,loginValidator,forgotPasswordValidator,changePasswordValidator,resetForgotPasswordValidator} from "../validators/auth.validator.js";
const router=Router({ mergeParams: true });



//public

router.post("/register",registrationValidator(),validate,registerUser ) ; //✅
router.post("/login",loginValidator(),validate,login ) ; //✅
router.post("/refresh-token",refreshAccessToken) ; //✅
router.get("/verify-email/:verificationToken",verifyEmail) ; //✅ //how get and public user should be logged in right
router.post("/forgot-password",forgotPasswordValidator(),validate,forgotPassword) ; //✅
router.post("/reset-password/:resetToken",resetForgotPasswordValidator(),validate,resetForgotPassword) ; //✅



//protected
router.post("/logout",verifyJwt(),logout) ;//✅
router.get("/current-user",verifyJwt(),getCurrentUser) ; //✅
router.post("/resend-email-verification",verifyJwt(),resendEmailVerification) ; //✅
router.post("/change-password",verifyJwt(),changePasswordValidator(),validate, changePassword) ; //✅


export default router;
