import {Router} from 'express'
import { identityController } from '../controllers/identity.controller'

const router = Router()

router.route("/identify").post(identityController)

export {router}