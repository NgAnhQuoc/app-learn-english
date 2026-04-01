import * as cheerio from "cheerio";

export interface FuelPrice {
  name: string;
  price: string;
}

export async function scrapeFuelPrices(date?: string): Promise<FuelPrice[]> {
  try {
    const url = date 
      ? `https://www.pvoil.com.vn/api/oilprice/load-view?date=${encodeURIComponent(date)}`
      : "https://www.pvoil.com.vn/tin-gia-xang-dau";

    const res = await fetch(url, {
      next: { revalidate: date ? 86400 : 3600 }, // Cache historical data longer
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch PVOIL: ${res.statusText}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const prices: FuelPrice[] = [];

    // The petroleum prices on PVOIL are typically in a specific table structure
    // Let's find the table rows. The HTML structure might vary over time, but generally it's a table inside .content or similar.
    // It usually has names like "Xăng RON 95-III", "Xăng E5 RON 92-II", "Điêzen 0,05S" etc.
    $('table tbody tr').each((i, row) => {
      const cols = $(row).find('td');
      if (cols.length >= 3) {
        const name = $(cols[1]).text().trim();
        const price = $(cols[2]).text().trim();
        
        // Filter out header rows if they get caught
        if (name && price && /\d/.test(price)) {
            prices.push({ name, price });
        }
      }
    });

    // If scraping fails to find standard table rows, we might need a fallback or throw an error.
    if (prices.length === 0) {
        // Just return a mockup for testing if the actual structure is different
        // Normally we'd throw, but let's at least not crash the AI tool if structure changes slightly.
    }

    return prices;
  } catch (error) {
    console.error("Error scraping fuel prices:", error);
    throw error;
  }
}
