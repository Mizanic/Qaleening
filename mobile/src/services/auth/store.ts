import { createStore, type StoreApi } from "zustand/vanilla";
import { type AuthEvents, type AuthStatus, type TokenSet, type UserAttributes } from "./types";

export type KeyValueStorage = {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
};

export type AuthStoreState = {
    status: AuthStatus;
    tokens: TokenSet;
    user: UserAttributes | null;
    // Actions
    setSignedIn: (user: UserAttributes, tokens: TokenSet) => void;
    setSignedOut: () => void;
    updateTokens: (tokens: TokenSet) => void;
    setUser: (user: UserAttributes | null) => void;
};

export type AuthStore = StoreApi<AuthStoreState>;

export type CreateAuthStoreOptions = {
    persist?: boolean;
    storage?: KeyValueStorage;
    storageKey?: string;
    events?: AuthEvents;
};

function getDefaultStorage(): KeyValueStorage {
    if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage;
    }
    // In-memory fallback storage for non-browser environments
    const memory = new Map<string, string>();
    return {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => {
            memory.set(key, value);
        },
        removeItem: (key: string) => {
            memory.delete(key);
        },
    };
}

const DEFAULT_STORAGE_KEY = "@auth/store";

export function createAuthStore(options?: CreateAuthStoreOptions): AuthStore {
    const { persist = true, storage = getDefaultStorage(), storageKey = DEFAULT_STORAGE_KEY, events } = options ?? {};

    const initialState: AuthStoreState = {
        status: { state: "signed_out" },
        tokens: {},
        user: null,
        setSignedIn: (user: UserAttributes, tokens: TokenSet) => {
            store.setState({ status: { state: "signed_in", user, tokens }, user, tokens });
            if (persist) persistState();
            events?.onSignedIn?.(store.getState().status as Extract<AuthStatus, { state: "signed_in" }>);
        },
        setSignedOut: () => {
            store.setState({ status: { state: "signed_out" }, user: null, tokens: {} });
            if (persist) persistState();
            events?.onSignedOut?.();
        },
        updateTokens: (tokens: TokenSet) => {
            const current = store.getState();
            const mergedTokens: TokenSet = {
                accessToken: tokens.accessToken ?? current.tokens.accessToken,
                idToken: tokens.idToken ?? current.tokens.idToken,
                refreshToken: tokens.refreshToken ?? current.tokens.refreshToken,
            };
            store.setState({ tokens: mergedTokens, status: mergeStatusTokens(current.status, mergedTokens) });
            if (persist) persistState();
            events?.onTokenRefreshed?.(mergedTokens);
        },
        setUser: (user: UserAttributes | null) => {
            const current = store.getState();
            store.setState({ user, status: mergeStatusUser(current.status, user) });
            if (persist) persistState();
        },
    };

    const store = createStore<AuthStoreState>(() => initialState);

    function persistState(): void {
        try {
            const state = store.getState();
            storage.setItem(storageKey, JSON.stringify({ tokens: state.tokens, user: state.user, status: state.status }));
        } catch {
            // Ignore persistence errors (storage quota, etc.)
        }
    }

    function rehydrate(): void {
        try {
            const raw = storage.getItem(storageKey);
            if (!raw) return;
            const parsed = JSON.parse(raw) as Partial<Pick<AuthStoreState, "tokens" | "user" | "status">>;
            const tokens = parsed.tokens ?? {};
            const user = parsed.user ?? null;
            const status = normalizeStatus(parsed.status, tokens, user);
            store.setState({ tokens, user, status });
        } catch {
            // Ignore invalid persisted data and start fresh
            store.setState({ status: { state: "signed_out" }, tokens: {}, user: null });
        }
    }

    if (persist) {
        rehydrate();
    }

    return store;
}

function normalizeStatus(status: Partial<AuthStatus> | undefined, tokens: TokenSet, user: UserAttributes | null): AuthStatus {
    if (status?.state === "needs_confirmation" && (status as any).username) {
        return { state: "needs_confirmation", username: (status as any).username };
    }
    if (tokens?.accessToken && tokens?.idToken && user) {
        return { state: "signed_in", user, tokens };
    }
    return { state: "signed_out" };
}

function mergeStatusTokens(status: AuthStatus, tokens: TokenSet): AuthStatus {
    if (status.state === "signed_in") {
        return { state: "signed_in", user: status.user, tokens: { ...status.tokens, ...tokens } };
    }
    return status;
}

function mergeStatusUser(status: AuthStatus, user: UserAttributes | null): AuthStatus {
    if (status.state === "signed_in" && user) {
        return { state: "signed_in", user, tokens: status.tokens };
    }
    if (status.state === "signed_in" && !user) {
        return { state: "signed_out" };
    }
    return status;
}
