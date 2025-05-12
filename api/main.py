from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

app = FastAPI()

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    {"name": "HyperBeats Github", "url": "https://raw.githubusercontent.com/hyperbeats/proxy-list/main/https.txt", "id": 10}
]

@app.get("/")
async def root():
    return {
        "message": "Chào mừng đến với Proxy Scraper API",
        "version": "1.0.0"
    }

@app.get("/api")
async def api_info():
    return await root()

@app.get("/api/sources")
async def get_all_sources():
    return SOURCES

@app.post("/api/scrape")
async def scrape_proxies(request: Request):
    try:
        # Giả lập dữ liệu để kiểm tra
        http_proxies = [
            "103.152.112.162:80",
            "193.239.86.249:3128",
            "143.244.60.111:8080",
            "195.181.172.230:8080"
        ]
        https_proxies = [
            "51.159.115.233:3128",
            "51.222.155.142:80",
            "47.91.44.217:8000",
            "114.119.189.57:3128"
        ]
        
        return {
            "http_proxies": http_proxies,
            "https_proxies": https_proxies,
            "total_http": len(http_proxies),
            "total_https": len(https_proxies),
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
        # Giả lập dữ liệu để kiểm tra
        return {
            "http_proxies": ["103.152.112.162:80", "143.244.60.111:8080"],
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
        "http_proxies": ["103.152.112.162:80", "143.244.60.111:8080"],
        "https_proxies": ["51.159.115.233:3128", "51.222.155.142:80"],
        "total_http": 2,
        "total_https": 2,
    }

# Handler đặc biệt cho serverless function trên Vercel
@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def catch_all(request: Request, path_name: str):
    if path_name.startswith("api/"):
        return {"error": "API endpoint không tồn tại"}
        
    # Nếu không phải API request, trả về thông báo lỗi 404
    return JSONResponse(
        status_code=404,
        content={"detail": "Không tìm thấy trang"}
    )