import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDb from './config/mongoDB.js'
import cookieParser from 'cookie-parser'
import authRouter from './routes/authRoute.js'


dotenv.config();
let app = express()
app.use(cookieParser())
app.use(express.json())
app.use(cors({credentials : true}))
let port = process.env.port || 8000


app.use('/api/auth', authRouter)

connectDb()

app.listen(port , ()=>{
    console.log(`server is running on ${port}`);
})