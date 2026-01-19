
import jwt from 'jsonwebtoken';
import {errorHandler} from'./err.js';

export const verifyToken=(req,resp,next)=>{
    const token=req.cookies.access_token;
    if(!token){
        return next(errorHandler(401,'Unauthorized'));
    }
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err) {
        next(errorHandler(403,'Forbidden'));
        }
        req.user=user;
        next();
    });
};

