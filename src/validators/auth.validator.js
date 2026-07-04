import {body} from "express-validator"

const registrationValidator=()=>{
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name cannot be empty"),
        body("email")
        .trim()
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("email is in wrong format"),

        body("password")
        .trim()
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

        body("jobTitle")
            .trim()
            .notEmpty()
            .withMessage("Job title cannot be empty")
    ]

}

const loginValidator=()=>{
    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("email is in wrong format"),

        body("password")
        .notEmpty()
        .withMessage("Password is required"),
    ]
}

const forgotPasswordValidator=()=>{
    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("email is in wrong format"),

    ]
}

const changePasswordValidator=()=>{
    return [
        body("oldPassword")
        .notEmpty()
        .withMessage("Old Password is required"),

        body("newPassword")
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    ]
}

const resetForgotPasswordValidator=()=>{
    return [
        body("newPassword")
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")
    ]
}
export {registrationValidator,loginValidator,forgotPasswordValidator,changePasswordValidator,resetForgotPasswordValidator}