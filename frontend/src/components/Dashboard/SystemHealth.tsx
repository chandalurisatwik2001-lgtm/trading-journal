import React from 'react';
import { Cpu, HardDrive, MemoryStick, ArrowDown, ArrowUp } from 'lucide-react';

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network_in: number;
  network_out: number;
}

interface SystemHealthProps {
  system: SystemHealth;
}

const ProgressBar: React.FC<{ value: number; color: string; label: string }> = ({ value, color, label }) => {
  const getStatusColor = (val: number) => {
    if (val > 80) return '#FF3B30';
    if (val > 60) return '#E2F13C';
    return color;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.15em] text-[#666] uppercase">{label}</span>
        <span className="font-mono text-xs font-bold" style={{ color: getStatusColor(value) }}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: getStatusColor(value) }}
        />
      </div>
    </div>
  );
};

const SystemHealthPanel: React.FC<SystemHealthProps> = ({ system }) => {
  return (
    <div
      data-testid="system-health-panel"
      className="bg-[#111111] border border-white/10 rounded-sm p-5 space-y-5"
    >
      <h3 className="text-[10px] tracking-[0.2em] text-[#666] uppercase">System Health</h3>
      
      <div className="space-y-4">
        <ProgressBar value={system.cpu} color="#0033FF" label="CPU" />
        <ProgressBar value={system.memory} color="#8B5CF6" label="Memory" />
        <ProgressBar value={system.disk} color="#E2F13C" label="Disk" />
      </div>

      <div className="border-t border-white/5 pt-4">
        <h4 className="text-[10px] tracking-[0.15em] text-[#666] uppercase mb-3">Network I/O</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <ArrowDown size={12} className="text-[#00FF66]" />
            <div>
              <div className="font-mono text-sm font-bold text-white" data-testid="network-in-value">
                {system.network_in} MB/s
              </div>
              <div className="text-[9px] text-[#666] tracking-wider">INBOUND</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUp size={12} className="text-[#0033FF]" />
            <div>
              <div className="font-mono text-sm font-bold text-white" data-testid="network-out-value">
                {system.network_out} MB/s
              </div>
              <div className="text-[9px] text-[#666] tracking-wider">OUTBOUND</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthPanel;
