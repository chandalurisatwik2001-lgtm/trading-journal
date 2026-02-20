import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';

interface CandleChartProps {
    symbol: string;
    interval: string;
}

const CandleChart: React.FC<CandleChartProps> = ({ symbol, interval }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Ensure container has dimensions
        const { clientWidth, clientHeight } = chartContainerRef.current;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { color: '#16161E' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: '#2B2B36' },
                horzLines: { color: '#2B2B36' },
            },
            crosshair: {
                mode: 0,
            },
            width: clientWidth,
            height: clientHeight,
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

        // Fetch Historical Data
        const fetchKlines = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`);
                const data = await res.json();

                const formattedData: CandlestickData[] = data.map((d: any) => ({
                    time: (d[0] / 1000) as Time,
                    open: parseFloat(d[1]),
                    high: parseFloat(d[2]),
                    low: parseFloat(d[3]),
                    close: parseFloat(d[4]),
                }));

                candlestickSeries.setData(formattedData);
            } catch (err) {
                console.error("Failed to fetch klines", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchKlines();

        // Optional: Websocket for live updates could go here
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const kline = message.k;
            if (kline.x) return; // ignore closed candles if desired, or just update

            candlestickSeries.update({
                time: (kline.t / 1000) as Time,
                open: parseFloat(kline.o),
                high: parseFloat(kline.h),
                low: parseFloat(kline.l),
                close: parseFloat(kline.c),
            });
        };

        return () => {
            window.removeEventListener('resize', handleResize);
            ws.close();
            chart.remove();
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
                <div className="flex gap-2">
                    {['1m', '5m', '15m', '1h', '4h', '1d'].map(t => (
                        <button
                            key={t}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${interval === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
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
