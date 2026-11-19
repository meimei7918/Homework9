<?php
// 【說明】echo、print、print_r 的差別。老師在註解裡寫了每一行預期的輸出。
$cars=["Volvo","BMW","Toyota"];
echo "<pre>";
// 【說明】echo 陣列只會印出 Array，並出現 Warning: Array to string conversion。
echo $cars."\n";               //Output one or more strings, No value is returned.   Ans:Array
// 【說明】print_r 第二個參數是 0（false）：直接印出陣列內容，再回傳 true；前面的 echo 把 true 印成 1。
//   改成 print_r($cars,1) 則只回傳字串、不自己印，echo 才印出來，就不會多一個 1。
echo print_r($cars,0)."\n";    //When the return parameter is TRUE, 
                          //this function will return a string.
                          /*Ans:
                            Array
                            (
                                [0] => Volvo
                                [1] => BMW
                                [2] => Toyota
                            )
                            */

                          //Otherwise, print string with a return value is TRUE(1).
                            /*
                            Ans:
                            Array
                            (
                                [0] => Volvo
                                [1] => BMW
                                [2] => Toyota
                            )
                            1
                            */
// 【說明】print 一樣只能印字串（印陣列也是 Array 加 Warning），而且永遠回傳 1。
echo print($cars)."\n";        //Output a string, Returns 1, alway.
                            /*
                            Ans:
                            Array
                            1
                            */
?>