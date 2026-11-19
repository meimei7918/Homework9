<?php
  // 【說明】先設定時區，date() 才會輸出臺灣時間；容器預設是 UTC，差 8 小時。
  // 【說明】命令列範例：每秒印出一次現在時間，用法：php -q showtime.php。
  //   while(1) 是無窮迴圈，要按 Ctrl＋C 才會停止；不要用瀏覽器開這個檔案，頁面會一直載入不完。
  date_default_timezone_set('Asia/Taipei');
  while(1){
    // 【說明】date('Y-m-d H:i:s', time())：把現在的 Unix 時間戳記格式化成「年-月-日 時:分:秒」。
    echo date('Y-m-d H:i:s',time())."\n";
    // 【說明】chr(7) 是 ASCII 第 7 號控制字元 BEL（響鈴），有些終端機會因此嗶一聲；畫面上看不到這個字元。
    echo Chr(7);
    // 【說明】暫停 1 秒再進下一圈。
    sleep(1);
  }
  
  
  