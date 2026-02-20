import React, { useState, useEffect, useCallback } from 'react';
import { portfolioAPI } from '../../api/portfolio';
import { simExchangeAPI, WalletBalance } from '../../api/simExchange';
import { analyticsAPI } from '../../api/analytics';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, RefreshCw, RotateCcw, Activity, DollarSign, BarChart2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];

interface PortfolioSummary {
    sim: {
        wallets: { asset: string; balance: number; locked: number }[];
        open_positions: any[];
        total_sim_pnl: number;
        total_sim_trades: number;
        sim_win_rate: number;
    };
    real_exchange: any;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string; color?: string }> = ({ icon, label, value, sub, color = 'text-white' }) => (
    <div className="bg-[#1e1e24] rounded-xl border border-gray-800 p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-gray-800/60 text-gray-400">{icon}</div>
        <div>
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
            {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
        </div>
    </div>
);

const PortfolioDashboard: React.FC = () => {
    const [summary, setSummary] = useState<PortfolioSummary | null>(null);
    const [wallets, setWallets] = useState<WalletBalance[]>([]);
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});
    const [pnlData, setPnlData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [sum, w, pnl] = await Promise.all([
                portfolioAPI.getSummary(),
                simExchangeAPI.getWallets(),
                analyticsAPI.getCumulativePnL()
            ]);
            setSummary(sum);
            setWallets(w);
            setPnlData(Array.isArray(pnl) ? pnl : []);

            // Fetch live prices for non-USDT assets
            const nonUsdt = w.filter(wallet => wallet.asset !== 'USDT' && wallet.balance > 0);
            if (nonUsdt.length > 0) {
                const prices: Record<string, number> = {};
                await Promise.all(nonUsdt.map(async wallet => {
                    try {
                        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${wallet.asset}USDT`);
                        const data = await res.json();
                        prices[wallet.asset] = parseFloat(data.price);
                    } catch { }
                }));
                setLivePrices(prices);
            }
        } catch (err) {
            console.error('Portfolio load error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleReset = async () => {
        if (!window.confirm('Reset sim wallet to $100,000 USDT?')) return;
        setResetting(true);
        try { await simExchangeAPI.resetWallet(); await load(); }
        finally { setResetting(false); }
    };

    // Compute portfolio values
    const holdingsData = wallets.map(w => {
        const usdValue = w.asset === 'USDT' ? w.balance : (livePrices[w.asset] ?? 0) * w.balance;
        return { asset: w.asset, balance: w.balance, usdValue };
    }).filter(h => h.usdValue > 0.01);

    const totalPortfolioValue = holdingsData.reduce((sum, h) => sum + h.usdValue, 0);
    const simPnl = summary?.sim?.total_sim_pnl ?? 0;
    const sim_trades = summary?.sim?.total_sim_trades ?? 0;
    const winRate = summary?.sim?.sim_win_rate ?? 0;
    const openPositions = summary?.sim?.open_positions?.length ?? 0;

    // Chart data
    const chartData = pnlData.map((d: any) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cumPnl: d.cumulative_pnl ?? d.pnl ?? 0
    }));

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
    );

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white">Portfolio</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Simulated wallet · Real market prices</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors">
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button onClick={handleReset} disabled={resetting}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20">
                        <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} /> Reset Wallet
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Wallet size={18} />} label="Total Portfolio Value"
                    value={`$${totalPortfolioValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                    sub="Sim wallet USD value" />
                <StatCard icon={simPnl >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    label="Sim Total P&L"
                    value={`${simPnl >= 0 ? '+' : ''}$${Math.abs(simPnl).toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
                    color={simPnl >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                <StatCard icon={<BarChart2 size={18} />} label="Sim Win Rate"
                    value={`${winRate.toFixed(1)}%`}
                    sub={`${sim_trades} total sim trades`}
                    color={winRate >= 50 ? 'text-emerald-400' : 'text-orange-400'} />
                <StatCard icon={<Activity size={18} />} label="Open Positions"
                    value={`${openPositions}`}
                    sub="Active futures positions"
                    color={openPositions > 0 ? 'text-blue-400' : 'text-gray-400'} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Equity Curve */}
                <div className="lg:col-span-2 bg-[#1e1e24] rounded-xl border border-gray-800 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white">Equity Curve</h3>
                        <span className="text-xs text-gray-500">All trades · Cumulative P&L</span>
                    </div>
                    {chartData.length > 0 ? (
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
                                    <XAxis dataKey="date" stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v.toLocaleString()}`} />
                                    <Tooltip contentStyle={{ background: '#16161e', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                                        formatter={(v: number) => [`$${v.toFixed(2)}`, 'Cumulative P&L']} />
                                    <Area type="monotone" dataKey="cumPnl" stroke="#3b82f6" strokeWidth={2} fill="url(#pnlGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-52 flex items-center justify-center text-gray-600 text-sm">
                            <div className="text-center">
                                <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
                                <p>No trade history yet</p>
                                <p className="text-xs mt-1">Start trading on the Exchange page</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Holdings Pie */}
                <div className="bg-[#1e1e24] rounded-xl border border-gray-800 p-5">
                    <h3 className="text-base font-bold text-white mb-4">Holdings</h3>
                    {holdingsData.length > 0 ? (
                        <>
                            <div className="h-36">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={holdingsData} dataKey="usdValue" nameKey="asset" cx="50%" cy="50%"
                                            innerRadius={40} outerRadius={68} paddingAngle={2}>
                                            {holdingsData.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#16161e', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                                            formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2 mt-3">
                                {holdingsData.map((h, i) => (
                                    <div key={h.asset} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                            <span className="text-gray-300 font-medium">{h.asset}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-gray-200">${h.usdValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
                                            <div className="text-gray-500">{((h.usdValue / totalPortfolioValue) * 100).toFixed(1)}%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-52 flex items-center justify-center text-gray-600 text-sm">No holdings yet</div>
                    )}
                </div>
            </div>

            {/* Wallet Balances */}
            <div className="bg-[#1e1e24] rounded-xl border border-gray-800 p-5">
                <h3 className="text-base font-bold text-white mb-4">Wallet Balances</h3>
                {wallets.length === 0 ? (
                    <div className="text-gray-600 text-sm text-center py-8">No wallets found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800 text-xs text-gray-500">
                                    <th className="text-left py-2 px-3">Asset</th>
                                    <th className="text-right py-2 px-3">Balance</th>
                                    <th className="text-right py-2 px-3">In Orders</th>
                                    <th className="text-right py-2 px-3">Price</th>
                                    <th className="text-right py-2 px-3">USD Value</th>
                                    <th className="text-right py-2 px-3">Allocation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wallets.filter(w => w.balance > 0 || w.locked_balance > 0).map(w => {
                                    const price = w.asset === 'USDT' ? 1 : (livePrices[w.asset] ?? 0);
                                    const usdValue = w.balance * price;
                                    const alloc = totalPortfolioValue > 0 ? (usdValue / totalPortfolioValue) * 100 : 0;
                                    return (
                                        <tr key={w.asset} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-300">
                                                        {w.asset[0]}
                                                    </div>
                                                    <span className="font-medium text-gray-200">{w.asset}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono text-gray-200">{w.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })}</td>
                                            <td className="py-3 px-3 text-right font-mono text-orange-400">{w.locked_balance > 0 ? w.locked_balance.toFixed(4) : '–'}</td>
                                            <td className="py-3 px-3 text-right font-mono text-gray-400">{price > 0 ? `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '–'}</td>
                                            <td className="py-3 px-3 text-right font-mono font-semibold text-white">${usdValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                                            <td className="py-3 px-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(alloc, 100)}%` }} />
                                                    </div>
                                                    <span className="font-mono text-xs text-gray-400 w-10 text-right">{alloc.toFixed(1)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Real Exchange */}
            {summary?.real_exchange && (
                <div className="bg-[#1e1e24] rounded-xl border border-gray-800 p-5">
                    <h3 className="text-base font-bold text-white mb-1">Real Exchange</h3>
                    {summary.real_exchange.error ? (
                        <div className="text-red-400 text-sm">{summary.real_exchange.exchange_name}: {summary.real_exchange.error}</div>
                    ) : (
                        <div className="text-emerald-400 text-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Connected to {summary.real_exchange.exchange_name} · {summary.real_exchange.account_type}
                            {summary.real_exchange.is_testnet && ' (Testnet)'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PortfolioDashboard;
