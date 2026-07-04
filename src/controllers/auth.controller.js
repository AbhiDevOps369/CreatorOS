import {User} from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail} from "../utils/mail.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';



const generateAccessandRefreshTokens = async(userId) =>{
    try {
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(
            500,"something went wrong with generation of tokens",[]
        );
    }
}
const registerUser=asyncHandler(async(req,res)=>{
    const {name,email,password,jobTitle}=req.body;
  

    const existingUser=await User.findOne({ email });


    if(existingUser){
        throw new ApiError(409,"User with Email already exists ",[]);
    }


    const user= await User.create({
        name,
        email,
        password,
        jobTitle,
        isEmailVerified:false
    });
   
    const {unHashedToken,hashedToken,tokenExpiry} = user.generateTemporaryTokens();

    user.emailVerificationToken=hashedToken;
    user.emailVerificationExpiry=tokenExpiry;

    await user.save({validateBeforeSave:false});



    await sendEmail({
        email:user?.email,
        subject:"Please Verify your Email",
        mailgenContent:emailVerificationMailgenContent(user.name,`${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`)
    });
   

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
   

    if(!createdUser){
        throw new ApiError(
            500,"Something went wrong while registering the user"
        )
    }
   

    console.log("Created User ");
    return res.status(201).json(
        new ApiResponse(
            201,
            {user: createdUser},
            "user has been registered successfully ! Please verify your email to continue"
        ),
    );

});
const login=asyncHandler(async(req,res)=>{
    const { email,password }=req.body;
    if(!email){
        throw new ApiError(400,"username or email is required");
    }

    const user=await User.findOne({email});

    if(!user){
        throw new ApiError(400,"user does not exist !");
    }

    const passResult=await user.isPasswordCorrect(password);

    if(!passResult){
        throw new ApiError(400,"Invalid credentials!");
    }

    const {accessToken,refreshToken} = await generateAccessandRefreshTokens(user._id);

    const loggedUser=await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json( 
        new ApiResponse(200,{
            user:loggedUser,
            accessToken,refreshToken
        },
        "User logged in successfully"
    )
    )
});

const logout=asyncHandler(async(req,res)=>{
    const user=req.user;
    await User.findByIdAndUpdate(
        user._id,
        {
            $set:{
                refreshToken: ""
            }
        },{
            new:true //what does this new do 
        },
    );
    const options={
        httpOnly:true,
        secure:true //what does this secure do 
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, "User Logged out")
        );
});

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(
        200,
        req.user,
        "Current User Fetched Successfully !"
    ))
});

const verifyEmail=asyncHandler(async(req,res)=>{
    const{verificationToken}=req.params

    if(!verificationToken){
        throw new ApiError(400,"Email Verification failed")
    }

    let hashedToken=crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest("hex")

    const user=await User.findOne({
        emailVerificationToken:hashedToken,
        emailVerificationExpiry:{$gt: Date.now()}
    })

    if(!user){
        throw new ApiError(400,"token expired or invalid");
    }
    user.emailVerificationExpiry=undefined;
    user.emailVerificationToken=undefined;
    user.isEmailVerified=true;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isEmailVerified: true
            },
            "Email is Verified"
        )
    );
});

const resendEmailVerification=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(404,"User does not exist");
    }
    if(user.isEmailVerified){
        throw new ApiError(404,"Email already verified");
    }
    const {unHashedToken,hashedToken,tokenExpiry} = user.generateTemporaryTokens();

    user.emailVerificationToken=hashedToken;
    user.emailVerificationExpiry=tokenExpiry;

    await user.save({validateBeforeSave:false});
    await sendEmail({
        email:user?.email,
        subject:"Please Verify your Email",
        mailgenContent:emailVerificationMailgenContent(user.name,`${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`)
    });
    
    return res.status(200).json(new ApiResponse(200,{},"Mail has been resent !"));


});

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken ;
    if(!incomingRefreshToken){
        throw new ApiError(401,'unauthorized access');
    }

    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

        const user=await User.findById(decodedToken?._id); //explain how we can extract ._id what is structure in payload
        if(!user){
            throw new ApiError(401,'unauthorized access');
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,'unauthorized access');
        }
        const options={
            httpOnly:true,
            secure:true
        }

        const{accessToken,refreshToken:newRefreshToken}=await generateAccessandRefreshTokens(user._id);
        user.refreshToken=newRefreshToken;
        await user.save();

        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newRefreshToken,options).json(
            new ApiResponse(200,{accessToken,newRefreshToken},"AccessToken changed")
        )
    } catch (error) {
         throw new ApiError(401,'refresh token expired ');
    }
    
});
const forgotPassword =asyncHandler(async(req,res)=>{
    const {email}=req.body;
    const user=await User.findOne({email});

    if(!user){
        throw new ApiError(400,"Please Register yourself!");
    }

    const {unHashedToken,hashedToken,tokenExpiry} = user.generateTemporaryTokens();

    user.forgotPasswordToken=hashedToken;
    user.forgotPasswordExpiry=tokenExpiry;

    await user.save({validateBeforeSave:false});
    await sendEmail({
        email:user?.email,
        subject:"Reset Your Password",
        mailgenContent:forgotPasswordMailgenContent(user.name,`${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,

        ),
    });

    return res.status(200).json(
            new ApiResponse(200,{},"Reset Your password,link sent on your email")
        );


});

const changePassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;
    
    const user=await User.findById(req.user?._id);

    const valid=await user.isPasswordCorrect(oldPassword);

    if(!valid){
        throw new ApiError(400,"Invalid Password");
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(new ApiResponse(200,{},"password changed"));

});

const resetForgotPassword=asyncHandler(async(req,res)=>{
    const {resetToken}=req.params; //is the reset Token the unhashedToken we sent in forgot password?
    const {newPassword}=req.body;

    let hashedToken=crypto.createHash("sha256").update(resetToken).digest("hex");

    const user=await User.findOne({
        forgotPasswordToken : hashedToken,
        forgotPasswordExpiry : {$gt : Date.now()},
    });

    if(!user){
        throw new ApiError(400,"Token invalid or expired access");
    }

    user.forgotPasswordExpiry=undefined;
    user.forgotPasswordToken=undefined;

    user.password=newPassword;

    await user.save({validateBeforeSave:false});
    
    return res.status(200).json(new ApiResponse(200,{},"Password has been changed!"));
});


export {registerUser,login,logout,getCurrentUser,verifyEmail,refreshAccessToken,resendEmailVerification,forgotPassword,changePassword,resetForgotPassword}


