import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface WeekHeatmapProps {
  data: { date: string; pnl: number }[];
}

const WeekHeatmap: React.FC<WeekHeatmapProps> = ({ data }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekStart = startOfWeek(new Date());

  return (
    <div>
      <div className="text-xs text-gray-500 mb-2">{format(new Date(), 'MMM')}</div>
      <div className="space-y-2">
        {days.map((day, index) => {
          const date = addDays(weekStart, index);
          const dayData = data.find((d) => isSameDay(new Date(d.date), date));
          const intensity = dayData ? Math.min(Math.abs(dayData.pnl) / 500, 1) : 0;
          const color =
            dayData && dayData.pnl > 0
              ? `rgba(34, 197, 94, ${0.2 + intensity * 0.8})`
              : dayData && dayData.pnl < 0
              ? `rgba(239, 68, 68, ${0.2 + intensity * 0.8})`
              : '#F3F4F6';

          return (
            <div key={day} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-8">{day}</span>
              <div className="flex-1 h-8 rounded" style={{ backgroundColor: color }}></div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="text-gray-500">Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-4 h-4 rounded"
              style={{ backgroundColor: `rgba(34, 197, 94, ${0.2 + i * 0.2})` }}
            ></div>
          ))}
        </div>
        <span className="text-gray-500">More</span>
      </div>
    </div>
  );
};

export default WeekHeatmap;
