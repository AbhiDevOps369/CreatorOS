import { body } from "express-validator"

const createAgencyValidator=()=>{
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Agency name cannot be empty")
            
    ]
}

export {createAgencyValidator}