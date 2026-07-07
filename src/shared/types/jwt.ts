import { Role } from "@prisma/client";

export interface AccessTokenPayload {
    id: string;
    role: Role;    
};

export interface RefreshTokenPayload {
    id: string;
    jti: string
};