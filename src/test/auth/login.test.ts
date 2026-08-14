import request from "supertest";

import { beforeEach, describe, it, expect, vi } from "vitest";

import { prisma } from "../../config/prisma";

import { hashPassword } from "../../shared/utils/password";

import app from "../../app";

vi.mock("../../module/email/email.service",
    async (importOriginal) => {
        const actual = await importOriginal<
            typeof import("../../module/email/email.service")
        >();

        return {
            ...actual,
            sendVerificationEmail: vi.fn(),
            sendPasswordResetEmail: vi.fn()
        };
    }
);

describe("POST /auth/login", () => {

    beforeEach(async () => {
        await prisma.passwordResetToken.deleteMany();
        await prisma.verificationToken.deleteMany();
        await prisma.session.deleteMany();
        await prisma.user.deleteMany();
    });

    it("should login successfully with valid credentials", async () => {

        const password = "Password123!";

        const hashedPassword = await hashPassword(password);

        await prisma.user.create({
            data: {
                name: "Login User",
                email: "login@example.com",
                password: hashedPassword,
                verified: true
            }
        });

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "login@example.com",
                password
            });

        console.log("LOGIN STATUS:", response.status);
        console.log("LOGIN BODY:", response.body);

        expect(response.status).toBe(200);

        expect(response.body.user).toBeDefined();

        expect(response.body.user.email).toBe(
            "login@example.com"
        );

        expect(response.body.accessToken).toBeDefined();

        expect(response.body.refreshToken).toBeUndefined();

        const setCookieHeader = response.headers["set-cookie"];

        expect(setCookieHeader).toBeDefined();

        expect(
            (Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]).some(
                (cookie: string) =>
                    cookie.startsWith("refreshToken=")
            )
        ).toBe(true);

        const session = await prisma.session.findFirst({
            where: {
                user: {
                    email: "login@example.com"
                }
            }
        });

        const sessions = await prisma.session.findMany();

        console.log("SESSIONS:", sessions);

        expect(session).not.toBeNull();
        expect(session?.hashedToken).toBeDefined();
    });
});