
export const getExchangeRate = async (from: string, to: string): Promise<number> => {
  if (from === to) return 1;
  
  try {
    // Using open.er-api.com (Free, No Key, Open Source)
    const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await response.json();
    
    if (data && data.rates && data.rates[to]) {
      return data.rates[to];
    }
    
    throw new Error(`Rate for ${to} not found`);
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
    throw error;
  }
};
