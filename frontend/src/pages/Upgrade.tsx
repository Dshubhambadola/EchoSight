import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { Check, CreditCard } from 'lucide-react';
import { BillingService } from '../services/billing.service';

export const Upgrade = () => {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const session = await BillingService.createCheckoutSession(auth.user);
            if (session?.url) {
                window.location.href = session.url;
            } else {
                alert('Failed to start checkout. Please try again.');
            }
        } catch (error: any) {
            console.error(error);
            alert(`An error occurred: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-white mb-4">
                    Upgrade to EchoSight Pro
                </h1>
                <p className="text-xl text-slate-400">
                    Unlock the full potential of social signal intelligence.
                </p>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl flex flex-col items-center">
                <div className="bg-blue-600/20 p-4 rounded-full mb-6">
                    <CreditCard className="w-12 h-12 text-blue-500" />
                </div>

                <h2 className="text-2xl font-semibold text-white mb-2">Pro Plan</h2>
                <div className="text-4xl font-bold text-white mb-6">
                    $29<span className="text-lg text-slate-400 font-normal">/month</span>
                </div>

                <ul className="space-y-4 mb-8 text-left w-full max-w-sm">
                    {[
                        'Unlimited Real-time Monitoring',
                        'Historical Sentiment Trends',
                        'Platform Distribution Analytics',
                        'Priority Support',
                        'Exportable Reports',
                    ].map((feature) => (
                        <li key={feature} className="flex items-center text-slate-300">
                            <Check className="w-5 h-5 text-green-500 mr-3" />
                            {feature}
                        </li>
                    ))}
                </ul>

                <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full max-w-sm bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {loading ? 'Processing...' : 'Upgrade Now'}
                </button>
            </div>
        </div>
    );
};
