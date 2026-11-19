<?php
// 【說明】json_encode：把 PHP 陣列轉成 JSON 字串。
$cars=["Volvo","BMW","Toyota"];    //=====Indexed arrays=====
array_push($cars,"Benz","Porsche","喜美");

// 【說明】實際輸出 ["Volvo","BMW","Toyota","Benz","Porsche","\u559c\u7f8e"]：中文預設被轉成跳脫碼。
echo json_encode($cars);
// 【說明】打開這行：JSON_UNESCAPED_UNICODE 保留中文、JSON_PRETTY_PRINT 排版。兩個常數的值是 256 和 128，所以下一行寫 384 效果相同。
//echo json_encode($cars, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
//echo json_encode($cars,384);
$age = ["Peter"=>35, "Ben"=>37, "Joe"=>43];  //=====Associative arrays=====
// 【說明】關聯陣列會變成 JSON 物件：{"Peter":35,"Ben":37,"Joe":43}。和上一行的輸出之間沒有換行，會黏在一起。
echo json_encode($age);
?>

