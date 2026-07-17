import crypto from "crypto";

import bcrypt from "bcrypt";

export const generateSecureToken = () => {
    return crypto.randomBytes(32).toString("hex");
}

export const hashSecureToken = async (
    token: string
) => {
    return bcrypt.hash(token, 10);
};