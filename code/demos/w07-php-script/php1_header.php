<?php
// 【說明】告訴瀏覽器內容是 HTML、編碼 UTF-8，中文才不會變亂碼。
// 【說明】header()：設定 HTTP 回應標頭，必須在任何輸出之前呼叫。這個檔案執行後畫面是空白的，只送出了標頭。
header("Content-Type:text/html; charset=utf-8"); // UTF-8 encoding

// 【說明】打開這行：瀏覽器會被轉址到臺大地理系網站。
//header('Location: http://www.geog.ntu.edu.tw/index.php/tw/'); // Redirect browser */

// 【說明】打開這兩行：瀏覽器會把輸出（abc）當成檔案下載，檔名是隨機三位數 .txt。
//header("Content-Disposition:attachment;filename='".rand(100,999).".txt'");
//echo "abc";

?>

