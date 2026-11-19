<!-- 【說明】第一個 PHP 範例：HTML 裡夾著 PHP。伺服器執行後，瀏覽器收到的是 PHP 輸出的結果，看不到 PHP 原始碼。
     用 php -S 啟動後開 http://localhost:20080/first.php 觀察。 -->
<!DOCTYPE html>
<html>
<body>

<!-- 【說明】這段用短標籤開頭（省略了 php 三個字），要 custom.ini 開啟 short_open_tag 才會被當成 PHP 執行。
     裡面的 phpinfo() 被註解掉了。 -->
<?
  echo "The first PHP script!";
  //phpinfo();
?> 
<!-- 【說明】phpinfo() 輸出整頁 PHP 設定資訊（版本、載入的設定檔、擴充套件…），可以用來確認 custom.ini 有沒有生效。
     所以這頁會先看到 The first PHP script!，下面接著一大張 PHP 資訊表。phpinfo 會透露伺服器細節，不要留在公開網站上。 -->
<?php
  phpinfo();
?> 

</body>
</html>

