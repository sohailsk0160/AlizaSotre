import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/lib/cart";
import type { ProductWithCategory } from "@shared/schema";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isLoading: cartLoading } = useCart();

  const { data: product, isLoading, error } = useQuery<ProductWithCategory>({
    queryKey: [`/api/products/${id}`],
  });

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, quantity);
  };

  const updateQuantity = (increment: boolean) => {
    setQuantity(prev => {
      const newQty = increment ? prev + 1 : prev - 1;
      return Math.max(1, newQty);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aliza-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aliza-light py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <img
                src={product.imageUrl || ""}
                alt={product.name}
                className="w-full h-96 lg:h-[600px] object-cover"
              />
            </Card>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <p className="text-aliza-primary font-semibold text-lg mb-2">
                {product.category?.name}
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-aliza-primary mb-6">
                ${product.price}
              </p>
            </div>

            {product.description && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateQuantity(false)}
                    disabled={quantity <= 1}
                    className="px-3"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 text-lg font-semibold min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateQuantity(true)}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <Button
                onClick={handleAddToCart}
                disabled={cartLoading || !product.inStock}
                size="lg"
                className="w-full bg-aliza-primary text-white hover:bg-amber-600 transition-colors duration-300 text-lg py-6"
              >
                {!product.inStock ? "Out of Stock" : "Add to Cart"}
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" size="lg" className="py-6">
                  Add to Wishlist
                </Button>
                <Button variant="outline" size="lg" className="py-6">
                  Share Product
                </Button>
              </div>
            </div>

            {/* Product Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{product.category?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product ID:</span>
                    <span className="font-medium">#{product.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
