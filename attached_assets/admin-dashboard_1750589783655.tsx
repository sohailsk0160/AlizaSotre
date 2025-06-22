import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertProductSchema, insertCategorySchema, type InsertProduct, type InsertCategory, type ProductWithCategory, type Category } from "@shared/schema";
import { useLocation } from "wouter";
import { Edit, Trash2, Plus, LogOut, Package, Tag } from "lucide-react";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const adminUser: AdminUser | null = localStorage.getItem("adminUser")
    ? JSON.parse(localStorage.getItem("adminUser")!)
    : null;

  // API helper with authentication
  const authenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }
    
    return response.json();
  };

  // Fetch data
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => authenticatedRequest("/api/admin/products"),
    enabled: activeTab === "products",
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => authenticatedRequest("/api/admin/categories"),
  });

  // Product form
  const productForm = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      categoryId: 1,
      inStock: true,
    },
  });

  // Category form
  const categoryForm = useForm<InsertCategory>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
    },
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (data: InsertProduct) => authenticatedRequest("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setIsProductDialogOpen(false);
      productForm.reset();
      toast({ title: "Product created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create product", description: error.message, variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertProduct> }) =>
      authenticatedRequest(`/api/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      productForm.reset();
      toast({ title: "Product updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update product", description: error.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => authenticatedRequest(`/api/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete product", description: error.message, variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: InsertCategory) => authenticatedRequest("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
      toast({ title: "Category created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create category", description: error.message, variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertCategory> }) =>
      authenticatedRequest(`/api/admin/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      categoryForm.reset();
      toast({ title: "Category updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update category", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => authenticatedRequest(`/api/admin/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast({ title: "Category deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete category", description: error.message, variant: "destructive" });
    },
  });

  // Handlers
  const handleLogout = async () => {
    try {
      await authenticatedRequest("/api/admin/logout", { method: "POST" });
    } catch (error) {
      // Continue with logout even if API call fails
    }
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setLocation("/admin/login");
  };

  const handleEditProduct = (product: ProductWithCategory) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      imageUrl: product.imageUrl || "",
      categoryId: product.categoryId,
      inStock: product.inStock || true,
    });
    setIsProductDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
    });
    setIsCategoryDialogOpen(true);
  };

  const onProductSubmit = (data: InsertProduct) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const onCategorySubmit = (data: InsertCategory) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  if (!adminUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Aliza Store Admin</h1>
              <p className="text-sm text-gray-600">Welcome, {adminUser.username}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === "products" ? "default" : "outline"}
            onClick={() => setActiveTab("products")}
            className="flex items-center"
          >
            <Package className="w-4 h-4 mr-2" />
            Products
          </Button>
          <Button
            variant={activeTab === "categories" ? "default" : "outline"}
            onClick={() => setActiveTab("categories")}
            className="flex items-center"
          >
            <Tag className="w-4 h-4 mr-2" />
            Categories
          </Button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Manage your store products</CardDescription>
                </div>
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingProduct(null);
                      productForm.reset();
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                      <DialogDescription>
                        {editingProduct ? "Update product details" : "Create a new product"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input {...productForm.register("name")} placeholder="Enter product name" />
                        {productForm.formState.errors.name && (
                          <p className="text-sm text-red-600">{productForm.formState.errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea {...productForm.register("description")} placeholder="Enter product description" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input {...productForm.register("price")} placeholder="0.00" />
                        {productForm.formState.errors.price && (
                          <p className="text-sm text-red-600">{productForm.formState.errors.price.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input {...productForm.register("imageUrl")} placeholder="https://..." />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="categoryId">Category</Label>
                        <Select
                          value={productForm.watch("categoryId")?.toString()}
                          onValueChange={(value) => productForm.setValue("categoryId", parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category: Category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                          {editingProduct ? "Update" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div>Loading products...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>In Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: ProductWithCategory) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category?.name}</TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>{product.inStock ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteProductMutation.mutate(product.id)}
                              disabled={deleteProductMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Manage product categories</CardDescription>
                </div>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingCategory(null);
                      categoryForm.reset();
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                      <DialogDescription>
                        {editingCategory ? "Update category details" : "Create a new category"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Category Name</Label>
                        <Input {...categoryForm.register("name")} placeholder="Enter category name" />
                        {categoryForm.formState.errors.name && (
                          <p className="text-sm text-red-600">{categoryForm.formState.errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input {...categoryForm.register("slug")} placeholder="category-slug" />
                        {categoryForm.formState.errors.slug && (
                          <p className="text-sm text-red-600">{categoryForm.formState.errors.slug.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea {...categoryForm.register("description")} placeholder="Enter category description" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input {...categoryForm.register("imageUrl")} placeholder="https://..." />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                          {editingCategory ? "Update" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div>Loading categories...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category: Category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.slug}</TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCategoryMutation.mutate(category.id)}
                              disabled={deleteCategoryMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}