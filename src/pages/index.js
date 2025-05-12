// File: src/pages/index.js
// Đảm bảo đây là component export mặc định (default export)

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
// Import dữ liệu mẫu
import { SOURCES, SAMPLE_HTTP_PROXIES, SAMPLE_HTTPS_PROXIES } from '../data/mockData';

// Quan trọng: Phải là export default
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
  const [isApiWorking, setIsApiWorking] = useState(true);

  // Tải dữ liệu khi trang được load
  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = () => {
    try {
      setLoading(true);
      
      // Sử dụng dữ liệu mẫu
      setSources(SOURCES);
      setMessage('Tải danh sách nguồn thành công');
    } catch (error) {
      console.error('Error fetching sources:', error);
      setMessage(`Lỗi: Không thể tải danh sách nguồn - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component...
  
  return (
    <div className="container">
      <Head>
        <title>Proxy Scraper Tool</title>
        <meta name="description" content="Công cụ thu thập và kiểm tra proxy từ nhiều nguồn" />
      </Head>
      
      <div className="header">
        <h1>Công Cụ Thu Thập Proxy</h1>
        <p>Tìm và kiểm tra proxy HTTP/HTTPS từ nhiều nguồn</p>
      </div>
      
      {/* Rest of your JSX... */}
      
    </div>
  );
}