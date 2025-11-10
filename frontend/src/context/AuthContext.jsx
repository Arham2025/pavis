import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // null = not logged in
    const [loading, setLoading] = useState(true);

    // Check if already logged in (when app loads)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get("/users/profile", { withCredentials: true });
                setUser(res.data);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = (userData) => {
        setUser(userData.userData);
    };

    const logout = async () => {
        const response = await axios.get("/users/logout", {}, { withCredentials: true });
        setUser(null);
        return response;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
