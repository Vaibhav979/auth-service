import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(5000),

    DATABASE_URL: z.string(),

    JWT_SECRET: z.string().min(32),

    REFRESH_TOKEN_SECRET: z.string().min(32)
});

export const env = envSchema.parse(process.env);