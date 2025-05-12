import { checkProxies } from '../../lib/proxyChecker';

export default async function handler(req, res) {
  // Xử lý yêu cầu POST
  if (req.method === 'POST') {
    try {
      const { proxies, protocol, timeout } = req.body;
      
      if (!proxies || !Array.isArray(proxies) || proxies.length === 0) {
        return res.status(400).json({
          message: "Vui lòng cung cấp danh sách proxy hợp lệ",
          status: "error"
        });
      }
      
      // Kiểm tra proxy
      const liveProxies = await checkProxies(
        proxies, 
        protocol || 'https', 
        Number(timeout) * 1000 || 5000
      );
      
      const response = {
        status: "success",
        message: `Kiểm tra proxy thành công (${liveProxies.length}/${proxies.length} sống)`
      };
      
      if (protocol === 'http') {
        response.http_proxies = liveProxies;
        response.https_proxies = [];
        response.total_http = liveProxies.length;
        response.total_https = 0;
      } else {
        response.http_proxies = [];
        response.https_proxies = liveProxies;
        response.total_http = 0;
        response.total_https = liveProxies.length;
      }
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error in check handler:', error);
      res.status(500).json({
        message: `Lỗi khi kiểm tra proxy: ${error.message}`,
        status: "error"
      });
    }
  } else {
    // Xử lý các phương thức không hỗ trợ
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}