import { beforeEach, describe, it, expect, vi } from "vitest";

import request from "supertest";
import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import app from "../../app";
import { hashPassword } from "../../shared/utils/password";
import { generateRefreshToken } from "../../shared/utils/tokens";

describe("POST /auth/refresh", () => {
    beforeEach(async () => {
        await prisma.passwordResetToken.deleteMany();
        await prisma.verificationToken.deleteMany();
        await prisma.session.deleteMany();
        await prisma.user.deleteMany();
    });

    // valid refresh token test
    it("should refresh successfully with a valid refresh token", async () => {
        const user = await prisma.user.create({
            data: {
                name: "Refresh User",
                email: "refresh@example.com",
                password: await hashPassword("Password123!"),
                verified: true
            }
        });

        const jti = crypto.randomUUID();
        const refreshToken = generateRefreshToken(user.id, jti);
        const hashedToken = await bcrypt.hash(refreshToken, 10);

        await prisma.session.create({
            data: {
                userId: user.id,
                jti,
                hashedToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                ipAddress: "127.0.0.1",
                userAgent: "test-agent"
            }
        });

        const response = await request(app)
            .post("/auth/refresh")
            .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(response.status).toBe(200);

        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeUndefined();

        expect(response.headers["set-cookie"]).toBeDefined();
    });

    // invalid refresh token test
    it("should reject an invalid refresh token", async () => {
        const response = await request(app)
            .post("/auth/refresh")
            .set("Cookie", ["refreshToken=garbage"]);

        expect(response.status).toBe(401);
    });

    it("should reject an expired refresh token", async () => {
        const user = await prisma.user.create({
            data: {
                name: "Expired User",
                email: "expired@example.com",
                password: await hashPassword("Password123!"),
                verified: true
            }
        });

        const jti = crypto.randomUUID();
        const refreshToken = generateRefreshToken(user.id, jti);
        const hashedToken = await bcrypt.hash(refreshToken, 10);

        await prisma.session.create({
            data: {
                userId: user.id,
                jti,
                hashedToken,
                expiresAt: new Date(Date.now() - 1000),
                ipAddress: "127.0.0.1",
                userAgent: "test-agent"
            }
        });

        const response = await request(app)
            .post("/auth/refresh")
            .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Unauthenticated");
    });

    it("should rotate the refresh token", async () => {
        const user = await prisma.user.create({
            data: {
                name: "Rotation User",
                email: "rotation@example.com",
                password: await hashPassword("Password123!"),
                verified: true
            }
        });

        const oldJti = crypto.randomUUID();
        const oldRefreshToken = generateRefreshToken(user.id, oldJti);
        const oldHashedToken = await bcrypt.hash(oldRefreshToken, 10);

        await prisma.session.create({
            data: {
                userId: user.id,
                jti: oldJti,
                hashedToken: oldHashedToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                ipAddress: "127.0.0.1",
                userAgent: "test-agent"
            }
        });

        const response = await request(app)
            .post("/auth/refresh")
            .set("Cookie", [`refreshToken=${oldRefreshToken}`]);

        expect(response.status).toBe(200);
        expect(response.body.accessToken).toBeDefined();

        const sessions = await prisma.session.findMany({
            where: {
                userId: user.id
            }
        });

        expect(sessions).toHaveLength(1);

        expect(sessions[0]?.jti).not.toBe(oldJti);
    });

    it("should reject a reused refresh token", async () => {
        const user = await prisma.user.create({
            data: {
                name: "Reuse User",
                email: "reuse@example.com",
                password: await hashPassword("Password123!"),
                verified: true
            }
        });

        const jti = crypto.randomUUID();
        const refreshToken = generateRefreshToken(user.id, jti);
        const hashedToken = await bcrypt.hash(refreshToken, 10);

        await prisma.session.create({
            data: {
                userId: user.id,
                jti,
                hashedToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                ipAddress: "127.0.0.1",
                userAgent: "test-agent"
            }
        });

        // First use → successful rotation
        const firstResponse = await request(app)
            .post("/auth/refresh")
            .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(firstResponse.status).toBe(200);

        // Second use of the SAME token → rejected
        const secondResponse = await request(app)
            .post("/auth/refresh")
            .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(secondResponse.status).toBe(401);
        expect(secondResponse.body.message).toBe("Unauthenticated");
    });
});