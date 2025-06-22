import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { TrendingSlider } from "@/components/trending-slider";
import { HeroSlider } from "@/components/hero-slider";
import type { Category, ProductWithCategory } from "@shared/schema";

export function Home() {
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section with Image Slider */}
      <HeroSlider />

      {/* Trending Products Slider */}
      <TrendingSlider />

      {/* Categories Section */}
      <section id="categories" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-aliza-primary text-center mb-12 lg:mb-16">
            Shop by Category
          </h2>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="w-full h-64 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
              {categories?.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <a className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 overflow-hidden block">
                    <img
                      src={category.imageUrl || ""}
                      alt={category.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-aliza-primary group-hover:text-amber-600 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 mt-2">{category.description}</p>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      {categories?.map((category) => {
        const categoryProducts = products?.filter(p => p.categoryId === category.id).slice(0, 5) || [];
        
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.id} className={`py-16 ${category.id % 2 === 0 ? 'bg-aliza-light' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-bold text-aliza-primary">{category.name}</h2>
                <Link href={`/category/${category.slug}`}>
                  <Button variant="ghost" className="text-aliza-primary hover:text-amber-600 font-semibold flex items-center gap-2">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {productsLoading ? (
                <div className="products-grid">
                  {[...Array(5)].map((_, i) => (
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
              ) : (
                <div className="products-grid">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-aliza-primary to-aliza-secondary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-black mb-4">Stay Updated</h2>
          <p className="text-xl text-black mb-8">Subscribe to our newsletter for exclusive deals and new arrivals</p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl border-0 focus:outline-none focus:ring-4 focus:ring-amber-200"
              required
            />
            <Button
              type="submit"
              className="bg-black text-white px-8 py-4 hover:bg-gray-800 transition-colors duration-300 font-semibold"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-50 text-gray-600 py-12 border-t border-amber-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-aliza-primary mb-4">Aliza Store</h3>
              <p className="text-gray-600 leading-relaxed">
                Your trusted destination for premium fashion, beauty, and lifestyle products.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {categories?.map((category) => (
                  <li key={category.id}>
                    <Link href={`/category/${category.slug}`}>
                      <a className="hover:text-aliza-primary transition-colors duration-300">
                        {category.name}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-aliza-primary transition-colors duration-300">Contact Us</a></li>
                <li><a href="#" className="hover:text-aliza-primary transition-colors duration-300">Shipping Info</a></li>
                <li><a href="#" className="hover:text-aliza-primary transition-colors duration-300">Returns</a></li>
                <li><a href="#" className="hover:text-aliza-primary transition-colors duration-300">Size Guide</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-aliza-primary hover:text-amber-600 transition-colors duration-300">
                  Facebook
                </a>
                <a href="#" className="text-aliza-primary hover:text-amber-600 transition-colors duration-300">
                  Instagram
                </a>
                <a href="#" className="text-aliza-primary hover:text-amber-600 transition-colors duration-300">
                  Twitter
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-amber-200 pt-8 text-center">
            <p>&copy; 2024 Aliza Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
