import React, { useState, useEffect, useRef } from 'react';
import CandleChart from './CandleChart';
import OrderBook from './OrderBook';
import FuturesOrderEntry from './FuturesOrderEntry';
import SpotOrderEntry from './SpotOrderEntry';
import PositionsPanel from './PositionsPanel';
import { simExchangeAPI, WalletBalance } from '../../api/simExchange';
import { exchangesAPI, ExchangeStatus } from '../../api/exchanges';
import { Wifi, WifiOff, RotateCcw, Zap } from 'lucide-react';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'AVAXUSDT'];
type TradeMode = 'SIM' | 'REAL';
type TradeType = 'SPOT' | 'FUTURES';

const ExchangeLayout: React.FC = () => {
    const [symbol, setSymbol] = useState('BTCUSDT');
    const [tradeMode, setTradeMode] = useState<TradeMode>('SIM');
    const [tradeType, setTradeType] = useState<TradeType>('FUTURES');
    const [currentPrice, setCurrentPrice] = useState(0);
    const [priceChange, setPriceChange] = useState(0);
    const [wallets, setWallets] = useState<WalletBalance[]>([]);
    const [realConnections, setRealConnections] = useState<ExchangeStatus[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [resetting, setResetting] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    // Live price ticker via WebSocket
    useEffect(() => {
        if (wsRef.current) wsRef.current.close();
        const ws = new WebSocket("wss://stream.binance.com:9443/ws/" + symbol.toLowerCase() + "@ticker");
        ws.onmessage = (event) => {
            const d = JSON.parse(event.data);
            setCurrentPrice(parseFloat(d.c));
            setPriceChange(parseFloat(d.P));
        };
        wsRef.current = ws;
        return () => ws.close();
    }, [symbol]);

    useEffect(() => {
        simExchangeAPI.getWallets().then(setWallets).catch(() => { });
        exchangesAPI.getStatus().then(setRealConnections).catch(() => { });
    }, [refreshTrigger]);

    const handleOrderSuccess = () => setRefreshTrigger(t => t + 1);

    const handleResetWallet = async () => {
        if (!window.confirm('Reset sim wallet to $100,000 USDT and close all positions?')) return;
        setResetting(true);
        try { await simExchangeAPI.resetWallet(); setRefreshTrigger(t => t + 1); }
        finally { setResetting(false); }
    };

    const usdtBalance = wallets.find(w => w.asset === 'USDT')?.balance ?? 0;
    const activeRealConn = realConnections.find(c => c.is_active);
    const isPriceUp = priceChange >= 0;

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] min-h-[700px] w-full gap-3">
            {/* Header */}
            <div className="bg-[#1e1e24] rounded-xl border border-gray-800 px-4 py-3 flex flex-wrap items-center gap-4 shadow-xl">
                {/* Price */}
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-black text-white text-xl">{symbol}</span>
                            <span className={"text-xs font-bold px-1.5 py-0.5 rounded " + (isPriceUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400')}>
                                {isPriceUp ? '+' : ''}{priceChange.toFixed(2)}%
                            </span>
                        </div>
                        <div className={"text-lg font-mono font-bold " + (isPriceUp ? 'text-emerald-400' : 'text-red-400')}>
                            ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Symbols */}
                <div className="flex gap-1.5 flex-wrap">
                    {SYMBOLS.map(s => (
                        <button key={s} onClick={() => setSymbol(s)}
                            className={"px-3 py-1.5 rounded-lg font-bold text-xs transition-all " + (symbol === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-[#16161e] text-gray-400 hover:text-white border border-gray-800')}>
                            {s.replace('USDT', '')}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 ml-auto flex-wrap">
                    {/* Spot/Futures */}
                    <div className="flex bg-[#16161e] rounded-lg p-0.5 border border-gray-800">
                        {(['SPOT', 'FUTURES'] as TradeType[]).map(t => (
                            <button key={t} onClick={() => setTradeType(t)}
                                className={"px-3 py-1.5 rounded-md text-xs font-bold transition-all " + (tradeType === t ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300')}>
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* SIM/REAL */}
                    <div className="flex bg-[#16161e] rounded-lg p-0.5 border border-gray-800">
                        <button onClick={() => setTradeMode('SIM')}
                            className={"px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 " + (tradeMode === 'SIM' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300')}>
                            <Zap size={11} /> SIM
                        </button>
                        <button onClick={() => setTradeMode('REAL')}
                            className={"px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 " + (tradeMode === 'REAL' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-300')}>
                            {activeRealConn ? <Wifi size={11} /> : <WifiOff size={11} />} REAL
                        </button>
                    </div>

                    {/* SIM balance */}
                    {tradeMode === 'SIM' && (
                        <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
                            <div>
                                <div className="text-xs text-gray-500">Sim USDT</div>
                                <div className="font-mono text-sm font-bold text-white">${usdtBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                            </div>
                            <button onClick={handleResetWallet} disabled={resetting} title="Reset to $100k"
                                className="text-gray-500 hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                                <RotateCcw size={13} className={resetting ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    )}

                    {/* REAL connection status */}
                    {tradeMode === 'REAL' && (
                        <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
                            {activeRealConn ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <div className="text-xs">
                                        <div className="text-gray-300 font-medium">{activeRealConn.exchange_name}</div>
                                        <div className="text-emerald-400">{activeRealConn.account_type} · {activeRealConn.is_testnet ? 'Testnet' : 'Live'}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-orange-400 flex items-center gap-1.5">
                                    <WifiOff size={12} /><span>No exchange connected</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
                {/* Chart + Positions (8 cols) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-3 min-h-0">
                    <div className="flex-1 min-h-[380px]">
                        <CandleChart symbol={symbol} />
                    </div>
                    <div className="h-56">
                        <PositionsPanel refreshTrigger={refreshTrigger} />
                    </div>
                </div>

                {/* OrderBook + Order Entry (4 cols) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-3 min-h-0">
                    <div className="flex-1 min-h-[260px]">
                        <OrderBook symbol={symbol} />
                    </div>
                    <div className="min-h-[320px]">
                        {tradeMode === 'SIM' ? (
                            tradeType === 'FUTURES'
                                ? <FuturesOrderEntry symbol={symbol} currentPrice={currentPrice} onOrderSuccess={handleOrderSuccess} />
                                : <SpotOrderEntry symbol={symbol} currentPrice={currentPrice} onOrderSuccess={handleOrderSuccess} />
                        ) : (
                            <div className="bg-[#1e1e24] rounded-xl border border-gray-800 h-full flex flex-col items-center justify-center p-6 text-center gap-4">
                                {activeRealConn ? (
                                    <>
                                        <Wifi size={32} className="text-emerald-400" />
                                        <div className="text-white font-bold">Connected: {activeRealConn.exchange_name}</div>
                                        <div className="text-xs text-orange-400 bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                                            ⚠️ Real order routing is coming soon. Use SIM mode to practice.
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff size={32} className="text-gray-600" />
                                        <div>
                                            <div className="text-gray-300 font-bold mb-1">No Exchange Connected</div>
                                            <div className="text-gray-500 text-sm mb-4">Connect your Binance API keys to trade real markets.</div>
                                            <a href="/dashboard/settings/exchanges"
                                                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                                                Connect Exchange →
                                            </a>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExchangeLayout;
