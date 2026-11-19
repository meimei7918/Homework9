<?
// 【說明】var_dump()：印出變數的型別和值，除錯用。這個檔案用短標籤開頭，需要 short_open_tag。
//   實際輸出：int(100)、float(200)、string(0) ""、bool(true)、string(23) "…"、array(3)…、object(stdClass)…
$a=100;
$b=200.0;
$c="";
$d=true;
$e="Learning WebGIS is fun!";
$f=["color1"=>"red","color2"=>"blue","color3"=>"yellow"];
//$f=array("color1"=>"red","color2"=>"blue","color3"=>"yellow");
// 【說明】(object) 把關聯陣列轉成物件：陣列用 $f['color1'] 取值，物件用 $g->color2 取值。
$g=(object)$f;

// 【說明】var_dump 自己就會直接輸出，回傳值是 null，所以前面的 echo 其實多餘。
echo var_dump($a);
// 【說明】怪現象：實際輸出是先出現 float(200)，才出現 Data type of variable b:。
//   因為 PHP 要先把整個字串算出來才 echo，算的過程中 var_dump($b) 已經先輸出了。
echo "Data type of variable b:". var_dump($b)."\n";
// 【說明】var_dump 可以一次放多個變數。
echo var_dump($c,$d,$e,$f,$g);
echo $f['color1']."\n";
echo $g->color2;
  