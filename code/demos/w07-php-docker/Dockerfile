# 【說明】這個 Dockerfile 建立課程用的 PHP 執行環境。建立與執行（在這個資料夾裡）：
#     docker build -t phptest .
#     docker run -it --rm --name example -p 20080:80 phptest bash   ← 進入容器的命令列，可以打 php -v、php -q showtime.php
#     docker run --rm -p 20080:80 phptest                           ← 直接啟動網頁伺服器，瀏覽器開 http://localhost:20080/first.php
#   FROM：以官方 php:8.5-cli 映像檔為基礎（cli 版本只有命令列 PHP，沒有 Apache）。
FROM php:8.5-cli

# 【說明】WORKDIR：之後的指令都在容器裡的 /app 執行。
WORKDIR /app

# 只複製 src 資料夾內的內容到 /app
# 【說明】把 src/ 的程式複製到 /app。注意這是建立映像檔當下的「複製」，之後改 src/ 的檔案要重新 build 才會生效；
#   想要邊改邊看，可以在 docker run 加上 -v "$(pwd)/src:/app" 把資料夾掛進去。
COPY src/ /app
# 【說明】把 custom.ini 放進 PHP 的設定資料夾，PHP 啟動時會自動讀取裡面的設定。
COPY custom.ini /usr/local/etc/php/conf.d/



# 【說明】EXPOSE 只是標示容器使用 80 埠；真正讓主機連得到，要靠 docker run 的 -p 20080:80（主機 20080 → 容器 80）。
EXPOSE 80

# 【說明】容器啟動時執行 PHP 內建的開發用網頁伺服器，網站根目錄是 /app。0.0.0.0 代表接受容器外部的連線。
#   內建伺服器只適合開發測試，不要用在正式的公開網站。
CMD ["php", "-S", "0.0.0.0:80"]