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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">New Trade Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Symbol</label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Asset Type</label>
            <select
              name="asset_type"
              value={formData.asset_type}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="stock">Stock</option>
              <option value="forex">Forex</option>
              <option value="crypto">Crypto</option>
              <option value="options">Options</option>
              <option value="futures">Futures</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Direction</label>
            <select
              name="direction"
              value={formData.direction}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Entry Date</label>
            <input
              type="datetime-local"
              name="entry_date"
              value={formData.entry_date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Entry Price</label>
            <input
              type="number"
              step="0.01"
              name="entry_price"
              value={formData.entry_price}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              step="0.01"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stop Loss</label>
            <input
              type="number"
              step="0.01"
              name="stop_loss"
              value={formData.stop_loss || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Take Profit</label>
            <input
              type="number"
              step="0.01"
              name="take_profit"
              value={formData.take_profit || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Strategy</label>
          <input
            type="text"
            name="strategy"
            value={formData.strategy}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Create Trade
        </button>
      </form>
    </div>
  );
};

export default TradeEntryForm;
