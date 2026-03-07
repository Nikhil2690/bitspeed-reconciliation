import express from 'express'
import cors from "cors"
import dotenv from "dotenv"
import {router as identityRoutes} from './routes/identity.route.js'

dotenv.config({
    path: './env'
})

const app = express()

app.use(cors());
app.use(express.json());

app.use("/api", identityRoutes)

app.listen(3000, ()=> {
    console.log("Server is running on post 3000")
})