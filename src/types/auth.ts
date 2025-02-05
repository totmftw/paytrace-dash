export type User = {
  id: string;
  email: string;
  isAdmin?: boolean;
  role?: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any; }>; 
  signOut: () => Promise<{ error: any }>; 
  resetPassword: (email: string) => Promise<{ error: any }>; 
};