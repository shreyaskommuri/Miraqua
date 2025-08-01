
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Search,
  ShoppingCart,
  Star,
  Package,
  Wifi,
  Droplets,
  Zap,
  Thermometer,
  Activity,
  Shield,
  Award,
  TrendingUp,
  Leaf
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MarketplaceScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setTimeout(() => {
      setProducts([
        {
          id: 1,
          name: 'Smart Moisture Sensor Pro',
          price: 89.99,
          originalPrice: 119.99,
          rating: 4.8,
          reviews: 324,
          category: 'sensors',
          description: 'AI-powered soil monitoring with 14-day battery',
          inStock: true,
          bestseller: true,
          savings: 25,
          features: ['Real-time monitoring', 'Weather integration', 'Mobile alerts']
        },
        {
          id: 2,
          name: 'Precision Drip Kit',
          price: 189.99,
          originalPrice: 229.99,
          rating: 4.9,
          reviews: 189,
          category: 'irrigation',
          description: 'Complete smart irrigation system',
          inStock: true,
          bestseller: true,
          savings: 17,
          features: ['Auto-scheduling', 'Water optimization', 'Zone control']
        },
        {
          id: 3,
          name: 'pH & Nutrient Analyzer',
          price: 149.99,
          rating: 4.6,
          reviews: 156,
          category: 'testing',
          description: 'Professional soil testing solution',
          inStock: true,
          bestseller: false,
          features: ['NPK analysis', 'pH monitoring', 'Growth recommendations']
        },
        {
          id: 4,
          name: 'Weather Station Elite',
          price: 299.99,
          originalPrice: 349.99,
          rating: 4.7,
          reviews: 267,
          category: 'monitoring',
          description: 'Hyper-local weather forecasting',
          inStock: true,
          bestseller: true,
          savings: 14,
          features: ['Micro-climate data', 'Predictive analytics', 'API integration']
        },
        {
          id: 5,
          name: 'Smart Valve Controller',
          price: 129.99,
          rating: 4.5,
          reviews: 198,
          category: 'irrigation',
          description: 'WiFi-enabled valve automation',
          inStock: true,
          features: ['Remote control', 'Schedule optimization', 'Flow monitoring']
        },
        {
          id: 6,
          name: 'Leaf Wetness Sensor',
          price: 79.99,
          rating: 4.4,
          reviews: 89,
          category: 'sensors',
          description: 'Disease prevention monitoring',
          inStock: false,
          features: ['Disease alerts', 'Humidity tracking', 'Plant health insights']
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    toast({
      title: "✅ Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const categories = [
    { id: 'all', name: 'All Products', icon: Package },
    { id: 'sensors', name: 'Smart Sensors', icon: Wifi },
    { id: 'irrigation', name: 'Irrigation', icon: Droplets },
    { id: 'testing', name: 'Soil Testing', icon: Activity },
    { id: 'monitoring', name: 'Weather', icon: Thermometer }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollArea className="h-[calc(100vh-0px)]">
        <div className="p-4 space-y-6">
          {/* Promotional Banner */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Professional Equipment Sale</h3>
                  <p className="text-sm opacity-90">Save up to 25% on smart irrigation systems</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search professional equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200 rounded-xl"
            />
          </div>

          {/* Categories */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 rounded-xl ${
                  selectedCategory === category.id 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>

          {/* Featured Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600">2-Year</p>
                <p className="font-semibold text-gray-900">Warranty</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xs text-gray-600">Up to 40%</p>
                <p className="font-semibold text-gray-900">Water Savings</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-xs text-gray-600">AI-Powered</p>
                <p className="font-semibold text-gray-900">Automation</p>
              </CardContent>
            </Card>
          </div>

          {/* Products */}
          <div className="space-y-4">
            {filteredProducts.map((product) => (
               <Card key={product.id} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                 <CardContent className="p-4">
                   <div className="space-y-4">
                     {/* Product Header */}
                     <div className="flex space-x-4">
                       <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                         <Leaf className="w-8 h-8 text-green-600" />
                       </div>
                       
                       <div className="flex-1 min-w-0">
                         <div className="flex items-start justify-between mb-2">
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center space-x-2 mb-1 flex-wrap">
                               <h3 className="font-semibold text-gray-900 text-base leading-tight">{product.name}</h3>
                               {product.bestseller && (
                                 <Badge className="bg-orange-100 text-orange-800 text-xs flex-shrink-0">
                                   Bestseller
                                 </Badge>
                               )}
                               {product.savings && (
                                 <Badge className="bg-red-100 text-red-800 text-xs flex-shrink-0">
                                   -{product.savings}%
                                 </Badge>
                               )}
                             </div>
                             <p className="text-sm text-gray-600 mb-2 leading-relaxed">{product.description}</p>
                             
                             <div className="flex items-center space-x-2 mb-2">
                               <div className="flex items-center">
                                 <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                 <span className="text-sm text-gray-600 ml-1">
                                   {product.rating} ({product.reviews})
                                 </span>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Features */}
                     <div className="flex flex-wrap gap-2">
                       {product.features?.slice(0, 3).map((feature: string, idx: number) => (
                         <Badge key={idx} variant="outline" className="text-xs">
                           {feature}
                         </Badge>
                       ))}
                     </div>
                     
                     {/* Price and Actions */}
                     <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                       <div className="flex items-center space-x-2">
                         <div className="text-lg font-bold text-green-600">
                           ${product.price}
                         </div>
                         {product.originalPrice && (
                           <div className="text-sm text-gray-400 line-through">
                             ${product.originalPrice}
                           </div>
                         )}
                       </div>
                       
                       <div className="flex items-center space-x-2">
                         <Badge 
                           className={product.inStock 
                             ? 'bg-green-100 text-green-800' 
                             : 'bg-red-100 text-red-800'
                           }
                         >
                           {product.inStock ? 'In Stock' : 'Out of Stock'}
                         </Badge>
                         <Button 
                           size="sm"
                           disabled={!product.inStock}
                           onClick={() => addToCart(product)}
                           className="bg-green-500 hover:bg-green-600 rounded-xl flex-shrink-0"
                         >
                           <ShoppingCart className="w-4 h-4 mr-1" />
                           Add
                         </Button>
                       </div>
                     </div>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </CardContent>
            </Card>
          )}

          {/* Professional Services Section */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Professional Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Installation Service</span>
                  </div>
                  <p className="text-blue-700 text-sm">Professional setup and configuration</p>
                  <Button size="sm" variant="outline" className="mt-3">
                    Schedule Installation
                  </Button>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Maintenance Plans</span>
                  </div>
                  <p className="text-green-700 text-sm">Ongoing support and optimization</p>
                  <Button size="sm" variant="outline" className="mt-3">
                    View Plans
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MarketplaceScreen;
