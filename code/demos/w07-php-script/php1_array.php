<?php
// 【說明】索引陣列：索引從 0 開始。下面兩段被註解掉的是另外兩種建立方式（逐一指定索引、用 $cars[] 逐一加入）。
// 【說明】三種陣列：索引陣列、關聯陣列、多維陣列，以及 count()。
//   老師用 /* … /**/ 的寫法快速開關一段程式：把開頭的 /* 刪掉，結尾的 /**/ 就變成一個空註解，整段就恢復執行。
$cars=["Volvo","BMW","Toyota"]; //=====Indexed arrays=====
//$cars=array("Volvo","BMW","Toyota"); 
/*$cars[0]="Volvo", 
$cars[1]="BMW";
$cars[2]="";
*/
/*
$cars[]="Volvo";     //insert
$cars[]="BMW";
$cars[]="Toyota"; 
array_push($cars,"Benz","Porsche");
echo print_r($cars,1);
*/

// 【說明】關聯陣列：用名稱當鍵。count($age) 是 3。
$age = ["Peter"=>35,"Ben"=>37,"Joe"=>43];  //=====Associative arrays=====
//$age = array("Peter"=>"35", "Ben"=>"37", "Joe"=>"43");
/*$age['Peter']=35;
$age['Ben']=37;
$age['Joe']=43;
/**/
echo "age:".count($age)."\n";


// 【說明】多維陣列：每個元素又是一個陣列。count($people) 是 4（最外層 4 筆），count($people, 1) 會把內層的元素也算進去。
$people = [                      //=====Multidimensional arrays=====
  ["Peter",35,175],
  ["Ben",37,180],
  ["Joe",43,162],
  ["Amy"]
 ];
echo "people:".count($people)."\n";  //$people=4, $people[0]=3, count($people,1)=14;

 
/*$carinfo = array       //php5
  (
  array("Benz",1),
  array("BMW",2),
  array("Škoda",3),
  array("Land Rover",4),
  array("Volvo",5)
  );/**/
// 【說明】實際執行：$carinfo 那段被註解掉了，所以這裡變數未定義。
//   print_r 只出現 Warning，但下一行的 count(null) 在 PHP 8 會變成致命錯誤（TypeError），程式在這裡停止。
//   解法：把上面 $carinfo 那段開頭的 /* 刪掉。
echo print_r($carinfo,1);
echo count($carinfo);

?>

