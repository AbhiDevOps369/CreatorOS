import { body } from "express-validator"

const createTaskValidator = () => {
    return [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("title is required"),
    body("description")
        .trim()
        .optional(),
    body("assignedTo")
        .trim()
        .optional()
        .isMongoId()
        .withMessage("assignedTo must be a valid user ID")
    
    ]
}

const updateTaskValidator = () => {
    return [
    body("title")
        .trim()
        .optional(),
    body("description")
        .trim()
        .optional(),
        
    
    ]
}

export { createTaskValidator,updateTaskValidator }