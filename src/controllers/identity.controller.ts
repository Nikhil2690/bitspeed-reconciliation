
import { identityService } from "../services/identity.service"
import { Request, Response } from "express"



const identityController = async(req: Request, res: Response) => {

    try {
        const {email, phone} = req.body
        const result = identityService({email, phone})
    
        res.status(200).
        json({
            contact: result
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export {
    identityController
}