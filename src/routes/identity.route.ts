import {Router} from 'express'
import { identityController } from '../controllers/identity.controller.js'

const router = Router()

router.route("/identify").post(identityController)

export {router}