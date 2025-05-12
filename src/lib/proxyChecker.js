import axios from 'axios';

// Hàm kiểm tra một proxy
export const checkProxy = async (proxy, protocol = 'https', timeout = 5000) => {
  try {
    const testUrl = protocol === 'https' 
      ? 'https://www.google.com' 
      : 'http://httpbin.org/ip';
    
    await axios.get(testUrl, {
      proxy: {
        host: proxy.split(':')[0],
        port: proxy.split(':')[1],
        protocol: protocol
      },
      timeout: timeout
    });
    
    return true;
  } catch (error) {
    return false;
  }
};

// Hàm kiểm tra danh sách proxy
export const checkProxies = async (proxies, protocol = 'https', timeout = 5000) => {
  // Lấy tối đa 100 proxy để tránh timeout
  const limitedProxies = proxies.slice(0, 100);
  
  // Giới hạn số lượng kiểm tra đồng thời
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < limitedProxies.length; i += batchSize) {
    const batch = limitedProxies.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(proxy => checkProxy(proxy, protocol, timeout))
    );
    
    for (let j = 0; j < batch.length; j++) {
      if (batchResults[j]) {
        results.push(batch[j]);
      }
    }
  }
  
  return results;
};