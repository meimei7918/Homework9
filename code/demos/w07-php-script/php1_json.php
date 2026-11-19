<?php
// 【說明】讀取 JSON 檔：file_get_contents → json_decode → foreach。資料是 194 筆災民收容所（政府開放資料）。
$jsonfile=file_get_contents("shelter.json"); //$jsonfile=file_get_contents(url);
// 【說明】先把原始 JSON 字串印出來：中文在檔案裡存成 \u707d 這種跳脫碼。
echo $jsonfile;

// 【說明】第二個參數 1：轉成關聯陣列，中文也會正確還原；不給的話會變成物件，要用 -> 取值。
$jsonArray=json_decode($jsonfile,1);    //acquire correct Chinese words

// 【說明】<pre> 讓 print_r 的縮排在網頁上也能顯示。
echo "<pre>";   //make a pretty print on webpage  
echo count($jsonArray);
echo print_r($jsonArray,1);


// 【說明】走訪每一筆收容所的每個欄位，把「聯絡人姓名」收集起來，用 in_array 去除重複。實際執行結果是 36 個不重複的名字。
//   注意：檔案開頭有 BOM，第一個欄位名稱前面多了一個看不見的字元，用第一個欄位名稱比對會對不到；這裡比對的是第四個欄位，所以不受影響。
$nameArray=[];
foreach($jsonArray as $key=>$item){
  foreach($item as $tkey=>$subitem){
    if($tkey=='聯絡人姓名'){
      if(!in_array($subitem,$nameArray))  //in_array (value, arrayName),    
        $nameArray[]=$subitem;
    }
  }
}
echo print_r($nameArray,1);
/**/
?>

