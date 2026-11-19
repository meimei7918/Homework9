<?php
// 【說明】foreach 走訪三種陣列。命令列執行：php -q php1_foreach.php
$cars=["Volvo","BMW","Toyota"]; //=====Indexed arrays=====
array_push($cars,"Benz","Porsche");
// 【說明】索引陣列：$key 是 0、1、2…。
foreach($cars as $key=>$item){
  echo "key:{$key} and name:{$item}\n";
}

$age = ["Peter"=>35, "Ben"=>37, "Joe"=>43];  //=====Associative arrays=====
// 【說明】關聯陣列：$key 是 Peter、Ben、Joe。
foreach($age as $key=>$item){
  echo "key:{$key} and age:{$item}\n";
}

$people = [                      //=====Multidimensional arrays=====
  ["Peter",35,175],["Ben",37,180],["Joe",43,162],["Amy",25,167]
 ];
 // 【說明】多維陣列要用兩層 foreach：外層取出每個人，內層取出每個人的三個值，共印 12 行。
 foreach($people as $key=>$item){
  foreach($item as $subitem)
    echo "key:{$key} and subitem:{$subitem}\n";
}
?>

