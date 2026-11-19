# 【說明】這個 Dockerfile 用官方 php:8.5-cli 映像檔，把 src/ 整個資料夾複製進容器，
#   再用 PHP 內建的開發伺服器（php -S）在 80 埠提供網頁。這包範例其實全是 HTML／JS，用 PHP 只是當作簡單的網頁伺服器。
#   用法（在 Dockerfile 這層資料夾）：docker build -t webgis . 然後 docker run --rm -p 20080:80 webgis，瀏覽器開 http://localhost:20080/
#   網站上不需要它：GitHub Pages 本身就是網頁伺服器，直接開 src/index.html 即可。
FROM php:8.5-cli

WORKDIR /app

# 只複製 src 資料夾內的內容到 /app
COPY src/ /app

EXPOSE 80

# 【說明】0.0.0.0 代表接受容器外部的連線；只寫 localhost 的話，從主機的瀏覽器會連不到。
CMD ["php", "-S", "0.0.0.0:80"]