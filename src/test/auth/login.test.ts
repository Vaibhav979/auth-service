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

    it("should reject login with wrong password", async () => {
        const correctPassword = "Password123!";
        const wrongPassword = "WrongPassword123!";

        const hashedPassword = await hashPassword(correctPassword);

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
                password: wrongPassword
            });

        expect(response.status).toBe(401);

        expect(response.body.message).toBe("Invalid Credentials");

        // No tokens should be issued
        expect(response.body.accessToken).toBeUndefined();
        expect(response.body.refreshToken).toBeUndefined();

        // No session should be created
        const sessions = await prisma.session.findMany();

        expect(sessions).toHaveLength(0);
    });

    it("should reject login when user does not exist", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "doesnotexist@example.com",
                password: "Password123!"
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid Credentials");

        expect(response.body.accessToken).toBeUndefined();
        expect(response.body.refreshToken).toBeUndefined();

        const sessions = await prisma.session.findMany();

        expect(sessions).toHaveLength(0);
    });

    it("should reject login for unverified user and resend verification email", async () => {
        const password = "Password123!";
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name: "Unverified User",
                email: "unverified@example.com",
                password: hashedPassword,
                verified: false
            }
        });

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: user.email,
                password
            });

        expect(response.status).toBe(403);

        expect(response.body.message).toBe(
            "Please verify your email. A new verification email has been sent."
        );

        expect(response.body.accessToken).toBeUndefined();
        expect(response.body.refreshToken).toBeUndefined();

        // Verification token should have been created
        const verificationToken = await prisma.verificationToken.findUnique({
            where: {
                userId: user.id
            }
        });

        expect(verificationToken).not.toBeNull();

        // Email should have been sent
        const { sendVerificationEmail } = await import(
            "../../module/email/email.service"
        );

        expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
        expect(sendVerificationEmail).toHaveBeenCalledWith(
            user.email,
            user.id,
            expect.any(String)
        );

        // No login session should exist
        const sessions = await prisma.session.findMany();

        expect(sessions).toHaveLength(0);
    });

    // validation test
    it("should reject invalid login input", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "not-an-email",
                password: ""
            });

        expect(response.status).toBe(400);

        expect(response.body.message).toBe("Validation Error");

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it("should reject login when required fields are missing", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({});

        expect(response.status).toBe(400);

        expect(response.body.message).toBe("Validation Error");

        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    field: "email"
                }),
                expect.objectContaining({
                    field: "password"
                })
            ])
        );
    });
});