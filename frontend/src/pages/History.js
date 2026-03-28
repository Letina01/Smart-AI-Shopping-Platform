import React, { useEffect, useState } from 'react';
import { orderService } from '../services/api';
import api from '../services/api';
import { History as HistoryIcon, ShoppingCart, Search, Calendar, Package } from 'lucide-react';
import { motion } from 'framer-motion';

function History({ user }) {
    const [orders, setOrders] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const resOrder = await orderService.getHistory(user.email);
                setOrders(resOrder.data);
                
                const resSearch = await api.get(`/history/search?email=${user.email}`);
                setSearchHistory(resSearch.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user.email]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-6">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                    <HistoryIcon className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Your Activity</h1>
                    <p className="text-slate-500">Track your searches and shopping journey</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Order History
                        </h2>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                            {orders.length} Orders
                        </span>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100"></div>
                            ))}
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="space-y-4">
                            {orders.map((o, idx) => (
                                <motion.div 
                                key={o.id || o.orderId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-primary/20 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                                            <Package className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{(o.productNames || []).join(', ')}</h4>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(o.orderDate).toLocaleDateString()}
                                                </span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="font-medium text-slate-700">{o.paymentMethod || 'PAYMENT'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-slate-900">Rs {Number(o.totalPrice || 0).toFixed(2)}</div>
                                        <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                            {o.status}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-400">No orders placed yet.</p>
                        </div>
                    )}
                </div>

                {/* Search History */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Recent Searches
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
                        {loading ? (
                            <div className="p-8 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-4 bg-slate-50 rounded animate-pulse"></div>
                                ))}
                            </div>
                        ) : searchHistory.length > 0 ? (
                            searchHistory.map((s, idx) => (
                                <motion.div 
                                    key={s.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-default"
                                >
                                    <div className="flex items-center gap-3">
                                        <Search className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                        <span className="text-slate-700 font-medium">{s.searchQuery}</span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                        {new Date(s.timestamp).toLocaleDateString()}
                                    </span>
                                </motion.div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                No recent searches.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default History;
