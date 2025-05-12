import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [sources, setSources] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  const [httpProxies, setHttpProxies] = useState([]);
  const [httpsProxies, setHttpsProxies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('scrape');
  const [checkProxies, setCheckProxies] = useState('');
  const [protocol, setProtocol] = useState('https');
  const [timeout, setTimeout] = useState(5);
  const [numThreads, setNumThreads] = useState(25);
  const [showHelp, setShowHelp] = useState(false);
  const [isApiWorking, setIsApiWorking] = useState(false);

  // Kiểm tra API khi trang được tải
  useEffect(() => {
    checkApiStatus();
    fetchSources();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setIsApiWorking(data.status === 'success');
      console.log('API status:', data);
    } catch (error) {
      console.error('API test error:', error);
      setIsApiWorking(false);
      setMessage('Không thể kết nối đến API. Vui lòng thử lại sau.');
    }
  };

  const fetchSources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sources');
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Sources data:', data);
      setSources(data);
      setMessage('Tải danh sách nguồn thành công');
    } catch (error) {
      console.error('Error fetching sources:', error);
      setMessage(`Lỗi: Không thể tải danh sách nguồn - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSource = (sourceId) => {
    if (selectedSources.includes(sourceId)) {
      setSelectedSources(selectedSources.filter(id => id !== sourceId));
    } else {
      setSelectedSources([...selectedSources, sourceId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSources.length === sources.length) {
      setSelectedSources([]);
    } else {
      setSelectedSources(sources.map(source => source.id));
    }
  };

  const handleScrapeProxies = async () => {
    setLoading(true);
    setMessage('Đang thu thập proxy...');
    setHttpProxies([]);
    setHttpsProxies([]);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_ids: selectedSources.length ? selectedSources : null
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Scrape response:', data);
      
      if (data.status === 'success') {
        setHttpProxies(data.http_proxies || []);
        setHttpsProxies(data.https_proxies || []);
        setMessage(`Thu thập thành công: ${data.total_http || 0} HTTP, ${data.total_https || 0} HTTPS proxy.`);
      } else {
        setMessage(`Lỗi: ${data.message || 'Không có phản hồi từ máy chủ'}`);
      }
    } catch (error) {
      console.error('Error scraping proxies:', error);
      setMessage(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckProxies = async () => {
    if (!checkProxies.trim()) {
      setMessage('Vui lòng nhập danh sách proxy để kiểm tra.');
      return;
    }

    setLoading(true);
    setMessage('Đang kiểm tra proxy...');
    setHttpProxies([]);
    setHttpsProxies([]);
    
    try {
      const proxiesToCheck = checkProxies.split('\n')
        .map(p => p.trim())
        .filter(p => p && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(p));
      
      if (proxiesToCheck.length === 0) {
        setMessage('Không tìm thấy proxy hợp lệ để kiểm tra. Định dạng phải là IP:PORT.');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proxies: proxiesToCheck,
          protocol: protocol,
          timeout: parseInt(timeout),
          num_threads: parseInt(numThreads)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Check response:', data);
      
      if (data.status === 'success') {
        if (protocol === 'http') {
          setHttpProxies(data.http_proxies || []);
          setHttpsProxies([]);
          setMessage(`Tìm thấy ${data.total_http || 0} HTTP proxy sống.`);
        } else {
          setHttpProxies([]);
          setHttpsProxies(data.https_proxies || []);
          setMessage(`Tìm thấy ${data.total_https || 0} HTTPS proxy sống.`);
        }
      } else {
        setMessage(`Lỗi: ${data.message || 'Không có phản hồi từ máy chủ'}`);
      }
    } catch (error) {
      console.error('Error checking proxies:', error);
      setMessage(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (proxyList) => {
    navigator.clipboard.writeText(proxyList.join('\n'))
      .then(() => {
        setMessage('Đã sao chép vào clipboard!');
        setTimeout(() => setMessage(''), 3000);
      })
      .catch(err => {
        console.error('Copy error:', err);
        setMessage(`Lỗi sao chép: ${err.message}`);
      });
  };

  const handleDownload = (proxyList, filename) => {
    const element = document.createElement('a');
    const file = new Blob([proxyList.join('\n')], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  return (
    <div className="container">
      <Head>
        <title>Proxy Scraper Tool</title>
        <meta name="description" content="Công cụ thu thập và kiểm tra proxy từ nhiều nguồn" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="header">
        <h1>Công Cụ Thu Thập Proxy</h1>
        <p>Tìm và kiểm tra proxy HTTP/HTTPS từ nhiều nguồn</p>
        <div className="api-status">
          API Status: <span className={isApiWorking ? "status-ok" : "status-error"}>
            {isApiWorking ? "✓ Hoạt động" : "✗ Không kết nối được"}
          </span>
        </div>
        <button className="help-button" onClick={toggleHelp}>
          {showHelp ? 'Ẩn trợ giúp' : 'Hiện trợ giúp'}
        </button>
      </div>

      {showHelp && (
        <div className="help-section">
          <div className="help-content">
            <h2>Hướng dẫn sử dụng</h2>
            <h3>Thu thập proxy:</h3>
            <ol>
              <li>Chọn các nguồn proxy bạn muốn thu thập</li>
              <li>Nhấn nút "Thu thập proxy"</li>
              <li>Chờ quá trình thu thập hoàn tất</li>
              <li>Sao chép hoặc tải xuống danh sách proxy</li>
            </ol>
            <h3>Kiểm tra proxy:</h3>
            <ol>
              <li>Dán danh sách proxy vào ô văn bản (định dạng IP:PORT, mỗi proxy một dòng)</li>
              <li>Chọn protocol, timeout và số luồng</li>
              <li>Nhấn nút "Kiểm tra proxy"</li>
              <li>Chờ quá trình kiểm tra hoàn tất</li>
              <li>Sao chép hoặc tải xuống danh sách proxy live</li>
            </ol>
            <p><strong>Lưu ý:</strong> Số lượng proxy kiểm tra tối đa là 100 để tránh timeout.</p>
          </div>
        </div>
      )}

      <div className="tab-container">
        <div 
          className={`tab ${activeTab === 'scrape' ? 'active' : ''}`} 
          onClick={() => setActiveTab('scrape')}
        >
          Thu thập proxy
        </div>
        <div 
          className={`tab ${activeTab === 'check' ? 'active' : ''}`} 
          onClick={() => setActiveTab('check')}
        >
          Kiểm tra proxy
        </div>
      </div>

      <div className="content">
        {activeTab === 'scrape' && (
          <>
            <div className="source-container">
              <div className="source-header">
                <h2>Nguồn proxy</h2>
                <button onClick={handleSelectAll} className="select-all-button">
                  {selectedSources.length === sources.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>
              
              {loading && sources.length === 0 ? (
                <div className="loading">Đang tải danh sách nguồn...</div>
              ) : (
                <div className="source-list">
                  {sources.map(source => (
                    <div key={source.id} className="source-item">
                      <input
                        type="checkbox"
                        id={`source-${source.id}`}
                        checked={selectedSources.includes(source.id)}
                        onChange={() => handleSelectSource(source.id)}
                      />
                      <label htmlFor={`source-${source.id}`}>{source.name}</label>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                className="primary-button" 
                onClick={handleScrapeProxies} 
                disabled={loading || sources.length === 0 || !isApiWorking}
              >
                {loading ? 'Đang xử lý...' : 'Thu thập proxy'}
              </button>
            </div>
          </>
        )}

        {activeTab === 'check' && (
          <>
            <div className="check-container">
              <h2>Kiểm tra proxy</h2>
              <div className="check-options">
                <div className="option-group">
                  <label>Loại protocol:</label>
                  <select 
                    value={protocol} 
                    onChange={(e) => setProtocol(e.target.value)}
                    disabled={loading}
                  >
                    <option value="http">HTTP</option>
                    <option value="https">HTTPS</option>
                  </select>
                </div>
                <div className="option-group">
                  <label>Timeout (giây):</label>
                  <input 
                    type="number" 
                    value={timeout} 
                    onChange={(e) => setTimeout(e.target.value)}
                    min="1"
                    max="10"
                    disabled={loading}
                  />
                </div>
                <div className="option-group">
                  <label>Số luồng:</label>
                  <input 
                    type="number" 
                    value={numThreads} 
                    onChange={(e) => setNumThreads(e.target.value)}
                    min="1"
                    max="50"
                    disabled={loading}
                  />
                </div>
              </div>
              <textarea 
                className="proxy-input"
                placeholder="Nhập danh sách proxy để kiểm tra (mỗi proxy một dòng, định dạng IP:PORT)"
                value={checkProxies}
                onChange={(e) => setCheckProxies(e.target.value)}
                rows="10"
                disabled={loading}
              ></textarea>
              <button 
                className="primary-button" 
                onClick={handleCheckProxies} 
                disabled={loading || !checkProxies.trim() || !isApiWorking}
              >
                {loading ? 'Đang kiểm tra...' : 'Kiểm tra proxy'}
              </button>
            </div>
          </>
        )}

        {message && <div className="message">{message}</div>}

        {(httpProxies.length > 0 || httpsProxies.length > 0) && (
          <div className="results-container">
            <h2>Kết quả</h2>
            
            {httpProxies.length > 0 && (
              <div className="proxy-results">
                <h3>HTTP Proxies ({httpProxies.length})</h3>
                <div className="actions">
                  <button onClick={() => handleCopyToClipboard(httpProxies)}>Sao chép</button>
                  <button onClick={() => handleDownload(httpProxies, 'http_proxies.txt')}>Tải xuống</button>
                </div>
                <textarea 
                  className="proxy-list" 
                  readOnly 
                  value={httpProxies.join('\n')}
                ></textarea>
              </div>
            )}
            
            {httpsProxies.length > 0 && (
              <div className="proxy-results">
                <h3>HTTPS Proxies ({httpsProxies.length})</h3>
                <div className="actions">
                  <button onClick={() => handleCopyToClipboard(httpsProxies)}>Sao chép</button>
                  <button onClick={() => handleDownload(httpsProxies, 'https_proxies.txt')}>Tải xuống</button>
                </div>
                <textarea 
                  className="proxy-list" 
                  readOnly 
                  value={httpsProxies.join('\n')}
                ></textarea>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="footer">
        <p>Proxy Scraper Tool &copy; {new Date().getFullYear()}</p>
        {loading && <div className="loading-indicator">Đang xử lý...</div>}
      </div>
    </div>
  );
}