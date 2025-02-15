import React, { createContext, useContext, useEffect, useState } from 'react';
import { getInitialSession, getAuthStateChangeSubscription, signOut } from '../contexts/constants';
import { AuthContextType, User } from '../contexts/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initialSession = getInitialSession();
        setUser(initialSession);
        const unsubscribe = getAuthStateChangeSubscription();

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
