import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("mvai_token");
    const saved = localStorage.getItem("mvai_user");
    if (token && saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const signin = async (email, password) => {
    const res  = await fetch("http://localhost:5000/api/auth/signin", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Sign in failed");
    localStorage.setItem("mvai_token", data.token);
    localStorage.setItem("mvai_user",  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const signup = async (name, email, password) => {
    const res  = await fetch("http://localhost:5000/api/auth/signup", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Sign up failed");
    localStorage.setItem("mvai_token", data.token);
    localStorage.setItem("mvai_user",  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const signout = () => {
    localStorage.removeItem("mvai_token");
    localStorage.removeItem("mvai_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signup, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}