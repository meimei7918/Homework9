<!-- 【說明】第一個 PHP 範例：HTML 裡夾一段 PHP。伺服器執行後，瀏覽器只收到 The first PHP script! 這行字，看不到 PHP 原始碼。
     需要 PHP 伺服器才能執行（例如 W07 phptest 的 Docker 環境），GitHub Pages 無法執行 PHP。 -->
<!DOCTYPE html>
<html>
<body>

<?php
  // 【說明】echo 輸出字串，結果會出現在 body 裡。
  echo "The first PHP script!";
?> 

</body>
</html>

