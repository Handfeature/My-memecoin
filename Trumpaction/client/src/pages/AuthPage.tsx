import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { COIN_NAME, COIN_SYMBOL } from "@/lib/constants";
import { motion } from "framer-motion";

// Login form validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration form validation schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
  fullName: z.string().optional(),
  walletAddress: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Password reset request schema
const resetRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// Password reset schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, isLoading, loginMutation, registerMutation, requestPasswordResetMutation, resetPasswordMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [showResetForm, setShowResetForm] = useState(false);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  // Set up forms
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      walletAddress: "",
    },
  });

  const resetRequestForm = useForm<z.infer<typeof resetRequestSchema>>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: resetToken,
      password: "",
      confirmPassword: "",
    },
  });

  // Update reset token in form when it changes
  useEffect(() => {
    resetPasswordForm.setValue("token", resetToken);
  }, [resetToken, resetPasswordForm]);

  // Form submission handlers
  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  const onResetRequestSubmit = (data: z.infer<typeof resetRequestSchema>) => {
    requestPasswordResetMutation.mutate(data, {
      onSuccess: () => {
        setShowResetForm(false);
        setShowResetPasswordForm(true);
      }
    });
  };

  const onResetPasswordSubmit = (data: z.infer<typeof resetPasswordSchema>) => {
    resetPasswordMutation.mutate(data, {
      onSuccess: () => {
        setShowResetPasswordForm(false);
        setActiveTab("login");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/90 to-background/95 flex flex-col">
      {/* Navigation */}
      <div className="w-full flex justify-between items-center p-4 px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-foreground/60 flex items-center justify-center">
            <span className="text-background font-bold text-xs">{COIN_SYMBOL}</span>
          </div>
          <span className="font-bold text-lg">{COIN_NAME}</span>
        </div>
        <Button variant="link" onClick={() => navigate("/")}>Back to Home</Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto p-4 md:p-10 gap-10">
          {/* Auth Forms */}
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 shadow-xl">
                {!showResetForm && !showResetPasswordForm ? (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login" className="pt-4">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Your password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="text-right">
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-sm" 
                              type="button"
                              onClick={() => setShowResetForm(true)}
                            >
                              Forgot password?
                            </Button>
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in...
                              </>
                            ) : "Log In"}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                    <TabsContent value="register" className="pt-4">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Choose a username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Your email address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Create a password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Confirm password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={registerForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="walletAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Wallet Address (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your Solana wallet address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                              </>
                            ) : "Create Account"}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                ) : showResetForm ? (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold">Reset your password</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter your email address and we'll send you a password reset link
                      </p>
                    </div>
                    <Form {...resetRequestForm}>
                      <form onSubmit={resetRequestForm.handleSubmit(onResetRequestSubmit)} className="space-y-4">
                        <FormField
                          control={resetRequestForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Your email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-col space-y-2">
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={requestPasswordResetMutation.isPending}
                          >
                            {requestPasswordResetMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending reset link...
                              </>
                            ) : "Send Reset Link"}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            type="button"
                            onClick={() => setShowResetForm(false)}
                          >
                            Back to Login
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold">Set new password</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter your reset token and choose a new password
                      </p>
                    </div>
                    <Form {...resetPasswordForm}>
                      <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={resetPasswordForm.control}
                          name="token"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reset Token</FormLabel>
                              <FormControl>
                                <Input placeholder="Paste your reset token here" {...field} onChange={(e) => {
                                  setResetToken(e.target.value);
                                  field.onChange(e);
                                }} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={resetPasswordForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Create a new password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={resetPasswordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirm your new password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-col space-y-2">
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={resetPasswordMutation.isPending}
                          >
                            {resetPasswordMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resetting password...
                              </>
                            ) : "Reset Password"}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            type="button"
                            onClick={() => {
                              setShowResetPasswordForm(false);
                              setActiveTab("login");
                            }}
                          >
                            Back to Login
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Hero Section */}
          <motion.div 
            className="flex-1 flex flex-col justify-center max-w-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to {COIN_NAME} Trading Platform</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Trade {COIN_SYMBOL} on the Solana network, track your portfolio, and earn rewards with our gamified trading experience.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-card rounded-lg border">
                <h3 className="font-semibold mb-1">Real-time Trading</h3>
                <p className="text-sm text-muted-foreground">Access real-time market data and trade with low fees</p>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <h3 className="font-semibold mb-1">Rewards System</h3>
                <p className="text-sm text-muted-foreground">Earn points and climb the leaderboard</p>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <h3 className="font-semibold mb-1">Secure Transactions</h3>
                <p className="text-sm text-muted-foreground">State-of-the-art security for all trades</p>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <h3 className="font-semibold mb-1">Community</h3>
                <p className="text-sm text-muted-foreground">Join a vibrant community of traders</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}