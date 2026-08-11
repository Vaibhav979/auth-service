import request from "supertest";

import { describe, it, expect } from "vitest";

import app from "../app";

describe("Health API", () => {

    it("should return 200 when service is healthy", async () => {

        const response = await request(app)
            .get("/health");

        expect(response.status).toBe(200);

        expect(response.body.status).toBe("UP");

    });

});