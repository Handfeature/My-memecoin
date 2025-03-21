import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginCredentials>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterCredentials>;
  requestPasswordResetMutation: UseMutationResult<void, Error, { email: string }>;
  resetPasswordMutation: UseMutationResult<void, Error, ResetPasswordData>;
};

type LoginCredentials = {
  username: string;
  password: string;
};

type RegisterCredentials = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  walletAddress?: string;
};

type ResetPasswordData = {
  token: string;
  password: string;
  confirmPassword: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [authToken, setAuthToken] = useState<string | null>(
    localStorage.getItem("auth_token")
  );

  // Query to get current user
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User>({
    queryKey: ["/api/auth/profile"],
    queryFn: async () => {
      try {
        // If no token, don't try to fetch
        if (!authToken) return null;
        
        const res = await apiRequest("GET", "/api/auth/profile", undefined, {
          "user-id": authToken,
        });
        const data = await res.json();
        return data.user;
      } catch (error) {
        // If 401, clear token and return null
        if (error instanceof Error && error.message.includes("401")) {
          localStorage.removeItem("auth_token");
          setAuthToken(null);
          return null;
        }
        throw error;
      }
    },
    // Don't auto-retry auth failures
    retry: false,
    // Don't refetch on window focus for auth
    refetchOnWindowFocus: false,
    // Allow null as successful response
    enabled: Boolean(authToken),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await res.json();
      // Return just the user object
      return data.user;
    },
    onSuccess: (userData) => {
      // Store user ID as token
      const token = String(userData.id);
      localStorage.setItem("auth_token", token);
      setAuthToken(token);
      
      // Update auth state
      queryClient.setQueryData(["/api/auth/profile"], userData);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const res = await apiRequest("POST", "/api/auth/register", credentials);
      const data = await res.json();
      return data.user;
    },
    onSuccess: (userData) => {
      // Store user ID as token
      const token = String(userData.id);
      localStorage.setItem("auth_token", token);
      setAuthToken(token);
      
      // Update auth state
      queryClient.setQueryData(["/api/auth/profile"], userData);
      
      toast({
        title: "Registration successful",
        description: `Welcome to T&E Trading, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // No need for an API call in this implementation
      // Just clear local state
      localStorage.removeItem("auth_token");
      setAuthToken(null);
      queryClient.setQueryData(["/api/auth/profile"], null);
      queryClient.invalidateQueries();
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const requestPasswordResetMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      await apiRequest("POST", "/api/auth/request-reset", data);
    },
    onSuccess: () => {
      toast({
        title: "Password reset requested",
        description: "If your email is registered, you will receive a reset link",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      await apiRequest("POST", "/api/auth/reset-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // If the token changes, refetch the user
  useEffect(() => {
    if (authToken) {
      refetchUser();
    }
  }, [authToken, refetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        requestPasswordResetMutation,
        resetPasswordMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}