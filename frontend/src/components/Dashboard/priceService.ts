// src/services/priceService.ts
export interface PriceData {
  symbol: string;
  price: number;
  changePercent: number;
}

export const cryptoIds: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
};

export const fetchStockPrice = async (symbol: string): Promise<PriceData | null> => {
  try {
    // Using a free stock API - replace with your preferred service
    const response = await fetch(`https://api.example.com/stock/${symbol}`);
    const data = await response.json();
    return {
      symbol: symbol,
      price: data.price || 0,
      changePercent: data.changePercent || 0,
    };
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
};

export const fetchCryptoPrice = async (coinId: string): Promise<PriceData | null> => {
  try {
    // Using CoinGecko API (free)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
    );
    const data = await response.json();
    
    if (data[coinId]) {
      return {
        symbol: coinId.toUpperCase(),
        price: data[coinId].usd,
        changePercent: data[coinId].usd_24h_change || 0,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching crypto price for ${coinId}:`, error);
    return null;
  }
};
