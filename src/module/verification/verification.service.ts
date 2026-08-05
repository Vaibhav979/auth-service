import * as verificationRepo from './verification.repo';

import { AppError } from "../../shared/utils/AppError";

import * as userRepo from '../user/user.repo';

import { compareSecureToken } from "../../shared/utils/verification";

export const verify = async (
    userId: string,
    token: string
) => {

    const verificationToken = await verificationRepo.verifyToken(userId);

    if (!verificationToken) {
        throw new AppError('Invalid verification link', 400);
    }

    if (verificationToken.expiresAt < new Date()) {
        throw new AppError('Verification token has expired', 400);
    }

    const isMatch = await compareSecureToken(
        token,
        verificationToken.hashedToken
    );

    if (!isMatch) {
        throw new AppError('Invalid verification link', 400);
    }

    await userRepo.updateUserVerification(userId);

    await verificationRepo.deleteToken(userId);
};