import React, { createContext, useContext, useEffect, useState } from 'react';
import { getInitialSession, getAuthStateChangeSubscription } from './constants';
import { AuthContextType, UserProfile, User } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initialSession = getInitialSession();
        initialSession.then(session => {
            if (session && session.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.name || '',
                    image: session.user.image || '',
                } as User);
            }
            setLoading(false);
        });

        const unsubscribe = getAuthStateChangeSubscription();

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        // Logic to sign out the user
    };

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
