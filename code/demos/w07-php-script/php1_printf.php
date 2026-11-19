<?php
// 【說明】%d：整數。
// 【說明】printf 格式化輸出，已用 PHP 執行確認每一行的結果和老師註解相同。
printf("WebGIS is a %d-credit course. \n",3);
printf("Learning %s is fun. \n", "WebGIS");
// 【說明】%X：轉成大寫十六進位，65、127、245 → 41、7F、F5，組成顏色 #417FF5。
printf("<font color='#%X%X%X'>Hello</font>\n", 65, 127, 245);
// 【說明】%.2f：小數 2 位，123.42 / 12 = 10.285 → 10.29。字串裡的 $ 後面接 % 不是變數，所以照原樣印出。
printf("The result is: $%.2f . \n", 123.42 / 12);   

// Pad to 15 spaces
printf("The result is $%15f. \n", 123.42 / 12);    //The result is $ 10.285000
// Pad to 15 spaces, fill with zeros                  
printf("The result is $%015f. \n", 123.42 / 12);   //The result is $00000010.285000
// Pad to 15 spaces, 2 decimal places precision
printf("The result is $%15.2f. \n", 123.42 / 12);  //The result is $ 10.29
// Pad to 15 spaces, 2 decimal places precision, fill with zeros
printf("The result is $%015.2f. \n", 123.42 / 12); //The result is $000000000010.29
// Pad to 15 spaces, 2 decimal places precision, fill with # symbol
printf("The result is $%'#15.2f. \n", 123.42 / 12); //The result is $##########10.29

//using variable
// 【說明】sprintf 和 printf 用法相同，但不輸出，而是回傳字串，可以存到變數。
$a=sprintf("WebGIS is a %d-credit course. \n",3);
/*$showStr="WebGIS is a %d-credit course. \n";
$a=sprintf($showStr,3);*/
echo $a;
?>


