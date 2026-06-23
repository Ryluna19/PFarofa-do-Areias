import { createContext, useContext, useState } from "react";
import { loginAdmin } from "../lib/dataService";

const AdminAuthContext = createContext(null);

const TOKEN_KEY = "farofa-admin-token";
const ADMIN_KEY = "farofa-admin";

function carregarAdmin() {
    const adminSalvo = localStorage.getItem(ADMIN_KEY);

    if (!adminSalvo) {
        return null;
    }

    try {
        const admin = JSON.parse(adminSalvo);


        if (
            typeof admin !== "object" ||
            admin === null ||
            Array.isArray(admin)
        ) {
            return null;
        }

        return admin;


    } catch {
        return null;
    }
}

export function AdminAuthProvider({ children }) {
    const [token, setToken] = useState(
        () => localStorage.getItem(TOKEN_KEY) || ""
    );

    const [admin, setAdmin] = useState(carregarAdmin);

    const login = async (email, password) => {
        const result = await loginAdmin(email, password);


        localStorage.setItem(TOKEN_KEY, result.token);
        localStorage.setItem(ADMIN_KEY, JSON.stringify(result.admin));

        setToken(result.token);
        setAdmin(result.admin);

        return result;


    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ADMIN_KEY);


        setToken("");
        setAdmin(null);


    };

    return (
        <AdminAuthContext.Provider
            value={{
                token,
                admin,
                isAuthenticated: Boolean(token),
                login,
                logout,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);

    if (!context) {
        throw new Error("useAdminAuth must be used inside AdminAuthProvider");
    }

    return context;
}
