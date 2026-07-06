import express from 'express';

import authRoutes from "../src/routes/auth.routes";

import userRoutes from "../src/routes/user.routes";

import sessionRoutes from "../src/module/session/session.routes";

import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use("/auth", authRoutes);

app.use("/", userRoutes);

app.use("/session", sessionRoutes);

export default app;