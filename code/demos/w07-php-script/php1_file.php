<?php
// 【說明】檔案讀寫：fopen／fgets／feof／fclose，以及 file_get_contents／file_put_contents。
//=====Read a file=====
// 【說明】if(true) 和下面的 if(0) 是老師的開關：true 會執行讀檔，0 不執行寫檔。要試寫檔就把 if(0) 改成 if(1)。
if(true){
  $fileName="WaterQ.csv";
  if (file_exists($fileName)){
    $contents="";
    // 【說明】r：唯讀。fopen 失敗時回傳 false，所以用 !==false 檢查。
    if(($myfile = fopen($fileName, "r"))!==false){
      // read a file by fgets
      // 【說明】每次讀一行，直到檔案結尾。
      while(!feof($myfile)){
        $contents.=fgets($myfile);       //read one line
        // mb_convert_encoding(result,string $to_encoding, string $from_encoding)
        // 【說明】實際執行：WaterQ.csv 是 Big5 編碼，直接輸出在 UTF-8 網頁上是亂碼。打開這行（並註解掉上一行）就會轉成 UTF-8。
        //   小提醒：資料裡的全形斜線「／」只在 Windows 的 Big5 延伸版才有，用 "big5" 轉會變成問號，改用 "CP950" 才完全正確。
        //$contents.=mb_convert_encoding(fgets($myfile),"UTF-8","big5");   //convert from big5 to UTF-8
      }
      echo $contents;
      fclose($myfile);      
    }/**/
    
    // 【說明】另一種寫法：file_get_contents 一次讀完，不用 fopen／fclose。前面的 @ 用來隱藏警告訊息。
    /*if(($contents=@file_get_contents($fileName))!==false){  //@ hide warning of file_get_contents, fopen is not necessary
      $contents=mb_convert_encoding($contents,"utf-8","big5");
      echo $contents;      
    }/**/
    echo "File '{$fileName}' read successfully";  
  }else
    // 【說明】這裡是「檔案不存在」時的分支，訊息卻寫 File exists!!，容易誤會，應該改成「檔案不存在」。
    echo "File exists!!";  
}


///////////Create a file///////////////
// 【說明】寫檔：w 模式會清空重寫；檔案不存在才寫，存在就印 File exists!!（這裡的訊息是對的）。
//   \r\n 是 Windows 的換行字元。
if(0){
  $fileName="chiao.csv";
  if (!file_exists($fileName)){
    if(($myfile = fopen($fileName, "w"))!==false){
      $contents="id,title,year\r\n";
      fwrite($myfile,$contents);
      $contents="1,BMW,2018\r\n2,Toyota,2017\r\n3,Benz,2017";
      fwrite($myfile,$contents);
      
      // 【說明】註解掉的這段少了換行：id,title,year 會和 1,BMW,2018 接在同一行，是常見錯誤。
      /*
      $contents="id,title,year";
      $contents.="1,BMW,2018\r\n2,Toyota,2017\r\n3,Benz,2017";
      fwrite($myfile,$contents);      
      /**/
      
      fclose($myfile);
      echo "File '{$fileName}' written successfully";      
    }else
      echo "File '{$fileName}' written failed";/**/
    
    /*$contents="id,title,year";
    $contents.="1,BMW,2018\r\n2,Toyota,2017\r\n3,Benz,2017";
    if(@file_put_contents($fileName,$contents)!==false){  //@ hide warning of file_put_contents
      echo "File '{$fileName}' written successfully <br />";
      echo $contents;      
    }else
      echo "File '{$fileName}' written failed <br />";/**/
  }else
    echo "File exists!! <br />";  
}

?>

