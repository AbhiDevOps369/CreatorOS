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

const submitDeliverableValidator = () => {
    return [
        body("url")
            .trim()
            .notEmpty()
            .withMessage("url is required")
            .isURL()
            .withMessage("url must be a valid URL"),
        body("message")
            .trim()
            .optional()
    ]
}

export { createTaskValidator,updateTaskValidator,submitDeliverableValidator }