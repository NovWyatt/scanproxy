import { scrapeProxies } from '../../lib/proxyScraper';

export default async function handler(req, res) {
  // Xử lý yêu cầu POST
  if (req.method === 'POST') {
    try {
      const sourceIds = req.body.source_ids;
      
      // Thu thập proxy từ các nguồn
      const result = await scrapeProxies(sourceIds);
      
      res.status(200).json({
        ...result,
        message: "Thu thập proxy thành công",
        status: "success"
      });
    } catch (error) {
      console.error('Error in scrape handler:', error);
      res.status(500).json({
        message: `Lỗi khi thu thập proxy: ${error.message}`,
        status: "error"
      });
    }
  } else {
    // Xử lý các phương thức không hỗ trợ
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}