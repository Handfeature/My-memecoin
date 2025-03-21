import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { COIN_NAME } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, Users, LineChart, DollarSign, Settings, Edit, Trash2, Shield, UserCheck, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Types
type User = {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  walletAddress: string | null;
  role: string;
  createdAt: string;
  isVerified: boolean;
  rewardsPoints: number | null;
  totalTradingVolume: number | null;
};

type TradingPair = {
  id: number;
  baseAsset: string;
  quoteAsset: string;
  pairSymbol: string;
  minTradeAmount: number;
  maxTradeAmount: number | null;
  tradingFee: number | null;
  isActive: boolean | null;
};

// Admin Auth check
const useAdminAuth = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (!user) {
          navigate("/auth");
          return;
        }

        // For our demo, admin is user with ID 1
        if (user.id !== 1) {
          navigate("/");
          return;
        }

        setIsAdmin(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/");
      }
    };

    checkAdmin();
  }, [user, navigate]);

  return { isAdmin, isLoading };
};

// User Management Components
const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest("GET", "/api/admin/users");
        const data = await res.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  // Edit user schema
  const editUserSchema = z.object({
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
    fullName: z.string().optional().nullable(),
    role: z.string().optional(),
    isVerified: z.boolean().optional(),
  });

  const editUserForm = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: selectedUser?.username || "",
      email: selectedUser?.email || "",
      fullName: selectedUser?.fullName || "",
      role: selectedUser?.role || "user",
      isVerified: selectedUser?.isVerified || false,
    },
  });

  useEffect(() => {
    if (selectedUser) {
      editUserForm.reset({
        username: selectedUser.username,
        email: selectedUser.email,
        fullName: selectedUser.fullName,
        role: selectedUser.role,
        isVerified: selectedUser.isVerified,
      });
    }
  }, [selectedUser, editUserForm]);

  const handleEditUser = async (data: z.infer<typeof editUserSchema>) => {
    if (!selectedUser) return;

    try {
      const res = await apiRequest("PATCH", `/api/admin/users/${selectedUser.id}`, data);
      if (res.ok) {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        
        // Update local state
        setUsers(users.map(user => user.id === selectedUser.id ? { ...user, ...data } : user));
        setIsEditDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to update user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const res = await apiRequest("DELETE", `/api/admin/users/${selectedUser.id}`);
      if (res.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        
        // Update local state
        setUsers(users.filter(user => user.id !== selectedUser.id));
        setIsDeleteDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Management
          </CardTitle>
          <CardDescription>
            View, edit, and delete user accounts. Manage user roles and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>List of all registered users</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.fullName || "-"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "admin" 
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" 
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        }`}>
                          {user.role === "admin" ? (
                            <Shield className="h-3 w-3 mr-1" />
                          ) : (
                            <UserCheck className="h-3 w-3 mr-1" />
                          )}
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.isVerified 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}>
                          {user.isVerified ? "Verified" : "Pending"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <Form {...editUserForm}>
            <form onSubmit={editUserForm.handleSubmit(handleEditUser)} className="space-y-4">
              <FormField
                control={editUserForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Full Name" 
                        {...field} 
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="isVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Verified</FormLabel>
                      <FormDescription>
                        Is this user verified?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="accent-primary h-4 w-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" role="alert">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="sr-only">Warning</span>
            <div>
              <span className="font-medium">Delete user: </span> {selectedUser?.username} ({selectedUser?.email})
            </div>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Trading Management Components
const TradingManagement = () => {
  const { toast } = useToast();
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  // Fetch trading pairs
  useEffect(() => {
    const fetchTradingPairs = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest("GET", "/api/admin/trading-pairs");
        const data = await res.json();
        setTradingPairs(data.pairs);
      } catch (error) {
        console.error("Error fetching trading pairs:", error);
        toast({
          title: "Error",
          description: "Failed to fetch trading pairs",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTradingPairs();
  }, [toast]);

  // Trading pair schema
  const tradingPairSchema = z.object({
    baseAsset: z.string().min(1),
    quoteAsset: z.string().min(1),
    pairSymbol: z.string().min(1),
    minTradeAmount: z.coerce.number().positive(),
    maxTradeAmount: z.coerce.number().positive().optional().nullable(),
    tradingFee: z.coerce.number().min(0).max(100).optional().nullable(),
    isActive: z.boolean().default(true),
  });

  const tradingPairForm = useForm<z.infer<typeof tradingPairSchema>>({
    resolver: zodResolver(tradingPairSchema),
    defaultValues: {
      baseAsset: selectedPair?.baseAsset || "",
      quoteAsset: selectedPair?.quoteAsset || "",
      pairSymbol: selectedPair?.pairSymbol || "",
      minTradeAmount: selectedPair?.minTradeAmount || 1,
      maxTradeAmount: selectedPair?.maxTradeAmount || null,
      tradingFee: selectedPair?.tradingFee || null,
      isActive: selectedPair?.isActive ?? true,
    },
  });

  const addTradingPairForm = useForm<z.infer<typeof tradingPairSchema>>({
    resolver: zodResolver(tradingPairSchema),
    defaultValues: {
      baseAsset: "",
      quoteAsset: "",
      pairSymbol: "",
      minTradeAmount: 1,
      maxTradeAmount: null,
      tradingFee: 0.1,
      isActive: true,
    },
  });

  useEffect(() => {
    if (selectedPair) {
      tradingPairForm.reset({
        baseAsset: selectedPair.baseAsset,
        quoteAsset: selectedPair.quoteAsset,
        pairSymbol: selectedPair.pairSymbol,
        minTradeAmount: selectedPair.minTradeAmount,
        maxTradeAmount: selectedPair.maxTradeAmount,
        tradingFee: selectedPair.tradingFee,
        isActive: selectedPair.isActive ?? true,
      });
    }
  }, [selectedPair, tradingPairForm]);

  const handleEditTradingPair = async (data: z.infer<typeof tradingPairSchema>) => {
    if (!selectedPair) return;

    try {
      const res = await apiRequest("PATCH", `/api/admin/trading-pairs/${selectedPair.id}`, data);
      if (res.ok) {
        toast({
          title: "Success",
          description: "Trading pair updated successfully",
        });
        
        // Update local state
        setTradingPairs(tradingPairs.map(pair => 
          pair.id === selectedPair.id ? { ...pair, ...data } : pair
        ));
        setIsEditDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to update trading pair",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating trading pair:", error);
      toast({
        title: "Error",
        description: "Failed to update trading pair",
        variant: "destructive",
      });
    }
  };

  const handleAddTradingPair = async (data: z.infer<typeof tradingPairSchema>) => {
    try {
      const res = await apiRequest("POST", "/api/trading/pairs", data);
      const responseData = await res.json();
      
      if (res.ok) {
        toast({
          title: "Success",
          description: "Trading pair added successfully",
        });
        
        // Update local state
        setTradingPairs([...tradingPairs, responseData.pair]);
        setIsAddDialogOpen(false);
        addTradingPairForm.reset();
      } else {
        toast({
          title: "Error",
          description: responseData.message || "Failed to add trading pair",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding trading pair:", error);
      toast({
        title: "Error",
        description: "Failed to add trading pair",
        variant: "destructive",
      });
    }
  };

  const toggleTradingPairStatus = async (pairId: number, currentStatus: boolean | null) => {
    try {
      const res = await apiRequest("PATCH", `/api/admin/trading-pairs/${pairId}`, {
        isActive: !(currentStatus ?? true)
      });
      
      if (res.ok) {
        toast({
          title: "Success",
          description: `Trading pair ${currentStatus ? "deactivated" : "activated"} successfully`,
        });
        
        // Update local state
        setTradingPairs(tradingPairs.map(pair => 
          pair.id === pairId ? { ...pair, isActive: !(pair.isActive ?? true) } : pair
        ));
      } else {
        toast({
          title: "Error",
          description: "Failed to update trading pair status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating trading pair status:", error);
      toast({
        title: "Error",
        description: "Failed to update trading pair status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              Trading Pair Management
            </CardTitle>
            <Button onClick={() => setIsAddDialogOpen(true)}>Add Trading Pair</Button>
          </div>
          <CardDescription>
            View and manage trading pairs. Control which pairs are active.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>List of all trading pairs</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Pair Symbol</TableHead>
                    <TableHead>Base Asset</TableHead>
                    <TableHead>Quote Asset</TableHead>
                    <TableHead>Min Trade</TableHead>
                    <TableHead>Max Trade</TableHead>
                    <TableHead>Trading Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tradingPairs.map((pair) => (
                    <TableRow key={pair.id}>
                      <TableCell>{pair.id}</TableCell>
                      <TableCell className="font-medium">{pair.pairSymbol}</TableCell>
                      <TableCell>{pair.baseAsset}</TableCell>
                      <TableCell>{pair.quoteAsset}</TableCell>
                      <TableCell>{pair.minTradeAmount.toLocaleString()}</TableCell>
                      <TableCell>{pair.maxTradeAmount?.toLocaleString() || "No limit"}</TableCell>
                      <TableCell>{pair.tradingFee ? `${pair.tradingFee}%` : "0%"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          pair.isActive 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}>
                          {pair.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPair(pair);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={pair.isActive ? "destructive" : "default"} 
                            size="sm"
                            onClick={() => toggleTradingPairStatus(pair.id, pair.isActive)}
                          >
                            {pair.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Trading Pair Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Trading Pair</DialogTitle>
            <DialogDescription>
              Update trading pair information and settings.
            </DialogDescription>
          </DialogHeader>
          <Form {...tradingPairForm}>
            <form onSubmit={tradingPairForm.handleSubmit(handleEditTradingPair)} className="space-y-4">
              <FormField
                control={tradingPairForm.control}
                name="baseAsset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Asset</FormLabel>
                    <FormControl>
                      <Input placeholder="BTC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={tradingPairForm.control}
                name="quoteAsset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote Asset</FormLabel>
                    <FormControl>
                      <Input placeholder="USDT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={tradingPairForm.control}
                name="pairSymbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pair Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="BTC/USDT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={tradingPairForm.control}
                  name="minTradeAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Trade Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={tradingPairForm.control}
                  name="maxTradeAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Trade Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Optional" 
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? null : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={tradingPairForm.control}
                name="tradingFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trading Fee (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.1" 
                        step="0.01"
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={tradingPairForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Is this trading pair active?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value ?? false}
                        onChange={field.onChange}
                        className="accent-primary h-4 w-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Trading Pair Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Trading Pair</DialogTitle>
            <DialogDescription>
              Create a new trading pair.
            </DialogDescription>
          </DialogHeader>
          <Form {...addTradingPairForm}>
            <form onSubmit={addTradingPairForm.handleSubmit(handleAddTradingPair)} className="space-y-4">
              <FormField
                control={addTradingPairForm.control}
                name="baseAsset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Asset</FormLabel>
                    <FormControl>
                      <Input placeholder="BTC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addTradingPairForm.control}
                name="quoteAsset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote Asset</FormLabel>
                    <FormControl>
                      <Input placeholder="USDT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addTradingPairForm.control}
                name="pairSymbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pair Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="BTC/USDT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addTradingPairForm.control}
                  name="minTradeAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Trade Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addTradingPairForm.control}
                  name="maxTradeAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Trade Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Optional" 
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? null : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={addTradingPairForm.control}
                name="tradingFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trading Fee (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.1" 
                        step="0.01"
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addTradingPairForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Is this trading pair active?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value ?? false}
                        onChange={field.onChange}
                        className="accent-primary h-4 w-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Create Trading Pair</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Payment Management Components
const PaymentManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Payment and Funding Management
        </CardTitle>
        <CardDescription>
          Manage payment methods and monitor funding activities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure and manage payment methods for the platform.
              </p>
              <Button className="mt-4 w-full">Manage Payment Methods</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Withdrawal Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review and approve pending withdrawal requests.
              </p>
              <Button className="mt-4 w-full">View Withdrawal Requests</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Deposit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View all deposit transactions on the platform.
              </p>
              <Button className="mt-4 w-full">View Deposit Log</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete history of all financial transactions.
              </p>
              <Button className="mt-4 w-full">View Transaction History</Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

// Website Management Components
const WebsiteManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Website Management
        </CardTitle>
        <CardDescription>
          Edit website content and manage settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Content Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Edit homepage content, news articles, and announcements.
              </p>
              <Button className="mt-4 w-full">Manage Content</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Site Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure general website settings and parameters.
              </p>
              <Button className="mt-4 w-full">Edit Settings</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Customize email templates for notifications and updates.
              </p>
              <Button className="mt-4 w-full">Edit Templates</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View logs of all administrative actions and changes.
              </p>
              <Button className="mt-4 w-full">View Logs</Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Admin Page Component
export default function AdminPage() {
  const { isAdmin, isLoading } = useAdminAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold">Loading Admin Panel</h1>
          <p className="text-muted-foreground">Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You do not have permission to access this area.</p>
          <Button onClick={() => navigate("/")}>Return to Homepage</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-bold text-2xl">Admin Panel</h1>
            </div>
            <Button onClick={() => navigate("/")}>Return to Site</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="trading">
              <LineChart className="h-4 w-4 mr-2" />
              Trading Management
            </TabsTrigger>
            <TabsTrigger value="payments">
              <DollarSign className="h-4 w-4 mr-2" />
              Payment Management
            </TabsTrigger>
            <TabsTrigger value="website">
              <Settings className="h-4 w-4 mr-2" />
              Website Management
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          <TabsContent value="trading">
            <TradingManagement />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentManagement />
          </TabsContent>
          <TabsContent value="website">
            <WebsiteManagement />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-8 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {COIN_NAME} Admin Panel. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}