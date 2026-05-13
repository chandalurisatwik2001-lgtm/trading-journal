import React from 'react';
import { FileText, Download, Eye, Clock, AlertCircle } from 'lucide-react';
import WidgetContainer from './WidgetContainer';

interface ReportWidgetProps {
    onRemove?: () => void;
}

const ReportWidget: React.FC<ReportWidgetProps> = ({ onRemove }) => {
    // Mock data
    const reports = [
        { id: 1, title: 'Weekly Performance Review', date: '2023-10-27', status: 'Ready', type: 'PDF' },
        { id: 2, title: 'Monthly P&L Statement', date: '2023-10-01', status: 'Ready', type: 'CSV' },
        { id: 3, title: 'Trade Journal Export', date: '2023-10-28', status: 'Processing', type: 'PDF' },
    ];

    return (
        <WidgetContainer
            title="Reports & Exports"
            icon={<FileText size={16} />}
            onRemove={onRemove}
            className="min-h-[300px]"
        >
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto custom-scrollbar -mx-4 px-4">
                    <div className="space-y-3">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className="group flex items-center justify-between p-3 rounded-xl bg-gray-800/30 border border-white/5 hover:bg-gray-800/60 hover:border-white/10 transition-all duration-200"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${report.type === 'PDF' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                                        }`}>
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                                            {report.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={10} />
                                                {report.date}
                                            </span>
                                            {report.status === 'Processing' && (
                                                <span className="text-xs text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <AlertCircle size={10} />
                                                    Processing
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {report.status === 'Ready' && (
                                        <>
                                            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="View">
                                                <Eye size={16} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Download">
                                                <Download size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                    <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 flex items-center justify-center gap-2">
                        <FileText size={16} />
                        Generate New Report
                    </button>
                </div>
            </div>
        </WidgetContainer>
    );
};

export default ReportWidget;
