<?php
// 【說明】陣列常用函式。實際輸出：Is an array、Not in an array、16。
$cars=["Volvo","BMW","Toyota"]; //=====Indexed arrays=====
array_push($cars,"Benz","Porsche");
// 【說明】三元運算子：條件 ? 成立時的值 : 不成立時的值。
echo (is_array($cars)) ? "Is an array\n" : "Is not an array\n";
// 【說明】in_array：Subaru 不在陣列裡。
echo (in_array("Subaru",$cars)) ? "In an array\n" : "Not in an array\n";
// 【說明】打開這兩行可以看排序結果：BMW, Benz, Porsche, Toyota, Volvo（依字元編碼比較，大寫 M 排在小寫 e 前面，所以 BMW 在 Benz 前面）。
//sort($cars,SORT_STRING);  
//echo print_r($cars,1);

$age = ["Peter"=>35,"Joe"=>43,"Ben"=>37];  //=====Associative arrays=====
$people = [                       //=====Multidimensional arrays=====
  ["Peter",35,175],["Ben",37,180],["Joe",43,162],["Amy",25,167]
 ];
// 【說明】COUNT_RECURSIVE：外層 4 筆＋內層 4×3＝12 個值，共 16。
echo count($people,1); //COUNT_RECURSIVE
?>

