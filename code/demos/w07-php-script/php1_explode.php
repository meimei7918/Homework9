<?php
// 【說明】explode：用空白把句子切成 4 個字的陣列。
// 【說明】字串與陣列互轉：explode、implode、compact、extract。
$strArray=explode(" ","Learning WebGIS is fun");   //explode
echo "<pre>";
echo print_r($strArray,1);

$cars=["Volvo","BMW","Toyota"];         //implode
array_push($cars,"Benz","Porsche");

// 【說明】implode：用逗號把陣列接成 Volvo,BMW,Toyota,Benz,Porsche。後面沒有換行，所以下一個 print_r 的 Array 會緊接在 Porsche 後面。
$carString=implode(",",$cars);
echo $carString;

$Peter=35;                            //compact
$Ben=37;
$Joe=43;
// 【說明】compact：用變數名稱當鍵、變數值當值，組成關聯陣列。
$age=compact('Peter','Ben','Joe');   //$age = ["Peter"=>35, "Ben"=>37, "Joe"=>43];  //=====Associative arrays=====
echo print_r($age,1);


$car1 = "Original";                    //extract
$car_array = array("car1" => "Volvo","car2" => "BMW", "car3" => "Toyota");
// 【說明】extract：反過來，把陣列的每個鍵變成變數。原本的 $car1 = "Original" 被覆蓋成 Volvo。
extract($car_array);
echo "\$car1 = {$car1}; \$car2 = {$car2}; \$car3 = {$car3}";

?>

