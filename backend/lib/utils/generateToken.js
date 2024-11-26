import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie =  (id, res) => {
    const token = jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '10d',
    });

    res.cookie("jwt", token, {
        maxAge: 10*24*60*60*1000, // in mseconds
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
    });
};