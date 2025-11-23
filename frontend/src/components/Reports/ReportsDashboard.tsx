import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../api/analytics';
import PnLGrowthChart from './Charts/PnLGrowthChart';
import TradeDistributionChart from './Charts/TradeDistributionChart';
import AssetPerformanceChart from './Charts/AssetPerformanceChart';

const ReportsDashboard: React.FC = () => {
    const [pnlData, setPnlData] = useState<any[]>([]);
    const [distData, setDistData] = useState<any>(null);
    const [assetData, setAssetData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pnl, dist, asset] = await Promise.all([
                    analyticsAPI.getCumulativePnL(),
                    analyticsAPI.getTradeDistribution(),
                    analyticsAPI.getAssetPerformance()
                ]);
                setPnlData(pnl);
                setDistData(dist);
                setAssetData(asset);
            } catch (error) {
                console.error('Failed to fetch reports data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-400">Loading reports...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-white mb-8">Advanced Reports</h1>

            {/* P&L Growth */}
            <div className="bg-[#1E1E24] p-6 rounded-xl border border-gray-800 shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-6">Cumulative P&L Growth</h3>
                {pnlData.length > 0 ? (
                    <PnLGrowthChart data={pnlData} />
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                        No trade data available yet
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trade Distribution */}
                <div className="bg-[#1E1E24] p-6 rounded-xl border border-gray-800 shadow-lg">
                    <h3 className="text-xl font-semibold text-white mb-6">Long vs Short Performance</h3>
                    {distData ? (
                        <TradeDistributionChart data={distData} />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            No distribution data available
                        </div>
                    )}
                </div>

                {/* Asset Performance */}
                <div className="bg-[#1E1E24] p-6 rounded-xl border border-gray-800 shadow-lg">
                    <h3 className="text-xl font-semibold text-white mb-6">Asset Class Performance</h3>
                    {assetData && assetData.assets.length > 0 ? (
                        <AssetPerformanceChart data={assetData} />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            No asset data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsDashboard;
