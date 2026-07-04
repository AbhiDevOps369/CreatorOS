import { body } from "express-validator"

const createProjectValidator = () => {
    return [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("name is required"),
    body("description")
        .trim()
        .optional(),
    body("clientId")
        .notEmpty()
        .withMessage("clientId is required")
        .isMongoId()
        .withMessage("clientId must be a valid ID")
    
    ]
}

const updateProjectValidator = () => {
    return [
    body("name")
        .trim()
        .optional(),
    body("description")
        .trim()
        .optional()
        
    
    ]
}

export { createProjectValidator,updateProjectValidator }