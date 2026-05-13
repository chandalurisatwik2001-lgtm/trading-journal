import React from 'react';
import { ExternalLink, Globe, BookOpen, Youtube, Twitter, TrendingUp } from 'lucide-react';
import WidgetContainer from './WidgetContainer';

interface ExternalLinksWidgetProps {
    onRemove?: () => void;
}

const ExternalLinksWidget: React.FC<ExternalLinksWidgetProps> = ({ onRemove }) => {
    const links = [
        { id: 1, title: 'TradingView', url: 'https://www.tradingview.com', icon: <TrendingUp size={20} />, color: 'bg-blue-500' },
        { id: 2, title: 'Forex Factory', url: 'https://www.forexfactory.com', icon: <Globe size={20} />, color: 'bg-orange-500' },
        { id: 3, title: 'Babypips', url: 'https://www.babypips.com', icon: <BookOpen size={20} />, color: 'bg-green-500' },
        { id: 4, title: 'Market News', url: '#', icon: <Twitter size={20} />, color: 'bg-sky-500' },
        { id: 5, title: 'Daily Recap', url: '#', icon: <Youtube size={20} />, color: 'bg-red-500' },
        { id: 6, title: 'Broker Login', url: '#', icon: <ExternalLink size={20} />, color: 'bg-purple-500' },
    ];

    return (
        <WidgetContainer
            title="Quick Links"
            icon={<ExternalLink size={16} />}
            onRemove={onRemove}
            className="min-h-[300px]"
        >
            <div className="grid grid-cols-2 gap-3 py-2">
                {links.map((link) => (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center justify-center p-4 rounded-xl bg-gray-800/30 border border-white/5 hover:bg-gray-800/60 hover:border-white/10 hover:-translate-y-1 transition-all duration-200"
                    >
                        <div className={`p-3 rounded-xl text-white mb-3 shadow-lg ${link.color} group-hover:scale-110 transition-transform duration-200`}>
                            {link.icon}
                        </div>
                        <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors text-center">
                            {link.title}
                        </span>
                    </a>
                ))}
            </div>
        </WidgetContainer>
    );
};

export default ExternalLinksWidget;
