from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import os

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Danh sách các nguồn proxy công khai
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
    {"name": "HyperBeats Github", "url": "https://raw.githubusercontent.com/hyperbeats/proxy-list/main/https.txt", "id": 10}
]

# Dữ liệu mẫu cho các endpoint
SAMPLE_HTTP_PROXIES = [
    "103.152.112.162:80",
    "193.239.86.249:3128", 
    "143.244.60.111:8080",
    "195.181.172.230:8080",
    "51.79.65.156:32769"
]

SAMPLE_HTTPS_PROXIES = [
    "51.159.115.233:3128",
    "51.222.155.142:80",
    "47.91.44.217:8000",
    "114.119.189.57:3128",
    "51.159.115.233:3128"
]

@app.get("/api")
def read_api_root():
    return {
        "message": "Chào mừng đến với Proxy Scraper API",
        "version": "1.0.0",
        "endpoints": {
            "GET /api/sources": "Lấy danh sách nguồn proxy",
            "POST /api/scrape": "Thu thập proxy từ các nguồn",
            "POST /api/check": "Kiểm tra danh sách proxy",
            "GET /api/test": "Kiểm tra API hoạt động"
        }
    }

@app.get("/api/sources")
def get_sources():
    return SOURCES

@app.get("/api/test")
def test_api():
    return {"status": "success", "message": "API hoạt động!"}

@app.post("/api/scrape")
async def scrape_proxies(request: Request):
    try:
        # Đây là dữ liệu mẫu để kiểm tra frontend
        return {
            "http_proxies": SAMPLE_HTTP_PROXIES,
            "https_proxies": SAMPLE_HTTPS_PROXIES,
            "total_http": len(SAMPLE_HTTP_PROXIES),
            "total_https": len(SAMPLE_HTTPS_PROXIES),
            "message": "Thu thập proxy thành công",
            "status": "success"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Lỗi thu thập proxy: {str(e)}"}
        )

@app.post("/api/check")
async def check_proxies(request: Request):
    try:
        # Giả lập dữ liệu cho việc kiểm tra
        return {
            "http_proxies": SAMPLE_HTTP_PROXIES[:2],
            "https_proxies": [],
            "total_http": 2,
            "total_https": 0,
            "message": "Kiểm tra proxy thành công",
            "status": "success"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Lỗi kiểm tra proxy: {str(e)}"}
        )

@app.get("/api/latest")
async def get_latest_proxies():
    """Lấy danh sách proxy mới nhất đã thu thập"""
    return {
        "http_proxies": SAMPLE_HTTP_PROXIES,
        "https_proxies": SAMPLE_HTTPS_PROXIES,
        "total_http": len(SAMPLE_HTTP_PROXIES),
        "total_https": len(SAMPLE_HTTPS_PROXIES),
    }

# Route mặc định cho serverless function
@app.get("/")
@app.get("/{path:path}")
async def catch_all(path=""):
    return JSONResponse(
        {"message": "API Python đang hoạt động", "path": path}
    )