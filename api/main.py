from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import requests
from bs4 import BeautifulSoup
import re
import time
import logging
import random
from concurrent.futures import ThreadPoolExecutor

app = FastAPI(title="Proxy Scraper API")

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# User agents để tránh bị chặn
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36"
]

# Danh sách các nguồn proxy công khai và hợp pháp
SOURCES = [
    {"name": "Free-Proxy-List.net (HTTPS)", "url": "https://free-proxy-list.net/", "id": 1},
    {"name": "SSLProxies.org (HTTPS)", "url": "https://www.sslproxies.org/", "id": 2},
    {"name": "US Proxy List", "url": "https://www.us-proxy.org/", "id": 3},
    {"name": "UK Proxy List", "url": "https://free-proxy-list.net/uk-proxy.html", "id": 4},
    {"name": "Proxy-List.download (HTTPS API)", "url": "https://www.proxy-list.download/api/v1/get?type=https", "id": 5},
    {"name": "Proxy-List.download (HTTP API)", "url": "https://www.proxy-list.download/api/v1/get?type=http", "id": 6},
    {"name": "TheSpeedX Github (HTTP)", "url": "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt", "id": 7},
    {"name": "ShiftyTR Github (HTTPS)", "url": "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/https.txt", "id": 8},
    {"name": "Monosans Github", "url": "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt", "id": 9},
    {"name": "HyperBeats Github", "url": "https://raw.githubusercontent.com/hyperbeats/proxy-list/main/https.txt", "id": 10},
    {"name": "GeoNode Free Proxy List", "url": "https://geonode.com/free-proxy-list", "id": 11}
]

# Database tạm thời để lưu trữ kết quả (trong bộ nhớ)
# Trong triển khai thực tế, bạn có thể sử dụng Redis hoặc database khác
in_memory_db = {
    "latest_http_proxies": [],
    "latest_https_proxies": [],
    "latest_check_results": {}
}

# Khai báo các model
class SourceInfo(BaseModel):
    id: int
    name: str
    url: str

class ProxySourceRequest(BaseModel):
    source_ids: Optional[List[int]] = None

class ProxyCheckRequest(BaseModel):
    proxies: List[str]
    protocol: str = "https"
    timeout: int = 10
    num_threads: int = 50

class ProxyResponse(BaseModel):
    http_proxies: List[str]
    https_proxies: List[str]
    total_http: int
    total_https: int
    message: str
    status: str

# Các hàm xử lý
def test_proxy(proxy, protocol="https", timeout=10):
    try:
        if protocol == "https":
            requests.get("https://www.google.com", proxies={"https": f"{protocol}://{proxy}"}, timeout=timeout)
        else:
            requests.get("http://httpbin.org/ip", proxies={"http": f"{protocol}://{proxy}"}, timeout=timeout)
        return True
    except Exception as e:
        logging.error(f"Lỗi kiểm tra proxy {proxy} ({protocol}): {e}")
        return False

def check_proxies_multithreaded(proxy_list, protocol="https", num_threads=50, timeout=10, task_id=None):
    live_proxies = []
    dead_proxies = []
    
    logging.info(f"Đang kiểm tra {len(proxy_list)} proxy {protocol.upper()} với {num_threads} luồng...")
    
    # Xử lý số threads tối đa để không vượt quá giới hạn của Vercel
    max_safe_threads = min(num_threads, 25)  # Giảm số lượng thread để tránh quá tải
    
    with ThreadPoolExecutor(max_workers=max_safe_threads) as executor:
        results = list(executor.map(
            lambda proxy: (proxy, test_proxy(proxy, protocol, timeout)), 
            proxy_list[:200]  # Giới hạn số lượng proxy kiểm tra để tránh timeout
        ))
        
        for proxy, is_alive in results:
            if is_alive:
                live_proxies.append(proxy)
            else:
                dead_proxies.append(proxy)
        
        logging.info(f"Đã kiểm tra xong proxy {protocol.upper()}.")
    
    # Lưu kết quả nếu có task_id
    if task_id:
        in_memory_db["latest_check_results"][task_id] = {
            "live_proxies": live_proxies,
            "protocol": protocol,
            "total_checked": len(proxy_list[:200]),
            "total_live": len(live_proxies)
        }
        
    return live_proxies, dead_proxies

def scrape_source(source_info):
    source_name, source_url = source_info["name"], source_info["url"]
    http_proxies = []
    https_proxies = []
    
    logging.info(f"Đang thu thập từ nguồn: {source_name}")
    
    try:
        random_user_agent = random.choice(USER_AGENTS)
        response = requests.get(source_url, headers={'User-Agent': random_user_agent}, timeout=15)
        response.raise_for_status()

        # Xử lý dựa trên định dạng từng trang
        if "proxy-list.download" in source_url:
            for line in response.text.splitlines():
                if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$", line.strip()):
                    if "type=https" in source_url:
                        https_proxies.append(line.strip())
                    else:
                        http_proxies.append(line.strip())

        elif "githubusercontent.com" in source_url:
            for line in response.text.splitlines():
                if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$", line.strip()):
                    if "http.txt" in source_url:
                        http_proxies.append(line.strip())
                    else:
                        https_proxies.append(line.strip())

        elif "free-proxy-list.net" in source_url or "us-proxy.org" in source_url or "sslproxies.org" in source_url:
            soup = BeautifulSoup(response.text, 'html.parser')
            table = soup.find('table')
            if table:
                for row in table.find_all('tr')[1:]:
                    cols = row.find_all('td')
                    if len(cols) >= 7:
                        ip_address = cols[0].text.strip()
                        port = cols[1].text.strip()
                        https_support = cols[6].text.strip().lower()
                        
                        if https_support == 'yes':
                            https_proxies.append(f"{ip_address}:{port}")
                        else:
                            http_proxies.append(f"{ip_address}:{port}")

        elif "geonode.com" in source_url:
            soup = BeautifulSoup(response.text, 'html.parser')
            table = soup.find('table', class_='proxy-list')
            if table:
                for row in table.find_all('tr')[1:]:
                    cols = row.find_all('td')
                    if len(cols) >= 2:
                        ip_address = cols[0].text.strip()
                        port = cols[1].text.strip()
                        protocol = cols[2].text.strip().lower() if len(cols) > 2 else "http"
                        
                        if protocol == 'https':
                            https_proxies.append(f"{ip_address}:{port}")
                        else:
                            http_proxies.append(f"{ip_address}:{port}")
        
        logging.info(f"Đã lấy {len(http_proxies) + len(https_proxies)} proxy từ: {source_name}")
        return http_proxies, https_proxies

    except requests.exceptions.RequestException as e:
        logging.error(f"Lỗi truy cập: {source_name}: {e}")
    except Exception as e:
        logging.error(f"Lỗi xử lý: {source_name}: {e}")
    
    return [], []

def get_proxies(selected_source_ids=None):
    sources_to_scrape = []
    if selected_source_ids:
        for source_id in selected_source_ids:
            source = next((s for s in SOURCES if s["id"] == source_id), None)
            if source:
                sources_to_scrape.append(source)
    else:
        sources_to_scrape = SOURCES

    http_proxies = []
    https_proxies = []

    if not sources_to_scrape:
        logging.warning("Không có nguồn proxy nào được chọn hoặc hợp lệ.")
        return [], []

    # Giới hạn số lượng nguồn để tránh timeout trên Vercel
    sources_to_scrape = sources_to_scrape[:5]  

    with ThreadPoolExecutor(max_workers=5) as executor:
        source_results = list(executor.map(scrape_source, sources_to_scrape))

        for http_source, https_source in source_results:
            http_proxies.extend(http_source)
            https_proxies.extend(https_source)

    # Loại bỏ trùng lặp
    http_proxies = list(set(filter(None, http_proxies)))
    https_proxies = list(set(filter(None, https_proxies)))
    
    # Cập nhật database tạm thời
    in_memory_db["latest_http_proxies"] = http_proxies
    in_memory_db["latest_https_proxies"] = https_proxies
    
    return http_proxies, https_proxies

# API routes
@app.get("/")
async def root():
    return {
        "message": "Chào mừng đến với Proxy Scraper API",
        "version": "1.0.0",
        "endpoints": {
            "GET /sources": "Lấy danh sách nguồn proxy",
            "POST /scrape": "Thu thập proxy từ các nguồn",
            "POST /check": "Kiểm tra danh sách proxy",
            "GET /scrape-and-check": "Thu thập và kiểm tra proxy (background)"
        }
    }

@app.get("/api")
async def api_info():
    return await root()

@app.get("/api/sources", response_model=List[SourceInfo])
async def get_all_sources():
    return SOURCES

@app.post("/api/scrape", response_model=ProxyResponse)
async def scrape_proxies(request: ProxySourceRequest):
    try:
        http_proxies, https_proxies = get_proxies(request.source_ids)
        
        return {
            "http_proxies": http_proxies,
            "https_proxies": https_proxies,
            "total_http": len(http_proxies),
            "total_https": len(https_proxies),
            "message": "Thu thập proxy thành công",
            "status": "success"
        }
    except Exception as e:
        logging.error(f"Lỗi thu thập proxy: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi thu thập proxy: {str(e)}")

@app.post("/api/check", response_model=ProxyResponse)
async def check_proxies_api(request: ProxyCheckRequest):
    try:
        if not request.proxies:
            return {
                "http_proxies": [],
                "https_proxies": [],
                "total_http": 0,
                "total_https": 0,
                "message": "Không có proxy nào để kiểm tra",
                "status": "warning"
            }
        
        # Giới hạn số lượng proxy kiểm tra để tránh timeout
        max_proxies = 100
        proxies_to_check = request.proxies[:max_proxies]
        
        if request.protocol.lower() == "http":
            live_proxies, _ = check_proxies_multithreaded(
                proxies_to_check, 
                protocol="http", 
                num_threads=min(request.num_threads, 25),
                timeout=min(request.timeout, 5)  # Giới hạn timeout tối đa
            )
            return {
                "http_proxies": live_proxies,
                "https_proxies": [],
                "total_http": len(live_proxies),
                "total_https": 0,
                "message": f"Kiểm tra proxy HTTP thành công ({len(live_proxies)}/{len(proxies_to_check)} sống)",
                "status": "success"
            }
        else:
            live_proxies, _ = check_proxies_multithreaded(
                proxies_to_check, 
                protocol="https", 
                num_threads=min(request.num_threads, 25),
                timeout=min(request.timeout, 5)  # Giới hạn timeout tối đa
            )
            return {
                "http_proxies": [],
                "https_proxies": live_proxies,
                "total_http": 0,
                "total_https": len(live_proxies),
                "message": f"Kiểm tra proxy HTTPS thành công ({len(live_proxies)}/{len(proxies_to_check)} sống)",
                "status": "success"
            }
    except Exception as e:
        logging.error(f"Lỗi kiểm tra proxy: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi kiểm tra proxy: {str(e)}")

@app.get("/api/scrape-and-check")
async def scrape_and_check(
    background_tasks: BackgroundTasks, 
    source_ids: Optional[List[int]] = None,
    limit: Optional[int] = 100
):
    try:
        # Thu thập proxy
        http_proxies, https_proxies = get_proxies(source_ids)
        
        # Tạo ID cho task
        task_id = f"task_{int(time.time())}"
        
        # Kiểm tra proxy trong background (giới hạn số lượng)
        if http_proxies:
            background_tasks.add_task(
                check_proxies_multithreaded, 
                proxy_list=http_proxies[:limit], 
                protocol="http",
                task_id=f"{task_id}_http"
            )
            
        if https_proxies:
            background_tasks.add_task(
                check_proxies_multithreaded, 
                proxy_list=https_proxies[:limit], 
                protocol="https",
                task_id=f"{task_id}_https"
            )
        
        return {
            "message": "Đã bắt đầu thu thập và kiểm tra proxy trong background",
            "total_http_collected": len(http_proxies),
            "total_https_collected": len(https_proxies),
            "status": "processing",
            "task_id": task_id
        }
    except Exception as e:
        logging.error(f"Lỗi thu thập và kiểm tra proxy: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi thu thập và kiểm tra proxy: {str(e)}")

@app.get("/api/task/{task_id}")
async def get_task_status(task_id: str):
    http_result = in_memory_db["latest_check_results"].get(f"{task_id}_http")
    https_result = in_memory_db["latest_check_results"].get(f"{task_id}_https")
    
    if not http_result and not https_result:
        return {
            "message": "Task không tồn tại hoặc chưa hoàn thành",
            "status": "not_found"
        }
    
    results = {
        "status": "completed",
        "http_result": http_result,
        "https_result": https_result
    }
    
    return results

@app.get("/api/latest")
async def get_latest_proxies():
    """Lấy danh sách proxy mới nhất đã thu thập"""
    return {
        "http_proxies": in_memory_db["latest_http_proxies"],
        "https_proxies": in_memory_db["latest_https_proxies"],
        "total_http": len(in_memory_db["latest_http_proxies"]),
        "total_https": len(in_memory_db["latest_https_proxies"]),
    }

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization"
    return response