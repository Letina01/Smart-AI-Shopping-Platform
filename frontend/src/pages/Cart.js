import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cartService, orderService, userService } from '../services/api';
import { getApiErrorMessage } from '../services/apiError';
import { CreditCard, ShoppingCart, Wallet } from 'lucide-react';

function Cart({ user }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [cart, setCart] = useState({ items: [], totalPrice: 0 });
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [country, setCountry] = useState('India');
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [loading, setLoading] = useState(true);
    const directItem = location.state?.buyNowItem || null;

    useEffect(() => {
        const fetchCheckoutData = async () => {
            try {
                const [profileResponse, cartResponse] = await Promise.all([
                    userService.getProfile(user.email),
                    directItem ? Promise.resolve(null) : cartService.get(user.email)
                ]);

                const addresses = profileResponse.data?.addresses || [];
                setSavedAddresses(addresses);

                if (addresses.length > 0) {
                    const defaultAddress = addresses[0];
                    setSelectedAddressId(String(defaultAddress.id));
                    applyAddress(defaultAddress);
                }

                if (cartResponse) {
                    setCart(cartResponse.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchCheckoutData();
    }, [directItem, user.email]);

    const formatPrice = (price) => `Rs ${Number(price || 0).toFixed(2)}`;

    const applyAddress = (selectedAddress) => {
        setAddress(selectedAddress?.street || '');
        setCity(selectedAddress?.city || '');
        setState(selectedAddress?.state || '');
        setZipCode(selectedAddress?.zipCode || '');
        setCountry(selectedAddress?.country || 'India');
    };

    const handleSavedAddressChange = (event) => {
        const nextId = event.target.value;
        setSelectedAddressId(nextId);
        const selectedAddress = savedAddresses.find((item) => String(item.id) === nextId);
        if (selectedAddress) {
            applyAddress(selectedAddress);
        } else {
            applyAddress({ street: '', city: '', state: '', zipCode: '', country: 'India' });
        }
    };

    const handleCheckout = async () => {
        if (!address.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !country.trim()) {
            alert('Please fill in delivery address details');
            return;
        }

        const payload = {
            userId: user.email,
            paymentMethod,
            shippingAddress: address,
            shippingCity: city,
            shippingState: state,
            shippingZipCode: zipCode,
            shippingCountry: country
        };

        try {
            let orderResponse;
            if (directItem) {
                orderResponse = await orderService.buyNow({
                    ...payload,
                    products: [{
                        productId: directItem.id,
                        name: directItem.name,
                        price: directItem.price,
                        quantity: 1,
                        imageUrl: directItem.imageUrl,
                        platform: directItem.platform,
                        storeUrl: directItem.storeUrl
                    }]
                });
            } else {
                orderResponse = await orderService.checkoutCart(user.email, payload);
            }
            if (paymentMethod === 'UPI') {
                navigate('/payment', { state: { order: orderResponse.data } });
                return;
            }
            alert('Order placed successfully');
            navigate('/history');
        } catch (error) {
            alert(getApiErrorMessage(error, { fallbackMessage: 'Checkout failed. Please try again.' }));
        }
    };

    const items = directItem ? [{ ...directItem, quantity: 1 }] : (cart.items || []);
    const totalPrice = directItem ? directItem.price : cart.totalPrice;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-6">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                    <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{directItem ? 'Buy Now' : 'Your Cart'}</h1>
                    <p className="text-slate-500">Review items and choose your payment method</p>
                </div>
            </div>

            {loading ? (
                <div className="h-40 bg-white rounded-3xl animate-pulse border border-slate-100"></div>
            ) : items.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
                    Your cart is empty.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={`${item.id || item.productId}-${index}`} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex gap-4">
                                {item.imageUrl && (
                                    <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden">
                                        <img src={item.imageUrl} alt={item.name} className="max-h-full object-contain" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                                    <p className="text-sm text-slate-500">{item.platform}</p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-lg font-bold text-slate-900">{formatPrice(item.price)}</span>
                                        <span className="text-sm text-slate-500">Qty: {item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-fit space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Checkout</h2>
                            <p className="text-sm text-slate-500 mt-1">Select how you want to pay.</p>
                        </div>

                        <div className="space-y-3">
                            {savedAddresses.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Use Saved Address</label>
                                    <select
                                        className="input-field"
                                        value={selectedAddressId}
                                        onChange={handleSavedAddressChange}
                                    >
                                        {savedAddresses.map((savedAddress) => (
                                            <option key={savedAddress.id} value={savedAddress.id}>
                                                {[savedAddress.street, savedAddress.city, savedAddress.state].filter(Boolean).join(', ')}
                                            </option>
                                        ))}
                                        <option value="">Enter a new address manually</option>
                                    </select>
                                </div>
                            )}
                            <input className="input-field" placeholder="Street Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                            <input className="input-field" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                            <input className="input-field" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
                            <input className="input-field" placeholder="Zip Code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                            <input className="input-field" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 border border-slate-200 rounded-2xl p-4 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="UPI"
                                    checked={paymentMethod === 'UPI'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <Wallet className="w-5 h-5 text-primary" />
                                <span className="font-medium text-slate-800">UPI</span>
                            </label>
                            <label className="flex items-center gap-3 border border-slate-200 rounded-2xl p-4 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <CreditCard className="w-5 h-5 text-primary" />
                                <span className="font-medium text-slate-800">Cash on Delivery</span>
                            </label>
                        </div>

                        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                            <span className="text-slate-500">Total</span>
                            <span className="text-2xl font-black text-slate-900">{formatPrice(totalPrice)}</span>
                        </div>

                        <button onClick={handleCheckout} className="w-full btn-primary py-3 rounded-2xl">
                            Place Order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;
