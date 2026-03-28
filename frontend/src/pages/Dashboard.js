import React, { useState } from 'react';
import { productService, aiService, cartService } from '../services/api';
import { getApiErrorMessage } from '../services/apiError';
import { Search, Sparkles, Star, ShoppingCart, ExternalLink, Zap, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Dashboard({ user }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setSearching(true);
        setLoading(true);
        try {
            const res = await productService.search(query, user.email);
            setProducts(res.data);
            setRecommendation(null);
        } catch (err) {
            alert(getApiErrorMessage(err, { fallbackMessage: 'Search failed. Please try again.' }));
        }
        setLoading(false);
    };

    const getAiRecommendation = async (criteria) => {
        try {
            const res = await aiService.recommend(products, criteria);
            setRecommendation(res.data);
        } catch (err) {
            alert(getApiErrorMessage(err, { fallbackMessage: 'AI recommendation failed. Please try again.' }));
        }
    };

    const formatPrice = (price) => `Rs ${Number(price || 0).toFixed(2)}`;

    const handleAddToCart = async (product) => {
        try {
            await cartService.add({
                userId: user.email,
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                imageUrl: product.imageUrl,
                platform: product.platform,
                storeUrl: product.storeUrl
            });
            alert('Added to cart');
        } catch (err) {
            alert(getApiErrorMessage(err, { fallbackMessage: 'Add to cart failed. Please try again.' }));
        }
    };

    const handleBuyNow = (product) => {
        navigate('/cart', { state: { buyNowItem: product } });
    };

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <section className="text-center py-12 px-4 bg-white rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50"></div>
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        Find the <span className="text-primary">Best Deals</span> with AI
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
                        Compare prices across multiple platforms instantly. Let our AI guide you to the smartest purchase.
                    </p>

                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" 
                                value={query} 
                                onChange={(e) => setQuery(e.target.value)} 
                                placeholder="Search for products (e.g. iPhone 15, Laptop)..." 
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-lg shadow-inner"
                            />
                        </div>
                        <button type="submit" className="btn-primary px-8 rounded-2xl flex items-center gap-2">
                            <span>Search</span>
                        </button>
                    </form>
                </motion.div>
            </section>

            {/* Recommendations Section */}
            <AnimatePresence>
                {products.length > 0 && (
                    <motion.section 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-amber-500" />
                                AI Smart Insights
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                                onClick={() => getAiRecommendation('lowest price')}
                                className="p-4 glass-card rounded-2xl border border-blue-100 hover:border-blue-300 transition-all text-left flex items-start gap-4 group"
                            >
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Best Price Finder</h3>
                                    <p className="text-sm text-slate-500">Analyze all platforms for the absolute lowest price.</p>
                                </div>
                            </button>
                            <button 
                                onClick={() => getAiRecommendation('highest rating')}
                                className="p-4 glass-card rounded-2xl border border-amber-100 hover:border-amber-300 transition-all text-left flex items-start gap-4 group"
                            >
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Quality Analyst</h3>
                                    <p className="text-sm text-slate-500">Find products with the most authentic positive feedback.</p>
                                </div>
                            </button>
                        </div>

                        {recommendation && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-4"
                            >
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Sparkles className="w-6 h-6 text-amber-300" />
                                        </div>
                                        <p className="text-lg font-medium leading-relaxed">{recommendation.recommendation}</p>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Best Value', product: recommendation.bestProduct },
                                        { label: 'Cheapest', product: recommendation.cheapestProduct },
                                        { label: 'Top Rated', product: recommendation.topRatedProduct }
                                    ].map((item) => item.product && (
                                        <div key={item.label} className="bg-white rounded-2xl p-4 border border-slate-100">
                                            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{item.label}</div>
                                            <div className="font-semibold text-slate-900">{item.product.name}</div>
                                            <div className="text-sm text-slate-500">{formatPrice(item.product.price)} • {item.product.rating.toFixed(1)} / 5</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Results Grid */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {searching ? 'Search Results' : 'Recommended for You'}
                    </h2>
                    {products.length > 0 && <span className="text-sm text-slate-500">{products.length} products found</span>}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl"></div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((p, idx) => (
                            <motion.div 
                                key={p.id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                            >
                                {p.imageUrl && (
                                    <div className="mb-4 rounded-2xl bg-slate-50 p-4 h-44 flex items-center justify-center overflow-hidden">
                                        <img src={p.imageUrl} alt={p.name} className="max-h-full object-contain" />
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">
                                        {p.platform}
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-bold">{p.rating}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{p.name}</h3>
                                {p.category && <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{p.category}</p>}
                                {p.description && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{p.description}</p>}
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-3xl font-black text-slate-900">{formatPrice(p.price)}</span>
                                    <span className="text-slate-400 text-sm">{p.currency || 'INR'}</span>
                                </div>
                                <div className="text-xs text-slate-400 mb-6">
                                    Source price: ${Number(p.originalPriceUsd || 0).toFixed(2)} USD
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAddToCart(p)}
                                        className="flex-1 btn-secondary py-3 rounded-xl flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        <span>Add to Cart</span>
                                    </button>
                                    <button 
                                        onClick={() => handleBuyNow(p)}
                                        className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2 group/btn"
                                    >
                                        <span>Buy Now</span>
                                        <ExternalLink className="w-4 h-4 opacity-50" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : searching ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No products found</h3>
                        <p className="text-slate-500">Try searching for something else like "iPhone" or "Laptop".</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-40 grayscale pointer-events-none">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-64"></div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Dashboard;
