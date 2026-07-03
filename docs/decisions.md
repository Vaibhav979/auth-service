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
