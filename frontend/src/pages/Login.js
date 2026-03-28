import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { getApiErrorMessage, getAuthErrorMessage } from '../services/apiError';
import { ShoppingBag, Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userEmail = params.get('email');

        if (token && userEmail) {
            localStorage.setItem('token', token);
            onLogin({ email: userEmail });
            navigate('/', { replace: true });
        }
    }, [location, onLogin, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegistering) {
                await authService.register(name, email, password);
                alert('Registered successfully, please login');
                setIsRegistering(false);
            } else {
                const response = await authService.login(email, password);
                localStorage.setItem('token', response.data);
                onLogin({ email });
            }
        } catch (err) {
            alert(
                isRegistering
                    ? getApiErrorMessage(err, { fallbackMessage: 'Registration failed. Please try again.' })
                    : getAuthErrorMessage(err)
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-4 shadow-lg shadow-primary/20">
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Smart AI Shop</h1>
                    <p className="text-slate-500 mt-2">Experience the future of intelligent shopping</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h2 className="text-xl font-semibold text-slate-800 mb-6">
                        {isRegistering ? 'Create your account' : 'Welcome back'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegistering && (
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="John Doe" 
                                        className="input-field pl-10"
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="email" 
                                    placeholder="name@example.com" 
                                    className="input-field pl-10"
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="input-field pl-10"
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full btn-primary py-3 flex items-center justify-center space-x-2">
                            <span>{isRegistering ? 'Register' : 'Sign In'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500 uppercase tracking-wider font-semibold">Or continue with</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                            className="w-full btn-secondary py-3 flex items-center justify-center space-x-3 group"
                        >
                            <Chrome className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                            <span>Sign in with Google</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                        >
                            {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;
