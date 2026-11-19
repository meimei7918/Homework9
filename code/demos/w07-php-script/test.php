<?php
// 【說明】rand(0,100)：0 到 100（含）的隨機整數。
// 【說明】基本語法：echo 輸出、註解、exit 結束程式。命令列執行：php -q test.php
//   實際輸出類似「81Learning web is fun 777」：rand(0,100) 的結果後面沒有換行，所以和下一句黏在一起；每次執行數字都不同。
echo rand(0,100);
$a=0;
// 【說明】用 . 把字串和數字串接起來；\n 是換行（在網頁上看不出來，要用 <br> 或在命令列看）。
echo "Learning web is fun ".rand(0,1000)."\n";
//this is a comment.
// 【說明】exit 會立刻結束整支程式，所以下一行的 I am here~ 永遠不會輸出。
exit;
echo "I am here~";
/* multiline comments
comment a,
comment b, 
comment c */

?>