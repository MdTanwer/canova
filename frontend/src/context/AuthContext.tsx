import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import api from "../api/axios";

interface User {
  name: string;
  email: string;
  // Add more fields as needed
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/users/me", { withCredentials: true });
        if (
          res &&
          typeof res === "object" &&
          res.data &&
          typeof res.data === "object" &&
          "user" in res.data
        ) {
          setUser((res.data as { user: User }).user);
          setToken("cookie");
        } else {
          setUser(null);
          setToken(null);
        }
      } catch {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  type AuthResponse = { token: string; user: User };

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>(
      "/users/login",
      {
        email,
        password,
      },
      { withCredentials: true }
    );
    setUser(res.data.user);
    setToken("cookie");
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>(
      "/users/register",
      {
        name,
        email,
        password,
      },
      { withCredentials: true }
    );
    setUser(res.data.user);
    setToken("cookie");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Optionally, call a backend logout endpoint to clear the cookie
  };

  const forgotPassword = async (email: string) => {
    await api.post("/users/forgot-password", { email });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, forgotPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
