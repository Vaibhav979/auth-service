import express from 'express';

import helmet from "helmet";

import authRoutes from "./module/auth/auth.routes";

import userRoutes from "./module/user/user.routes";

import sessionRoutes from "../src/module/session/session.routes";

import cookieParser from "cookie-parser";

const app = express();

app.use(helmet());

app.use(express.json());

app.use(cookieParser());

app.use("/auth", authRoutes);

app.use("/", userRoutes);

app.use("/session", sessionRoutes);

export default app;