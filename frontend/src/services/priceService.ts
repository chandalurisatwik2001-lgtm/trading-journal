// Free APIs we'll use:
// 1. Alpha Vantage - Stocks (free 25 requests/day)
// 2. CoinGecko - Crypto (free 50 requests/minute)
// 3. Finnhub - Stocks (free 60 requests/minute)

const ALPHA_VANTAGE_KEY = 'demo'; // Get free key at https://www.alphavantage.co/support/#api-key
const FINNHUB_KEY = 'demo'; // Get free key at https://finnhub.io/register

export interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

// Fetch stock price from Finnhub (Free - 60 calls/min)
export const fetchStockPrice = async (symbol: string): Promise<PriceData | null> => {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
    );
    const data = await response.json();

    if (data.c) {
      return {
        symbol,
        price: data.c, // current price
        change: data.d, // change
        changePercent: data.dp, // percent change
        timestamp: Date.now()
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
};

// Fetch crypto price from CoinGecko (Free - 50 calls/min)
export const fetchCryptoPrice = async (coinId: string): Promise<PriceData | null> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
    );
    const data = await response.json();

    if (data[coinId]) {
      const price = data[coinId].usd;
      const change24h = data[coinId].usd_24h_change || 0;
      
      return {
        symbol: coinId.toUpperCase(),
        price,
        change: (price * change24h) / 100,
        changePercent: change24h,
        timestamp: Date.now()
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${coinId}:`, error);
    return null;
  }
};

// Fetch multiple stock prices at once
export const fetchMultipleStocks = async (symbols: string[]): Promise<Map<string, PriceData>> => {
  const prices = new Map<string, PriceData>();
  
  const promises = symbols.map(symbol => fetchStockPrice(symbol));
  const results = await Promise.all(promises);
  
  results.forEach((result, index) => {
    if (result) {
      prices.set(symbols[index], result);
    }
  });
  
  return prices;
};

// Get popular crypto IDs for CoinGecko
export const cryptoIds: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  ADA: 'cardano',
  DOGE: 'dogecoin'
};
