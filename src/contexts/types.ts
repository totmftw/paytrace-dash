// Type definitions used in the application
export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    image?: string; // Add image property
    // Add other user profile fields as necessary
}

export interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

export interface User {
    id: string;
    email: string;
    name?: string; // Add name property
    image?: string; // Add image property
    // Add other user fields as necessary
}
