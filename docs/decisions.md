## JTI and Hashing Refresh token

Comparing hashed refresh token, at the time of /refresh needed a unique identifier which lead to
addition of a jti field in the schema.

### Consequences

#### JWT payload

The jwt payload needs to modified from

export interface JwtPayload {
id: string;
role: Role;
};

to

export interface JwtPayload {
id: string;
role: Role;
jti: string;
};

## Evolving the concept of refresh tokens to full fledged sessions

Intially the RefreshToken schema is like:

model RefreshToken {
id String @id @default(uuid())
jti String @unique
userId String
expiresAt DateTime
createdAt DateTime @default(now())
hashedToken String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

which is to be evovled to:

Session

id

userId

jti

hashedToken

deviceName

userAgent

ipAddress

lastUsedAt

expiresAt

createdAt
 