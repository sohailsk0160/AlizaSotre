import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product-card";
import type { Category, ProductWithCategory } from "@shared/schema";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${slug}`],
  });

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: [`/api/products?category=${slug}`],
  });

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aliza-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Category Not Found</h1>
          <p className="text-gray-600">The category you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aliza-light">
      {/* Category Header */}
      <section className="relative">
        <div className="h-64 md:h-80 lg:h-96 overflow-hidden">
          <img
            src={category.imageUrl || ""}
            alt={category.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {category.name}
              </h1>
              <p className="text-xl md:text-2xl max-w-2xl mx-auto px-4">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {productsLoading ? (
            <div className="products-grid">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                  <div className="w-full h-80 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded mb-3"></div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {products.length} {products.length === 1 ? "Product" : "Products"} Found
                </h2>
              </div>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No Products Found</h2>
              <p className="text-gray-600">
                We don't have any products in this category yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
