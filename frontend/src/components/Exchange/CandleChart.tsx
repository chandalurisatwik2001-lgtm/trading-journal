import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';

interface CandleChartProps {
    symbol: string;
    interval?: string; // optional external override; internal state takes precedence
}

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'];

const CandleChart: React.FC<CandleChartProps> = ({ symbol, interval: externalInterval = '1m' }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    // Interval is managed internally so buttons work without needing a parent callback
    const [interval, setInterval] = useState(externalInterval);
    const [isLoading, setIsLoading] = useState(true);

    // Create chart once on mount
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { color: '#16161E' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: '#2B2B36' },
                horzLines: { color: '#2B2B36' },
            },
            crosshair: { mode: 0 },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight,
                });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // Reload data whenever symbol or interval changes
    useEffect(() => {
        if (!seriesRef.current) return;

        // Close previous WebSocket
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        const fetchKlines = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`
                );
                const data = await res.json();

                if (!Array.isArray(data)) return;

                const formattedData: CandlestickData[] = data.map((d: any) => ({
                    time: (d[0] / 1000) as Time,
                    open: parseFloat(d[1]),
                    high: parseFloat(d[2]),
                    low: parseFloat(d[3]),
                    close: parseFloat(d[4]),
                }));

                seriesRef.current?.setData(formattedData);
                chartRef.current?.timeScale().fitContent();
            } catch (err) {
                console.error('Failed to fetch klines', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchKlines();

        // Live WebSocket updates for the current candle
        const ws = new WebSocket(
            `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`
        );
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const kline = message.k;
            seriesRef.current?.update({
                time: (kline.t / 1000) as Time,
                open: parseFloat(kline.o),
                high: parseFloat(kline.h),
                low: parseFloat(kline.l),
                close: parseFloat(kline.c),
            });
        };
        wsRef.current = ws;

        return () => {
            ws.close();
        };
    }, [symbol, interval]);

    return (
        <div className="relative w-full h-full bg-[#16161E] rounded-xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col">
            {/* Chart Header */}
            <div className="p-3 bg-[#1e1e24] border-b border-gray-800 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-lg">{symbol}</span>
                    <span className="text-gray-400 text-sm">Perpetual</span>
                </div>
                {/* Interval buttons — onClick updates internal state, re-fetches data */}
                <div className="flex gap-2">
                    {INTERVALS.map(t => (
                        <button
                            key={t}
                            onClick={() => setInterval(t)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${interval === t
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Container */}
            <div ref={chartContainerRef} className="flex-1 w-full relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#16161e]/50 z-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandleChart;
