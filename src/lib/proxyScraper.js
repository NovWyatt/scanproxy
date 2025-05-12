import axios from 'axios';
import { parse } from 'node-html-parser';

// Hàm tạo User-Agent ngẫu nhiên
const getRandomUserAgent = () => {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36"
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

// Hàm kiểm tra proxy có đúng định dạng không
const isValidProxy = (proxy) => {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(proxy);
};

// Hàm thu thập proxy từ nguồn Free-Proxy-List
const scrapeFromFreeProxyList = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': getRandomUserAgent() },
      timeout: 15000
    });
    
    const root = parse(response.data);
    const table = root.querySelector('table');
    if (!table) return { http: [], https: [] };
    
    const rows = table.querySelectorAll('tr');
    const proxies = { http: [], https: [] };
    
    for (let i = 1; i < rows.length; i++) { // Skip header row
      const cols = rows[i].querySelectorAll('td');
      if (cols.length >= 7) {
        const ip = cols[0].text.trim();
        const port = cols[1].text.trim();
        const https = cols[6].text.trim().toLowerCase() === 'yes';
        const proxy = `${ip}:${port}`;
        
        if (isValidProxy(proxy)) {
          if (https) {
            proxies.https.push(proxy);
          } else {
            proxies.http.push(proxy);
          }
        }
      }
    }
    
    return proxies;
  } catch (error) {
    console.error(`Error scraping from ${url}:`, error.message);
    return { http: [], https: [] };
  }
};

// Hàm thu thập proxy từ nguồn raw text (GitHub)
const scrapeFromRawText = async (url, type = 'http') => {
  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': getRandomUserAgent() },
      timeout: 15000
    });
    
    const lines = response.data.split('\n');
    const proxies = { http: [], https: [] };
    
    for (const line of lines) {
      const proxy = line.trim();
      if (isValidProxy(proxy)) {
        if (type === 'https') {
          proxies.https.push(proxy);
        } else {
          proxies.http.push(proxy);
        }
      }
    }
    
    return proxies;
  } catch (error) {
    console.error(`Error scraping from ${url}:`, error.message);
    return { http: [], https: [] };
  }
};

// Hàm thu thập proxy từ các nguồn
export const scrapeProxies = async (sourceIds) => {
  // Danh sách các nguồn proxy
  const sources = [
    {"name": "Free-Proxy-List.net (HTTPS)", "url": "https://free-proxy-list.net/", "id": 1, "scraper": scrapeFromFreeProxyList},
    {"name": "SSLProxies.org (HTTPS)", "url": "https://www.sslproxies.org/", "id": 2, "scraper": scrapeFromFreeProxyList},
    {"name": "US Proxy List", "url": "https://www.us-proxy.org/", "id": 3, "scraper": scrapeFromFreeProxyList},
    {"name": "UK Proxy List", "url": "https://free-proxy-list.net/uk-proxy.html", "id": 4, "scraper": scrapeFromFreeProxyList},
    {"name": "TheSpeedX Github (HTTP)", "url": "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt", "id": 7, "scraper": scrapeFromRawText, "type": "http"},
    {"name": "ShiftyTR Github (HTTPS)", "url": "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/https.txt", "id": 8, "scraper": scrapeFromRawText, "type": "https"},
    {"name": "Monosans Github", "url": "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt", "id": 9, "scraper": scrapeFromRawText, "type": "http"},
    {"name": "HyperBeats Github", "url": "https://raw.githubusercontent.com/hyperbeats/proxy-list/main/https.txt", "id": 10, "scraper": scrapeFromRawText, "type": "https"}
  ];
  
  // Lọc các nguồn theo ID
  const sourcesToScrape = sourceIds && sourceIds.length > 0 
    ? sources.filter(source => sourceIds.includes(source.id))
    : sources;
  
  // Giới hạn số lượng nguồn để tránh quá tải
  const limitedSources = sourcesToScrape.slice(0, 5);
  
  // Thu thập proxy từ các nguồn
  const results = await Promise.all(
    limitedSources.map(async (source) => {
      try {
        if (source.scraper) {
          if (source.type) {
            return await source.scraper(source.url, source.type);
          }
          return await source.scraper(source.url);
        }
        return { http: [], https: [] };
      } catch (error) {
        console.error(`Error in scrapeProxies for ${source.name}:`, error);
        return { http: [], https: [] };
      }
    })
  );
  
  // Gộp kết quả
  const httpProxies = [...new Set(results.flatMap(result => result.http))];
  const httpsProxies = [...new Set(results.flatMap(result => result.https))];
  
  return {
    http_proxies: httpProxies,
    https_proxies: httpsProxies,
    total_http: httpProxies.length,
    total_https: httpsProxies.length
  };
};