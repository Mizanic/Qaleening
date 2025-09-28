import {
    AuthFlowType,
    ChangePasswordCommand,
    CognitoIdentityProviderClient,
    ConfirmForgotPasswordCommand,
    ConfirmSignUpCommand,
    ForgotPasswordCommand,
    GlobalSignOutCommand,
    InitiateAuthCommand,
    ResendConfirmationCodeCommand,
    SignUpCommand,
    UpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { type AuthConfig, type AuthResult, type User, type UserAttributes, UserSchema } from "./types";
import { type AuthStore, type CreateAuthStoreOptions, createAuthStore } from "./store";
import { extractAttributesFromIdToken, extractAttributesFromTokens, parseJwtUniversal } from "./jwt";
import { AuthError, ValidationError } from "./errors";
import { ZodError } from "zod";

export type CognitoAuthDeps = AuthConfig & CreateAuthStoreOptions;

export class CognitoAuth {
    private readonly client: CognitoIdentityProviderClient;
    private readonly clientId: string;
    readonly store: AuthStore;

    constructor(deps: CognitoAuthDeps) {
        this.clientId = deps.userPoolClientId;
        this.client = deps.cognitoClientFactory
            ? (deps.cognitoClientFactory() as CognitoIdentityProviderClient)
            : new CognitoIdentityProviderClient({ region: deps.region });
        this.store = createAuthStore(deps);
    }

    async login(username: string, password: string): Promise<AuthResult> {
        try {
            const command = new InitiateAuthCommand({
                AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
                ClientId: this.clientId,
                AuthParameters: { USERNAME: username, PASSWORD: password },
            });
            const response = await this.client.send(command);
            const result = response.AuthenticationResult as AuthResult | undefined;
            if (result?.AccessToken && result.IdToken) {
                const tokens = {
                    accessToken: result.AccessToken,
                    idToken: result.IdToken,
                    refreshToken: result.RefreshToken,
                };
                // Debug: Log token claims relevant for role/group detection
                try {
                    const idPayload = parseJwtUniversal(result.IdToken as string) as any;
                    const accessPayload = parseJwtUniversal(result.AccessToken as string) as any;
                    console.log("[CognitoAuth] Login claims", {
                        idEmail: idPayload?.email,
                        idGroups: idPayload?.["cognito:groups"],
                        customRole: idPayload?.["custom:role"],
                        accessGroups: accessPayload?.["cognito:groups"],
                    });
                } catch (e) {
                    console.warn("[CognitoAuth] Failed to parse token payloads for logging", e);
                }
                const user = extractAttributesFromTokens(result.IdToken, result.AccessToken);
                console.log("[CognitoAuth] Derived user from tokens", { role: user.role, groups: user.groups, email: user.email });
                this.store.getState().setSignedIn(user, tokens);
                return result;
            }
            throw new AuthError("Incomplete authentication result", "IncompleteAuthResult");
        } catch (error: any) {
            if (error?.name === "UserNotConfirmedException") {
                // move store to needs_confirmation state for UX
                this.store.setState({ status: { state: "needs_confirmation", username } as any });
                throw new AuthError("User not confirmed", "UserNotConfirmedException");
            }
            if (error?.name === "UserNotFoundException" || error?.name === "NotAuthorizedException") {
                throw new AuthError("Invalid email or password", error.name);
            }
            throw new AuthError(error?.message ?? "Login failed", error?.name ?? "LoginError");
        }
    }

    async signUp(user: User, recaptchaToken?: string): Promise<void> {
        try {
            UserSchema.parse(user);

            const command = new SignUpCommand({
                ClientId: this.clientId,
                Username: user.email,
                Password: user.password,
                UserAttributes: [
                    { Name: "email", Value: user.email },
                    { Name: "given_name", Value: user.firstName },
                    { Name: "family_name", Value: user.lastName },
                ],
                ValidationData: recaptchaToken ? [{ Name: "recaptchaToken", Value: recaptchaToken }] : undefined,
            });
            await this.client.send(command);
        } catch (error: any) {
            if (error instanceof ZodError) {
                throw new ValidationError(error.errors.map((e) => e.message).join(", "));
            }
            throw new AuthError(error?.message ?? "Sign up failed", error?.name ?? "SignUpError");
        }
    }

    async confirmSignUp(username: string, code: string): Promise<void> {
        try {
            const command = new ConfirmSignUpCommand({
                ClientId: this.clientId,
                Username: username,
                ConfirmationCode: code,
            });
            await this.client.send(command);
            // After confirm, user can sign in
            if ((this.store.getState().status as any).state === "needs_confirmation") {
                this.store.setState({ status: { state: "signed_out" } });
            }
        } catch (error: any) {
            throw new AuthError(error?.message ?? "Confirm sign up failed", error?.name ?? "ConfirmSignUpError");
        }
    }

    async resendVerificationCode(username: string): Promise<void> {
        try {
            const command = new ResendConfirmationCodeCommand({
                ClientId: this.clientId,
                Username: username,
            });
            await this.client.send(command);
        } catch (error: any) {
            throw new AuthError(error?.message ?? "Resend code failed", error?.name ?? "ResendCodeError");
        }
    }

    async forgotPassword(username: string): Promise<void> {
        try {
            const command = new ForgotPasswordCommand({
                ClientId: this.clientId,
                Username: username,
            });
            await this.client.send(command);
        } catch (error: any) {
            throw new AuthError(error?.message ?? "Forgot password failed", error?.name ?? "ForgotPasswordError");
        }
    }

    async confirmForgotPassword(username: string, code: string, newPassword: string): Promise<void> {
        try {
            const command = new ConfirmForgotPasswordCommand({
                ClientId: this.clientId,
                Username: username,
                ConfirmationCode: code,
                Password: newPassword,
            });
            await this.client.send(command);
        } catch (error: any) {
            throw new AuthError(error?.message ?? "Confirm forgot password failed", error?.name ?? "ConfirmForgotPasswordError");
        }
    }

    async changePassword(accessToken: string, oldPassword: string, newPassword: string): Promise<void> {
        try {
            const command = new ChangePasswordCommand({
                AccessToken: accessToken,
                PreviousPassword: oldPassword,
                ProposedPassword: newPassword,
            });
            await this.client.send(command);
        } catch (error: any) {
            if (error?.name === "InvalidPasswordException") {
                throw new AuthError("Invalid password format", error.name);
            }
            if (error?.name === "NotAuthorizedException") {
                throw new AuthError("Incorrect old password", error.name);
            }
            throw new AuthError(error?.message ?? "Change password failed", error?.name ?? "ChangePasswordError");
        }
    }

    async logout(): Promise<void> {
        const accessToken = this.store.getState().tokens.accessToken;
        if (!accessToken) {
            // Best-effort sign-out if no token
            this.store.getState().setSignedOut();
            return;
        }
        try {
            const command = new GlobalSignOutCommand({ AccessToken: accessToken });
            await this.client.send(command);
        } finally {
            this.store.getState().setSignedOut();
        }
    }

    isAuthenticated(): boolean {
        const { tokens } = this.store.getState();
        const access = tokens.accessToken;
        const refresh = tokens.refreshToken;
        if (!access || !refresh) return false;
        try {
            const decoded = parseJwtUniversal(access);
            return decoded.exp > Date.now() / 1000;
        } catch {
            return false;
        }
    }

    async refreshSession(): Promise<AuthResult> {
        const refreshToken = this.store.getState().tokens.refreshToken;
        if (!refreshToken) {
            throw new AuthError("No refresh token found", "NoRefreshToken");
        }
        try {
            const command = new InitiateAuthCommand({
                AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
                ClientId: this.clientId,
                AuthParameters: { REFRESH_TOKEN: refreshToken },
            });
            const response = await this.client.send(command);
            const result = response.AuthenticationResult as AuthResult | undefined;
            if (result?.AccessToken && result.IdToken) {
                const tokens = {
                    accessToken: result.AccessToken,
                    idToken: result.IdToken,
                    refreshToken: refreshToken,
                };
                this.store.getState().updateTokens(tokens);
                // Debug: Log token claims relevant for role/group detection on refresh
                try {
                    const idPayload = parseJwtUniversal(result.IdToken as string) as any;
                    const accessPayload = parseJwtUniversal(result.AccessToken as string) as any;
                    console.log("[CognitoAuth] Refresh claims", {
                        idEmail: idPayload?.email,
                        idGroups: idPayload?.["cognito:groups"],
                        customRole: idPayload?.["custom:role"],
                        accessGroups: accessPayload?.["cognito:groups"],
                    });
                } catch (e) {
                    console.warn("[CognitoAuth] Failed to parse token payloads for logging (refresh)", e);
                }
                const user = extractAttributesFromTokens(result.IdToken, result.AccessToken);
                console.log("[CognitoAuth] Derived user after refresh", { role: user.role, groups: user.groups, email: user.email });
                this.store.getState().setUser(user);
                return result;
            }
            throw new AuthError("Incomplete refresh result", "IncompleteRefreshResult");
        } catch (error: any) {
            throw new AuthError(error?.message ?? "Refresh failed", error?.name ?? "RefreshError");
        }
    }

    async checkAuthStatus(): Promise<boolean> {
        if (this.isAuthenticated()) return true;
        try {
            const refreshed = await this.refreshSession();
            return !!refreshed;
        } catch {
            return false;
        }
    }

    async updateUserAttributes(attributes: Partial<UserAttributes>): Promise<void> {
        const accessToken = this.store.getState().tokens.accessToken;
        if (!accessToken) {
            throw new AuthError("No access token found", "NoAccessToken");
        }
        const userAttributes = Object.entries(attributes)
            .filter(([, value]) => value !== undefined)
            .map(([Name, Value]) => ({ Name, Value: Value as string }));
        try {
            const command = new UpdateUserAttributesCommand({
                AccessToken: accessToken,
                UserAttributes: userAttributes,
            });
            await this.client.send(command);
            const currentUser = this.store.getState().user ?? ({} as UserAttributes);
            const updatedUser = { ...currentUser } as UserAttributes;
            for (const [key, value] of Object.entries(attributes)) {
                if (value !== undefined) {
                    (updatedUser as any)[key] = value as string;
                }
            }
            this.store.getState().setUser(updatedUser);
        } catch (error: any) {
            throw new AuthError(error?.message ?? "Update user attributes failed", error?.name ?? "UpdateUserAttributesError");
        }
    }
}
