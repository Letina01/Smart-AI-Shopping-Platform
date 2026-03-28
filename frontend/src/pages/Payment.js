import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/api';
import { getApiErrorMessage } from '../services/apiError';
import { Copy, QrCode, Smartphone, Wallet } from 'lucide-react';

function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const [upiId, setUpiId] = useState('');
    const [processing, setProcessing] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [copyStatus, setCopyStatus] = useState('');
    const [launchMessage, setLaunchMessage] = useState('');
    const order = location.state?.order;
    const hasValidUpiId = /^[\w.-]{2,}@[\w]{2,}$/.test(upiId.trim());
    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
    const amount = Number(order?.totalPrice || 0).toFixed(2);
    const payeeUpiId = 'smartaishop@upi';
    const payeeName = 'Smart AI Shop';

    const qrValue = useMemo(() => {
        if (!order) return '';
        const params = new URLSearchParams({
            pa: payeeUpiId,
            pn: payeeName,
            am: amount,
            cu: 'INR',
            tn: `Order-${order.id}`,
        });
        return `upi://pay?${params.toString()}`;
    }, [amount, order]);

    const qrImageUrl = useMemo(() => {
        if (!qrValue) return '';
        return `https://quickchart.io/qr?text=${encodeURIComponent(qrValue)}&size=220`;
    }, [qrValue]);

    if (!order) {
        return (
            <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center">
                Payment session not found.
            </div>
        );
    }

    const handleSendPaymentRequest = async () => {
        if (!hasValidUpiId) {
            alert('Please enter a valid UPI ID');
            return;
        }
        setProcessing(true);
        try {
            await paymentService.request({
                orderId: order.id,
                paymentMethod: 'UPI',
                upiId
            });
            setRequestSent(true);
            setLaunchMessage('');
            alert('Payment request sent. Complete payment in your UPI app, then confirm here.');
        } catch (error) {
            alert(getApiErrorMessage(error, { fallbackMessage: 'Unable to send payment request' }));
        } finally {
            setProcessing(false);
        }
    };

    const handleCopyUpiLink = async () => {
        try {
            await navigator.clipboard.writeText(qrValue);
            setCopyStatus('UPI link copied');
        } catch (error) {
            setCopyStatus('Unable to copy link');
        }
    };

    const handleOpenUpiApp = async () => {
        if (!requestSent) {
            alert('Send payment request first');
            return;
        }

        if (!isMobileDevice) {
            setLaunchMessage('UPI apps usually open only from a phone with a registered UPI app. Scan the QR code or open this page on your mobile device.');
            return;
        }

        setLaunchMessage('');
        window.location.href = qrValue;
    };

    const handleConfirmPayment = async () => {
        if (!requestSent) {
            alert('Send payment request first');
            return;
        }
        setProcessing(true);
        try {
            await paymentService.confirm({
                orderId: order.id,
                paymentMethod: 'UPI',
                upiId
            });
            alert('Payment confirmed and order placed successfully');
            navigate('/history');
        } catch (error) {
            alert(getApiErrorMessage(error, { fallbackMessage: 'Payment confirmation failed' }));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Complete UPI Payment</h1>
                    <p className="text-slate-500 mt-2">Pay for order #{order.id} using your UPI app or manually enter your UPI ID.</p>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-8 flex justify-center">
                    <div className="bg-white p-4 rounded-2xl">
                        <img src={qrImageUrl} alt="UPI QR" className="w-[220px] h-[220px]" />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600 space-y-1">
                    <div>Payee UPI ID: <span className="font-semibold text-slate-900">{payeeUpiId}</span></div>
                    <div>Payee name: <span className="font-semibold text-slate-900">{payeeName}</span></div>
                    <div>Amount: <span className="font-semibold text-slate-900">Rs {amount}</span></div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">Enter UPI ID</label>
                    <div className="relative">
                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            className="input-field pl-10"
                            placeholder="example@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-slate-500">
                        Enter the payer UPI ID, send the payment request, complete payment in the app, then confirm payment here.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleSendPaymentRequest}
                    disabled={!hasValidUpiId || processing}
                    className="w-full btn-secondary py-3 rounded-2xl"
                >
                    {processing ? 'Sending Request...' : 'Send Payment Request'}
                </button>

                <button
                    type="button"
                    onClick={handleOpenUpiApp}
                    disabled={!requestSent || processing}
                    className="w-full btn-secondary py-3 rounded-2xl"
                >
                    <span className="inline-flex items-center justify-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Open UPI App
                    </span>
                </button>

                <button
                    type="button"
                    onClick={handleCopyUpiLink}
                    disabled={!qrValue}
                    className="w-full btn-secondary py-3 rounded-2xl"
                >
                    <span className="inline-flex items-center justify-center gap-2">
                        <Copy className="w-4 h-4" />
                        Copy UPI Link
                    </span>
                </button>

                {(launchMessage || copyStatus) && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {launchMessage || copyStatus}
                    </div>
                )}

                <button onClick={handleConfirmPayment} disabled={processing || !requestSent} className="w-full btn-primary py-3 rounded-2xl">
                    {processing ? 'Processing...' : 'Confirm Payment'}
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 h-fit space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                    <QrCode className="w-5 h-5" />
                    UPI Summary
                </div>
                <div className="text-slate-600">Amount</div>
                <div className="text-3xl font-black text-slate-900">Rs {Number(order.totalPrice || 0).toFixed(2)}</div>
                <div className="text-sm text-slate-500">Order status: {order.status}</div>
                <div className="text-sm text-slate-500">Payment method: UPI</div>
                <div className="text-sm text-slate-500">Payer UPI ID: {upiId || 'Not entered yet'}</div>
                <div className="text-sm text-slate-500">Payment request: {requestSent ? 'Sent' : 'Not sent'}</div>
                <div className="text-sm text-slate-500">App launch: {isMobileDevice ? 'Available on this device' : 'Use mobile or scan QR'}</div>
            </div>
        </div>
    );
}

export default Payment;
