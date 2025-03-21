import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { COIN_NAME, COIN_SYMBOL } from "@/lib/constants";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Loader2, 
  Calendar, 
  User, 
  Tag, 
  ChevronRight, 
  Clock,
  Search,
  Plus,
  Share2,
  MessageSquare,
  Bookmark
} from "lucide-react";

// Type definitions
type NewsArticle = {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  author: string | null;
  publishDate: string | null;
  isPublished: boolean | null;
  imageUrl: string | null;
  tags: string[] | null;
};

// Newsletter subscription schema
const subscribeSchema = z.object({
  email: z.string().email("Invalid email address")
});

// News article search schema
const searchSchema = z.object({
  query: z.string().min(1, "Search query is required")
});

// News article creation schema
const articleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  author: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.string().optional().transform(val => 
    val ? val.split(',').map(tag => tag.trim()) : []
  ),
});

export default function NewsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Forms
  const subscribeForm = useForm<z.infer<typeof subscribeSchema>>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: "",
    },
  });

  const searchForm = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
    },
  });

  const articleForm = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      summary: "",
      content: "",
      author: user?.fullName || "",
      imageUrl: "",
      tags: "",
    },
  });

  // Fetch all news articles
  const {
    data: newsArticles,
    isLoading: isLoadingNews,
    isError: isNewsError,
    refetch: refetchNews,
  } = useQuery({
    queryKey: ["/api/news"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/news");
      const data = await res.json();
      return data.articles as NewsArticle[];
    },
  });

  // Fetch single article details
  const {
    data: selectedArticle,
    isLoading: isLoadingArticle,
    isError: isArticleError,
  } = useQuery({
    queryKey: ["/api/news", selectedArticleId],
    queryFn: async () => {
      if (!selectedArticleId) return null;
      const res = await apiRequest("GET", `/api/news/${selectedArticleId}`);
      const data = await res.json();
      return data.article as NewsArticle;
    },
    enabled: !!selectedArticleId,
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof subscribeSchema>) => {
      const res = await apiRequest("POST", "/api/subscribe", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscribed successfully",
        description: "Thank you for subscribing to our newsletter!",
      });
      setIsSubscribed(true);
      subscribeForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create article mutation (admin only)
  const createArticleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof articleSchema>) => {
      if (!user) throw new Error("You must be logged in to create articles");
      
      const res = await apiRequest("POST", "/api/news", {
        ...data,
        isPublished: true,
        publishDate: new Date().toISOString(),
      }, {
        "user-id": String(user.id),
      });
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Article created",
        description: "Your article has been published successfully",
      });
      articleForm.reset();
      refetchNews();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create article",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle subscribe form submission
  const onSubscribeSubmit = (data: z.infer<typeof subscribeSchema>) => {
    subscribeMutation.mutate(data);
  };

  // Handle search form submission
  const onSearchSubmit = (data: z.infer<typeof searchSchema>) => {
    setSearchQuery(data.query);
  };

  // Handle article form submission
  const onArticleSubmit = (data: z.infer<typeof articleSchema>) => {
    createArticleMutation.mutate(data);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Filter articles based on search query
  const filteredArticles = searchQuery && newsArticles
    ? newsArticles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.summary && article.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (article.tags && article.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
    : newsArticles;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-foreground/60 flex items-center justify-center">
                <span className="text-background font-bold text-xs">{COIN_SYMBOL}</span>
              </div>
              <span className="font-bold text-lg hidden md:inline-block">{COIN_NAME}</span>
            </div>
            
            <div className="hidden md:flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>Home</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/trade")}>Trade</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/rewards")}>Rewards</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/news")}>News</Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate("/auth")}>
                Log In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-gradient-to-b from-primary/20 to-background py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold mb-4">News & Updates</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Stay informed with the latest {COIN_NAME} news, updates, and market insights
            </p>
            
            <Form {...searchForm}>
              <form 
                onSubmit={searchForm.handleSubmit(onSearchSubmit)} 
                className="max-w-md mx-auto flex gap-2"
              >
                <FormField
                  control={searchForm.control}
                  name="query"
                  render={({ field }) => (
                    <FormControl>
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search articles..." 
                          className="pl-9" 
                          {...field}
                        />
                      </div>
                    </FormControl>
                  )}
                />
                <Button type="submit">Search</Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <main className="container mx-auto p-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* News Articles */}
          <div className="lg:col-span-8">
            {/* Admin controls */}
            {user && (
              <div className="mb-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Article
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Create New Article</DialogTitle>
                      <DialogDescription>
                        Publish a new article to the news section
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...articleForm}>
                      <form onSubmit={articleForm.handleSubmit(onArticleSubmit)} className="space-y-4 py-4">
                        <FormField
                          control={articleForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Article title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={articleForm.control}
                          name="summary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Summary</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Brief summary of the article" 
                                  className="min-h-[60px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={articleForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Full article content" 
                                  className="min-h-[200px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={articleForm.control}
                            name="author"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Author</FormLabel>
                                <FormControl>
                                  <Input placeholder="Article author" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={articleForm.control}
                            name="imageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="URL to article image" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={articleForm.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags</FormLabel>
                              <FormControl>
                                <Input placeholder="Comma-separated tags" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter tags separated by commas (e.g. "trading, update, announcement")
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            disabled={createArticleMutation.isPending}
                          >
                            {createArticleMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Publishing...
                              </>
                            ) : "Publish Article"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Article List */}
            <div className="space-y-8">
              {isLoadingNews ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : isNewsError ? (
                <div className="text-center py-12">
                  <p className="text-destructive">Failed to load news articles</p>
                  <Button 
                    variant="outline" 
                    onClick={() => refetchNews()} 
                    className="mt-2"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              ) : filteredArticles && filteredArticles.length > 0 ? (
                <>
                  {/* Featured article (first one) */}
                  <div 
                    className="cursor-pointer group" 
                    onClick={() => setSelectedArticleId(filteredArticles[0].id)}
                  >
                    <div className="relative overflow-hidden rounded-xl aspect-video mb-4">
                      {filteredArticles[0].imageUrl ? (
                        <img 
                          src={filteredArticles[0].imageUrl} 
                          alt={filteredArticles[0].title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/30 flex items-center justify-center">
                          <span className="text-xl font-bold text-primary-foreground">{COIN_NAME}</span>
                        </div>
                      )}
                      
                      {filteredArticles[0].tags && filteredArticles[0].tags.length > 0 && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded-full">
                            {filteredArticles[0].tags[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {filteredArticles[0].title}
                    </h2>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      {filteredArticles[0].author && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{filteredArticles[0].author}</span>
                        </div>
                      )}
                      
                      {filteredArticles[0].publishDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(filteredArticles[0].publishDate)}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {filteredArticles[0].summary}
                    </p>
                    
                    <div className="inline-flex items-center text-primary group-hover:underline">
                      Read More
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                  
                  <div className="border-t pt-8 mt-8">
                    <h3 className="text-xl font-bold mb-6">Latest Articles</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {filteredArticles.slice(1).map(article => (
                        <motion.div 
                          key={article.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="cursor-pointer group"
                          onClick={() => setSelectedArticleId(article.id)}
                        >
                          <div className="relative overflow-hidden rounded-lg aspect-video mb-3">
                            {article.imageUrl ? (
                              <img 
                                src={article.imageUrl} 
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/30 flex items-center justify-center">
                                <span className="text-lg font-medium text-primary-foreground">{COIN_NAME}</span>
                              </div>
                            )}
                            
                            {article.tags && article.tags.length > 0 && (
                              <div className="absolute top-2 left-2">
                                <span className="bg-primary/80 text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                  {article.tags[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            {article.author && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{article.author}</span>
                              </div>
                            )}
                            
                            {article.publishDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(article.publishDate)}</span>
                              </div>
                            )}
                          </div>
                          
                          {article.summary && (
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                              {article.summary}
                            </p>
                          )}
                          
                          <div className="inline-flex items-center text-sm text-primary group-hover:underline">
                            Read More
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              ) : searchQuery ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                  <Button 
                    variant="outline" 
                    onClick={() => { 
                      setSearchQuery("");
                      searchForm.reset();
                    }} 
                    className="mt-2"
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No news articles available</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Newsletter subscription */}
            <Card>
              <CardHeader>
                <CardTitle>Stay Updated</CardTitle>
                <CardDescription>
                  Subscribe to our newsletter for the latest updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubscribed ? (
                  <div className="text-center p-4">
                    <p className="text-primary font-medium mb-2">Thank you for subscribing!</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive updates on {COIN_NAME} news and announcements.
                    </p>
                  </div>
                ) : (
                  <Form {...subscribeForm}>
                    <form onSubmit={subscribeForm.handleSubmit(onSubscribeSubmit)} className="space-y-4">
                      <FormField
                        control={subscribeForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Your email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={subscribeMutation.isPending}
                      >
                        {subscribeMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : "Subscribe"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>

            {/* Tags cloud */}
            {newsArticles && newsArticles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Popular Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {/* Extract and count unique tags */}
                    {Array.from(new Set(
                      newsArticles.flatMap(article => article.tags || [])
                    )).map((tag, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSearchQuery(tag);
                          searchForm.setValue("query", tag);
                        }}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/trade")}>
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Trading Platform
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/rewards")}>
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Rewards Program
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/")}>
                  <ChevronRight className="h-4 w-4 mr-1" />
                  About {COIN_NAME}
                </Button>
                {!user && (
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/auth")}>
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Sign Up / Login
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Article detail modal */}
      <Dialog open={!!selectedArticleId} onOpenChange={(open) => {
        if (!open) setSelectedArticleId(null);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {isLoadingArticle ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isArticleError ? (
            <div className="text-center py-8">
              <p className="text-destructive">Failed to load article</p>
            </div>
          ) : selectedArticle ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedArticle.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-4 mt-2">
                  {selectedArticle.author && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{selectedArticle.author}</span>
                    </div>
                  )}
                  
                  {selectedArticle.publishDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(selectedArticle.publishDate)}</span>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              {/* Article image */}
              {selectedArticle.imageUrl && (
                <div className="relative overflow-hidden rounded-lg aspect-video my-4">
                  <img 
                    src={selectedArticle.imageUrl} 
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Article content */}
              <div className="mt-4 space-y-4">
                {selectedArticle.summary && (
                  <p className="text-lg font-medium">{selectedArticle.summary}</p>
                )}
                
                <div className="prose prose-sm max-w-none">
                  {selectedArticle.content.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
              
              {/* Tags */}
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {selectedArticle.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-between mt-6 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => {
                  // Share functionality would go here
                  toast({
                    title: "Share feature",
                    description: "Sharing functionality coming soon",
                  });
                }}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    // Bookmark functionality would go here
                    toast({
                      title: "Bookmark feature",
                      description: "Bookmarking functionality coming soon",
                    });
                  }}>
                    <Bookmark className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={() => {
                    // Comment functionality would go here
                    toast({
                      title: "Comment feature",
                      description: "Commenting functionality coming soon",
                    });
                  }}>
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Comment
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Article not found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}