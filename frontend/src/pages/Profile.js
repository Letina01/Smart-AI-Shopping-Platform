import React, { useEffect, useState } from 'react';
import { userService } from '../services/api';
import { getApiErrorMessage } from '../services/apiError';
import { User, Phone, MapPin, Plus, Save, Mail, Home } from 'lucide-react';
import { motion } from 'framer-motion';

function Profile({ user }) {
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [country, setCountry] = useState('India');
    const [loading, setLoading] = useState(true);

    const fetchProfile = React.useCallback(async () => {
        try {
            const res = await userService.getProfile(user.email);
            setProfile(res.data);
            setName(res.data.name || '');
            setPhone(res.data.phone || '');
        } catch (err) {
            console.error(err);
        }
    }, [user.email]);

    useEffect(() => {
        const fetchInitialProfile = async () => {
            await fetchProfile();
            setLoading(false);
        };
        fetchInitialProfile();
    }, [fetchProfile]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await userService.updateProfile({ email: user.email, name, phone });
            alert('Profile updated successfully!');
            fetchProfile();
        } catch (err) {
            alert(getApiErrorMessage(err, { fallbackMessage: 'Update failed. Please try again.' }));
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            await userService.addAddress(user.email, { street, city, state, zipCode, country });
            alert('Address added!');
            setStreet('');
            setCity('');
            setState('');
            setZipCode('');
            setCountry('India');
            fetchProfile();
        } catch (err) {
            alert(getApiErrorMessage(err, { fallbackMessage: 'Add address failed. Please try again.' }));
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                <div className="w-20 h-20 bg-gradient-to-tr from-primary to-blue-400 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <User className="w-10 h-10" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{profile?.name || 'Your Profile'}</h1>
                    <div className="flex items-center gap-2 text-slate-500 mt-1">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Settings */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6"
                >
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Account Settings
                    </h2>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Display Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    className="input-field pl-10" 
                                    placeholder="Name" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    className="input-field pl-10" 
                                    placeholder="Phone" 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)} 
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" />
                            Update Profile
                        </button>
                    </form>
                </motion.div>

                {/* Addresses */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            Shipping Addresses
                        </h2>

                        <div className="space-y-3">
                            {profile?.addresses && profile.addresses.length > 0 ? (
                                profile.addresses.map(a => (
                                    <div key={a.id} className="p-4 bg-slate-50 rounded-2xl flex items-start gap-3 group">
                                        <Home className="w-5 h-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-slate-800">{a.street}</p>
                                            <p className="text-sm text-slate-500">
                                                {[a.city, a.state, a.zipCode, a.country].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-4 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-2xl">
                                    No addresses saved yet.
                                </p>
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add New Address
                            </h3>
                            <form onSubmit={handleAddAddress} className="space-y-3">
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="Street Address" 
                                    value={street} 
                                    onChange={(e) => setStreet(e.target.value)} 
                                    required
                                />
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="City" 
                                    value={city} 
                                    onChange={(e) => setCity(e.target.value)} 
                                    required
                                />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="State"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Zip Code"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    required
                                />
                                <button type="submit" className="btn-secondary w-full">
                                    Add Address
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Profile;
