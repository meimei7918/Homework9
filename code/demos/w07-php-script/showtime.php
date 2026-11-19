<?php
  // 【說明】命令列範例：每秒印出一次現在時間，用法 php -q showtime.php，按 Ctrl＋C 停止。
  //   while(1) 是無窮迴圈；不要用瀏覽器開，頁面會一直載入不完。
  //   chr(7) 是 ASCII 第 7 號控制字元（響鈴），有些終端機會嗶一聲。
  date_default_timezone_set('Asia/Taipei');
  while(1){
    echo date('Y-m-d H:i:s',time())."\n";
    echo Chr(7);
    sleep(1);
  }
  
  
  