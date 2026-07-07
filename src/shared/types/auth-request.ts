import { Request } from "express";
import { AccessTokenPayload } from "./jwt";

export interface AuthRequest extends Request {
    user: AccessTokenPayload;
}