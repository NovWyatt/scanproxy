# Proxy Scraper Tool

Công cụ thu thập và kiểm tra proxy HTTP/HTTPS từ nhiều nguồn công khai, được thiết kế để triển khai trên Vercel.

## Tính năng

- Thu thập proxy từ nhiều nguồn web khác nhau
- Kiểm tra tính khả dụng của proxy
- Giao diện người dùng đơn giản và thân thiện
- Lưu trữ và tải xuống danh sách proxy
- API RESTful để tích hợp với các ứng dụng khác

## Cấu trúc dự án

```
proxy-scraper/
├── api/
│   ├── main.py               # Logic chính của API
│   └── index.py              # Entry point cho serverless function
├── frontend/
│   ├── public/
│   │   ├── index.html        # HTML template
│   │   └── manifest.json     # PWA manifest
│   ├── src/
│   │   ├── App.js            # React component chính
│   │   ├── styles.css        # CSS styles
│   │   └── index.js          # Entry point React
│   ├── build.sh              # Script build cho Vercel
│   ├── .vercelignore         # Cấu hình Vercel ignore
│   └── package.json          # Cấu hình npm
├── app.py                    # Entry point cho Vercel
├── requirements.txt          # Python dependencies
├── vercel.json               # Cấu hình Vercel
└── README.md                 # Tài liệu hướng dẫn
```

## Triển khai trên Vercel

### Bước 1: Chuẩn bị

1. Fork hoặc clone repository này về máy của bạn:
```bash
git clone https://github.com/your-username/proxy-scraper.git
cd proxy-scraper
```

2. Đảm bảo bạn đã cài đặt Node.js, npm, và Git trên máy.

### Bước 2: Cài đặt Vercel CLI và đăng nhập

```bash
npm install -g vercel
vercel login
```

### Bước 3: Triển khai lên Vercel

```bash
vercel
```

Hoặc bạn có thể triển khai thông qua giao diện web của Vercel:

1. Đăng nhập vào [vercel.com](https://vercel.com)
2. Nhấp vào "Import Project" hoặc "New Project"
3. Chọn "Import Git Repository" và kết nối tới repository của bạn
4. Cấu hình các tùy chọn và nhấp vào "Deploy"

## Sử dụng ứng dụng

Sau khi triển khai, Vercel sẽ cung cấp cho bạn một URL để truy cập ứng dụng (ví dụ: `https://proxy-scraper.vercel.app`).

### Thu thập proxy

1. Truy cập vào trang web
2. Chọn các nguồn proxy bạn muốn thu thập
3. Nhấn nút "Thu thập proxy"
4. Chờ quá trình thu thập hoàn tất
5. Sao chép hoặc tải xuống danh sách proxy

### Kiểm tra proxy

1. Chuyển sang tab "Kiểm tra proxy"
2. Dán danh sách proxy của bạn vào ô văn bản
3. Chọn loại protocol (HTTP/HTTPS)
4. Điều chỉnh thời gian timeout và số luồng nếu cần
5. Nhấn nút "Kiểm tra proxy"
6. Chờ quá trình kiểm tra hoàn tất
7. Sao chép hoặc tải xuống danh sách proxy sống

## API Endpoints

API của ứng dụng có sẵn tại đường dẫn `/api`:

- `GET /api/sources` - Lấy danh sách nguồn proxy
- `POST /api/scrape` - Thu thập proxy từ các nguồn
- `POST /api/check` - Kiểm tra danh sách proxy
- `GET /api/test` - Kiểm tra API hoạt động

## Phát triển cục bộ

### Backend (FastAPI)

```bash
pip install -r requirements.txt
uvicorn api.main:app --reload
```

Backend sẽ chạy tại `http://localhost:8000`

### Frontend (React)

```bash
cd frontend
npm install
npm start
```

Frontend sẽ chạy tại `http://localhost:3000`

## Lưu ý

- Vercel có giới hạn 10 giây cho serverless functions, nên API đã được tối ưu để tránh timeout.
- Cấu trúc project đã được thiết kế đặc biệt để hoạt động tốt với Vercel.
- File `index.py` trong thư mục `api` đóng vai trò là entry point cho serverless function.
- File `app.py` ở thư mục gốc giúp Vercel nhận biết ứng dụng FastAPI.

## Giấy phép

[MIT License](LICENSE)