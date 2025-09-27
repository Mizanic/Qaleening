import { z } from "zod";

export interface TokenPayload {
    exp: number;
    [key: string]: any;
}

export type AuthResult = {
    AccessToken?: string;
    IdToken?: string;
    RefreshToken?: string;
};

// v2 additions for framework-agnostic package shape
export type TokenSet = {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
};

export type AuthStatus =
    | { state: "signed_out" }
    | { state: "needs_confirmation"; username: string }
    | { state: "signed_in"; user: UserAttributes; tokens: TokenSet };

export type AuthEvents = {
    onSignedIn?: (status: Extract<AuthStatus, { state: "signed_in" }>) => void;
    onSignedOut?: () => void;
    onTokenRefreshed?: (tokens: TokenSet) => void;
};

export type AuthConfig = {
    region: string;
    userPoolClientId: string;
    // Optional: override client creation (useful for SSR or custom transports)
    cognitoClientFactory?: () => any;
};

export const UserSchema = z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    password: z.string().min(8),
});

export type UserAttributes = {
    email: string;
    given_name: string;
    family_name: string;
    role?: string;
    groups?: string[];
    [key: string]: string | string[] | undefined;
};

export type User = z.infer<typeof UserSchema>;
