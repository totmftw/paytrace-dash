import { useState, useEffect } from "react";

// Mock user data for demonstration purposes
const mockUser = {
  id: "12345",
  name: "John Doe",
  role: "IT admin", // Possible roles: "IT admin", "user", etc.
};

export function useAuth() {
  const [user, setUser] = useState(mockUser);

  useEffect(() => {
    // In a real application, you would fetch user data from an authentication service
    // For this example, we are using a mock user
    setUser(mockUser);
  }, []);

  return { user };
}