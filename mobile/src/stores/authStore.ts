/**
 * App Auth Store (wraps standalone auth library)
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CognitoAuth } from "@/services/auth";

const AWS_REGION = process.env.EXPO_PUBLIC_CDK_AWS_REGION || "";
const COGNITO_USER_POOL_CLIENT_ID = process.env.EXPO_PUBLIC_APP_CLIENT_ID || "";

// Basic runtime validation to surface misconfiguration early
const ENV_ERRORS: string[] = [];
if (!AWS_REGION) ENV_ERRORS.push("EXPO_PUBLIC_CDK_AWS_REGION");
if (!COGNITO_USER_POOL_CLIENT_ID) ENV_ERRORS.push("EXPO_PUBLIC_APP_CLIENT_ID");
if (ENV_ERRORS.length) {
    console.warn(`[Auth] Missing environment variables: ${ENV_ERRORS.join(", ")}`);
}

type AppUser = {
    email: string;
    given_name?: string;
    family_name?: string;
    role?: string;
    groups?: string[];
};

interface AuthErrorInfo {
    code?: string;
    message?: string;
}

interface AuthState {
    user: AppUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    lastError: AuthErrorInfo | null;
    login: (email: string, password: string) => Promise<{ success: true } | { success: false; code?: string; message?: string }>;
    logout: () => Promise<void>;
}

const auth = new CognitoAuth({
    region: AWS_REGION,
    userPoolClientId: COGNITO_USER_POOL_CLIENT_ID,
    persist: true,
    // Use AsyncStorage persistence beneath our library store
    storage: {
        getItem: (k: string) => AsyncStorage.getItem(k) as unknown as string | null,
        setItem: (k: string, v: string) => {
            void AsyncStorage.setItem(k, v);
        },
        removeItem: (k: string) => {
            void AsyncStorage.removeItem(k);
        },
    },
    storageKey: "@auth/store",
});

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: auth.store.getState().user ?? null,
            isLoading: false,
            isAuthenticated: auth.isAuthenticated(),
            get isAdmin() {
                return get().user?.role === "admin" || !!get().user?.groups?.includes("admin");
            },
            lastError: null,

            login: async (email: string, password: string) => {
                const username = email.trim().toLowerCase();
                const pwd = password;
                if (ENV_ERRORS.length) {
                    console.error("[Auth] Cannot login due to missing env vars:", ENV_ERRORS);
                    const error = { code: "EnvMissing", message: `Missing env vars: ${ENV_ERRORS.join(", ")}` } as const;
                    set({ lastError: error });
                    return { success: false, ...error };
                }
                set({ isLoading: true });
                try {
                    await auth.login(username, pwd);
                    const { user } = auth.store.getState();
                    set({
                        user: user ?? null,
                        isAuthenticated: !!user,
                        lastError: null,
                    });
                    return { success: true } as const;
                } catch (e: unknown) {
                    const code = (e as any)?.code ?? (e as any)?.name;
                    const message = (e as any)?.message;
                    console.error(`[Auth] Login failed${code ? ` (${code})` : ""}${message ? `: ${message}` : ""}`, e);
                    const error = { code, message } as const;
                    set({ lastError: error });
                    return { success: false, ...error };
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                await auth.logout();
                set({ user: null, isAuthenticated: false });
            },
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        },
    ),
);

export const useAuth = () => {
    const { user, isLoading, isAuthenticated, isAdmin, login, logout } = useAuthStore();
    return { user, isLoading, isAuthenticated, isAdmin, login, logout };
};
