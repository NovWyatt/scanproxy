# Proxy Scraper Tool

Công cụ thu thập và kiểm tra proxy HTTP/HTTPS từ nhiều nguồn công khai.

## Tính năng

- Thu thập proxy từ nhiều nguồn web khác nhau
- Kiểm tra tính khả dụng của proxy
- Giao diện người dùng đơn giản và thân thiện
- Lưu trữ danh sách proxy vào file văn bản
- API RESTful để tích hợp với các ứng dụng khác

## Triển khai trên Vercel

### Bước 1: Chuẩn bị code

1. Clone repository này
```bash
git clone https://github.com/yourusername/proxy-scraper.git
cd proxy-scraper
```

### Bước 2: Cài đặt Vercel CLI

```bash
npm install -g vercel
```

### Bước 3: Đăng nhập vào Vercel

```bash
vercel login
```

### Bước 4: Triển khai lên Vercel

```bash
vercel
```

Làm theo các hướng dẫn trên màn hình để hoàn tất quá trình triển khai.

## Cách sử dụng

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

## API

API của ứng dụng có sẵn tại đường dẫn `/api`. Các endpoint chính:

- `GET /api/sources` - Lấy danh sách nguồn proxy
- `POST /api/scrape` - Thu thập proxy từ các nguồn
- `POST /api/check` - Kiểm tra danh sách proxy

## Lưu ý

- Công cụ này chỉ thu thập proxy từ các nguồn công khai và hợp pháp
- Sử dụng proxy một cách có trách nhiệm và tuân thủ các quy định về bảo mật và quyền riêng tư
- Hiệu suất của proxy có thể thay đổi theo thời gian

## Yêu cầu hệ thống

- Node.js >= 14.x
- Python >= 3.9
- Các thư viện được liệt kê trong `requirements.txt` và `package.json`

## Giấy phép

[MIT License](LICENSE)