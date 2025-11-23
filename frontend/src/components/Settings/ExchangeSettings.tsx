import React, { useState, useEffect } from 'react';
import { exchangesAPI, ExchangeStatus } from '../../api/exchanges';

const ExchangeSettings: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [isTestnet, setIsTestnet] = useState(true); // Default to true for demo
    const [isLoading, setIsLoading] = useState(false);
    const [connections, setConnections] = useState<ExchangeStatus[]>([]);
    const [syncingId, setSyncingId] = useState<number | null>(null);

    useEffect(() => {
        loadConnections();
    }, []);

    const loadConnections = async () => {
        try {
            const data = await exchangesAPI.getStatus();
            setConnections(data);
        } catch (error) {
            console.error('Failed to load connections:', error);
        }
    };

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await exchangesAPI.connect({
                exchange_name: 'binance',
                api_key: apiKey,
                api_secret: apiSecret,
                is_testnet: isTestnet
            });
            setApiKey('');
            setApiSecret('');
            await loadConnections();
            alert('Connected successfully!');
        } catch (error: any) {
            console.error('Connection failed:', error);
            const errorMessage = error.response?.data?.detail || 'Failed to connect. Please check your API keys.';
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSync = async (id: number) => {
        setSyncingId(id);
        try {
            const res = await exchangesAPI.sync(id);
            alert(res.message);
        } catch (error) {
            console.error('Sync failed:', error);
            alert('Sync failed. Check console for details.');
        } finally {
            setSyncingId(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h2 className="text-3xl font-bold mb-8 text-white">Exchange Connections</h2>

            {/* Active Connections */}
            {connections.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-xl font-semibold mb-4 text-gray-300">Active Connections</h3>
                    <div className="grid gap-4">
                        {connections.map(conn => (
                            <div key={conn.id} className="bg-[#1E1E24] p-6 rounded-xl border border-gray-800 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-bold text-white capitalize">{conn.exchange_name}</h4>
                                        {conn.is_testnet && (
                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                                                Testnet
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Last synced: {conn.last_synced_at ? new Date(conn.last_synced_at).toLocaleString() : 'Never'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleSync(conn.id)}
                                    disabled={syncingId === conn.id}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${syncingId === conn.id
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'
                                        }`}
                                >
                                    {syncingId === conn.id ? 'Syncing...' : 'Sync Now'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Connect New Exchange */}
            <div className="bg-[#1E1E24] p-8 rounded-xl border border-gray-800 shadow-2xl">
                <h3 className="text-xl font-semibold mb-6 text-white">Connect New Exchange</h3>
                <form onSubmit={handleConnect} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">Exchange</label>
                        <select className="w-full p-3 bg-[#2A2A35] border border-gray-700 rounded-lg text-white outline-none cursor-not-allowed opacity-70">
                            <option value="binance">Binance</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <input
                            type="checkbox"
                            id="testnet"
                            checked={isTestnet}
                            onChange={(e) => setIsTestnet(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-700 bg-[#2A2A35] text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                        />
                        <label htmlFor="testnet" className="text-gray-300 cursor-pointer select-none">
                            Use Testnet (Demo Account)
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">API Key</label>
                        <input
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Paste your API Key"
                            className="w-full p-3 bg-[#2A2A35] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">API Secret</label>
                        <input
                            type="password"
                            value={apiSecret}
                            onChange={(e) => setApiSecret(e.target.value)}
                            placeholder="Paste your API Secret"
                            className="w-full p-3 bg-[#2A2A35] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all shadow-lg ${isLoading
                            ? 'bg-gray-700 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/20'
                            }`}
                    >
                        {isLoading ? 'Connecting...' : 'Connect Exchange'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ExchangeSettings;
