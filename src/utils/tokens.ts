import jwt from "jsonwebtoken";

export const generateAccessToken = (
    id: string,
    role: string
) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "15m"
        }
    );
};   