import { type TokenPayload, type UserAttributes } from "./types";

function base64UrlDecode(input: string): string {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    if (typeof atob === "function") {
        return atob(base64);
    }
    // Node.js fallback
    return Buffer.from(base64, "base64").toString("binary");
}

export function parseJwtUniversal(token: string): TokenPayload {
    const base64Url = token.split(".")[1];
    const json = base64UrlDecode(base64Url);
    return JSON.parse(json);
}

export function extractAttributesFromIdToken(token: string): UserAttributes {
    const payload = parseJwtUniversal(token) as any;
    const attrs: UserAttributes = {
        email: payload.email,
        given_name: payload.given_name,
        family_name: payload.family_name,
        // Extract role information from Cognito groups
        role: payload["cognito:groups"]?.[0] || "user", // Default to 'user' if no groups
        groups: payload["cognito:groups"] || [],
    } as UserAttributes;
    // Copy any additional string fields
    for (const key of Object.keys(payload)) {
        const value = payload[key];
        if (typeof value === "string" && !(key in attrs)) {
            (attrs as any)[key] = value;
        }
    }
    return attrs;
}
