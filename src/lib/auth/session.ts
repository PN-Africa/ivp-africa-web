export interface Session {
  email: string;
  role: string;
  displayName?: string;
  avatarUrl?: string;
  redirectPath?: string;
  accessToken?: string;
}
const SESSION_KEY = "ivp_session";
type Listener = (data: Session | null) => void;
const listeners = new Set<Listener>();

export const session = {
  set(data: Session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    listeners.forEach((listener) => listener(data));
  },
  get(): Session | null {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null");
    } catch {
      return null;
    }
  },
  clear() {
    localStorage.removeItem(SESSION_KEY);
    listeners.forEach((listener) => listener(null));
  },
 subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
},
};
