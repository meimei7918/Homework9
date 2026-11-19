<?php
// 【說明】先設時區；換成下一行的 Europe/Berlin，時間會慢 7 小時（德國夏令時間期間是 6 小時）。
// 【說明】時間與日期。time() 是從 1970-01-01 00:00:00 UTC 到現在的秒數，date() 依格式字元輸出日期。
date_default_timezone_set("Asia/Taipei");
//date_default_timezone_set("Europe/Berlin");  
echo time()."\n";  //start from 1970/1/1 00:00:00

echo "Today is " . date("Y-m-d")."\n";        
echo "Today is " . date("Y/m/d")."\n";        
echo "Today is " . date("Y.m.d")."\n";        
echo "Today is " . date("Y-m-d l")."\n";      
echo "Today is " . date('Y-m-d l H:i:s')."\n";  
echo "Today is " . date('Y-m-d l H:i:s A')."\n";  

// 【說明】z：一年中的第幾天，從 0 起算（1 月 1 日是 0）。w：星期幾，星期日是 0。
echo "Today is " . date("z")."\n";        
echo "Today is " . date("w")."\n";        
// 【說明】L：今年是閏年回傳字串 "1"，否則 "0"。下一行用 === "1" 比較，所以要用字串 "1"，寫成數字 1 就永遠不相等。
echo "Is this year a leap year? " .date("L")."\n";                      
echo "Is this year a leap year? " . (date("L")==="1"?"YES":"NO")."\n";      
?>

