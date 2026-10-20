import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import errorHandler from "./middleware/errorHandler.js";
dotenv.config()
const app = express();
const PORT=3000;
app.use(cors())
app.use(express.json())
app.use(errorHandler)
//skipping to next route
// app.get(
//     '/user/:id',(req,res,next)=>{
//         if(req.params.id=='0') next('route');
//         else next()
//     },
//     (req,res)=>{
//         res.send('regular')
//     }

// )
// app.get('/user/:id',(req,res)=>{
//     res.send('Unique')
// })

//Reusable middleware arrays


// function logOriginalUrl(req, res, next) {
//   console.log('Request URL:', req.originalUrl);
//   next();
// }

// function logMethod(req, res, next) {
//   console.log('Request Type:', req.method);
//   next();
// }

// const logStuff = [logOriginalUrl, logMethod];
// app.get('/user/:id', logStuff, (req, res) => {
//   res.send('User Info');
// });







app.listen(PORT,()=>{
    console.log(`application runing on port http://localhost/${PORT}.....`)
})