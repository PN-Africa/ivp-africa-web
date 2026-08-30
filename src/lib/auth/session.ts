export interface Session {
  id: string;
  email: string;
  role: string;
  displayName?: string;
  avatarUrl?: string;
  redirectPath?: string;
  accessToken?: string;
}

const SESSION_KEY = "ivp_session";
const ACCESS_TOKEN_KEY = "access_token";

type Listener = (data: Session | null) => void;

const listeners = new Set<Listener>();

export const session = {
  set(data: Session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));

    if (data.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    }

    listeners.forEach((listener) => listener(data));
  },

  get(): Session | null {
    if (typeof window === "undefined") return null;

    try {
      return JSON.parse(
        localStorage.getItem(SESSION_KEY) ?? "null"
      );
    } catch {
      return null;
    }
  },

  clear() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);

    listeners.forEach((listener) => listener(null));
  },

  subscribe(listener: Listener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },
};