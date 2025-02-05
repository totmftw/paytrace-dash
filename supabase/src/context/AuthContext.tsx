import React, { createContext, useContext, useEffect, useState } from 'react';
import { getInitialSession, getAuthStateChangeSubscription } from './constants';
import { AuthContextType, User } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Logic to get initial session and subscribe to auth state changes
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
