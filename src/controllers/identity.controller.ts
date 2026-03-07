
import { identityService } from "../services/identity.service"
import { Request, Response } from "express"



const identityController = async(req: Request, res: Response) => {

    try {
        const {email, phoneNumber} = req.body
        const result = await identityService({email, phoneNumber})
    
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