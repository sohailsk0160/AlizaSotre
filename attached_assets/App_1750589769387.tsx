import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { ShoppingCart } from "@/components/shopping-cart";
import { CartContext } from "@/lib/cart";
import { Home } from "@/pages/home";
import { CategoryPage } from "@/pages/category";
import { ProductPage } from "@/pages/product";
import { AdminLogin } from "@/pages/admin-login";
import { AdminDashboard } from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import type { CartItemWithProduct } from "@shared/schema";
import type { CartContextType } from "@/lib/types";

function CartProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  const { data: cartItems = [], isLoading, refetch } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      const response = await apiRequest("POST", "/api/cart", { productId, quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const response = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/cart/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Product has been removed from your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/cart");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);

  const contextValue: CartContextType = {
    cartItems,
    cartCount,
    cartTotal,
    addToCart: async (productId: number, quantity = 1) => {
      await addToCartMutation.mutateAsync({ productId, quantity });
    },
    updateCartItem: async (id: number, quantity: number) => {
      await updateCartMutation.mutateAsync({ id, quantity });
    },
    removeFromCart: async (id: number) => {
      await removeFromCartMutation.mutateAsync(id);
    },
    clearCart: async () => {
      await clearCartMutation.mutateAsync();
    },
    isLoading: isLoading || addToCartMutation.isPending || updateCartMutation.isPending || removeFromCartMutation.isPending || clearCartMutation.isPending,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

function AppRouter() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
      const results = await response.json();
      setSearchResults(results);
      // TODO: Navigate to search results page or show results in modal
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <Header onSearch={handleSearch} />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/category/:slug" component={CategoryPage} />
          <Route path="/product/:id" component={ProductPage} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <div className="min-h-screen bg-aliza-light">
            <AppRouter />
            <Toaster />
          </div>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
