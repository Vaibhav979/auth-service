import request from "supertest";

import { hashPassword } from "../../shared/utils/password";

import { beforeEach, describe, it, expect, vi } from "vitest";

import { sendVerificationEmail } from "../../module/email/email.service";

beforeEach(async () => {
    await prisma.passwordResetToken.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
});

vi.mock(
    "../../module/email/email.service",
    async (importOriginal) => {
        const actual =
            await importOriginal<
                typeof import("../../module/email/email.service")
            >();

        return {
            ...actual,
            sendVerificationEmail: vi.fn(),
            sendPasswordResetEmail: vi.fn()
        };
    }
);

import app from "../../app";
import { prisma } from "../../config/prisma";

describe("POST /auth/register", () => {

    it("should return 201 when user is created successfully", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "Test user",
                email: "register-test@example.com",
                password: "Password123!"
            });

        expect(response.status).toBe(201);

        expect(response.body.message).toBe("Registration successful. Please verify your email and login.");

        expect(response.body.user).toBeDefined();

        expect(response.body.user.email).toBe(
            "register-test@example.com"
        );

        const user = await prisma.user.findUnique({
            where: {
                email: "register-test@example.com"
            }
        });
        expect(user).not.toBeNull();

        expect(user?.email).toBe(
            "register-test@example.com"
        );

        expect(user?.name).toBe(
            "Test user"
        );

        expect(user?.verified).toBe(false);
    });

    it("should return 409 when user already exists", async () => {
        await prisma.user.create({
            data: {
                name: "Existing user",
                email: "existing@example.com",
                password: await hashPassword("Password123!"),
                verified: true
            }
        });

        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "Another user",
                email: "existing@example.com",
                password: "Password123!"
            });

        expect(response.status).toBe(409);

        expect(response.body.message).toBe("User Already Exists");
    });

    it("should resend verification email for an unverified user", async () => {

        await prisma.user.create({
            data: {
                name: "Unverified user",
                email: "unverified@example.com",
                password: await hashPassword("Password123!"),
                verified: false
            }
        });

        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "Unverified user",
                email: "unverified@example.com",
                password: "Password123!"
            });

        expect(response.status).toBe(201);

        expect(response.body.message).toBe("Verification email sent");

        expect(sendVerificationEmail).toHaveBeenCalledWith(
            "unverified@example.com",
            expect.any(String),
            expect.any(String)
        );
    });

    it("should return 400 for invalid registration data", async () => {

        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "",
                email: "not-an-email",
                password: "123"
            });

        expect(response.status).toBe(400);

        expect(response.body.message).toBe(
            "Validation Error"
        );

        expect(response.body.errors).toBeDefined();
    });

});