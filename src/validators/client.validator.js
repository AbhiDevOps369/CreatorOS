import { body } from "express-validator"

const createClientValidator = () => {
    return [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("name is Required"),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("email is Required")
        .isEmail()
        .withMessage("email is in wrong format"),
    body("password")
        .trim()
        .notEmpty()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")
    
    ]
}

const updateClientValidator = () => {
    return [
    body("name")
        .trim()
        .optional(),
    body("email")
        .trim()
        .optional()
        .isEmail()
        .withMessage("email is in wrong format"),
    body("password")
        .trim()
        .optional()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters")
    
    ]
}

export { createClientValidator, updateClientValidator }