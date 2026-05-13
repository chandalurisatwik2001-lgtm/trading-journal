import React, { useState } from 'react';
import { tradesAPI, Trade } from '../../api/trades';
import { useNavigate } from 'react-router-dom';

const TradeEntryForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Trade>({
    symbol: '',
    asset_type: 'stock',
    direction: 'LONG',
    entry_date: new Date().toISOString().slice(0, 16),
    entry_price: 0,
    quantity: 0,
    stop_loss: undefined,
    take_profit: undefined,
    commission: 0,
    fees: 0,
    strategy: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tradesAPI.create(formData);
      alert('Trade created successfully!');
      navigate('/trades');
    } catch (error) {
      console.error('Error creating trade:', error);
      alert('Failed to create trade');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['entry_price', 'quantity', 'stop_loss', 'take_profit', 'commission', 'fees'].includes(name)
        ? parseFloat(value) || 0
        : value
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-[#1E1E24] rounded-xl shadow-2xl border border-gray-800">
      <h2 className="text-2xl font-bold mb-8 text-white border-b border-gray-800 pb-4">New Trade Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Symbol</label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              placeholder="e.g. AAPL, BTCUSD"
              className="w-full p-3 bg-[#2A2A35] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Asset Type</label>
            <select
              name="asset_type"
              value={formData.asset_type}
              onChange={handleChange}
              className="w-full p-3 bg-[#2A2A35] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="stock">Stock</option>
              <option value="forex">Forex</option>
              <option value="crypto">Crypto</option>
              <option value="options">Options</option>
              <option value="futures">Futures</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Direction</label>
            <div className="flex gap-4">
              <label className={`flex-1 cursor-pointer p-3 rounded-lg border text-center transition-all ${formData.direction === 'LONG' ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-[#2A2A35] border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                <input
                  type="radio"
                  name="direction"
                  value="LONG"
                  checked={formData.direction === 'LONG'}
                  onChange={handleChange}
                  className="hidden"
                />
                Long
              </label>
              <label className={`flex-1 cursor-pointer p-3 rounded-lg border text-center transition-all ${formData.direction === 'SHORT' ? 'bg-red-900/30 border-red-500 text-red-400' : 'bg-[#2A2A35] border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                <input
                  type="radio"
                  name="direction"
                  value="SHORT"
                  checked={formData.direction === 'SHORT'}
                  onChange={handleChange}
                  className="hidden"
                />
                Short
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Entry Date</label>
            <input
              type="datetime-local"
              name="entry_date"
              value={formData.entry_date}
              onChange={handleChange}
              className="w-full p-3 bg-[#2A2A35] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all [color-scheme:dark]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Entry Price</label>
            <input
              type="number"
              step="0.01"
              name="entry_price"
              value={formData.entry_price || ''}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full p-3 bg-[#2A2A35] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Quantity</label>
            <input
              type="number"
              step="0.01"
              name="quantity"
              value={formData.quantity || ''}
              onChange={handleChange}
              placeholder="0"
              className="w-full p-3 bg-[#2A2A35] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Stop Loss</label>
            <input
              type="number"
              step="0.01"
              name="stop_loss"
              value={formData.stop_loss || ''}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full p-3 bg-[#2A2A35] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Take Profit</label>
            <input
              type="number"
              step="0.01"
              name="take_profit"
              value={formData.take_profit || ''}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full p-3 bg-[#2A2A35] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Strategy</label>
          <input
            type="text"
            name="strategy"
            value={formData.strategy}
            onChange={handleChange}
            placeholder="e.g. Breakout, Reversal"
            className="w-full p-3 bg-[#2A2A35] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Add your trade analysis, thoughts, and emotions..."
            className="w-full p-3 bg-[#2A2A35] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-500 active:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
          >
            Create Trade
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeEntryForm;
