<!-- 【說明】示範一個 .php 檔可以同時包含 HTML、JavaScript 與 PHP。
     JavaScript 在瀏覽器執行（Console 會印出 z: 130），PHP 在伺服器執行，兩者互不相干。 -->
<!DOCTYPE html>
<html>
  <head>
    <title>PHP demo</title>
    <script>  //put your JavaScript here
      // 【說明】head 裡宣告的 m，body 裡的 script 也讀得到（同一頁的 script 共用全域範圍）。
      let m=100;      
    </script>    
  </head>
  <body>
    <p id="para1"></p>
    <script> //put your JavaScript here
      let x = 10;
      let y = 20;
      // 【說明】z = 10 + 20 + 100 = 130。
      let z = x + y + m;
      console.log("z:",z);      
    </script>
  <!-- 【說明】注意：PHP 這段放在 </body> 之後、</html> 之前，輸出的文字其實在 body 外面。
       瀏覽器會自動修正，把它搬進 body 顯示，但這樣寫不合規範，應該放在 body 裡。
       這段也是用短標籤（省略 php 三個字），需要開啟 short_open_tag；div 用自我結束的寫法在 HTML 不成立，會被當成一般的開始標籤。 -->
  </body>
  <?
    echo "Learning WebGIS is fun!";
    echo "<div id='d1' />";
  ?>
</html>




