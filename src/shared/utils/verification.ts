import crypto from "crypto";

import bcrypt from "bcrypt";

export const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString("hex");
}

export const hashVerificationToken = async (
    token: string
) => {
    return bcrypt.hash(token, 10);
};