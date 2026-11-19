<?php
// 【說明】PHP 的變數範圍：local、global、$GLOBALS、static。命令列執行：php -q php1_v.php
//   函式外宣告的 $a、$c、$f、$g 是全域變數。
$a=100;   //global    
$c=300;   //global
$f=600;   //global
$g=700;   //global

// 【說明】函式裡預設「看不到」外面的全域變數，這點和 JavaScript 相反。
function tFun(){
    // 【說明】$b 是區域變數，只在函式裡有效。
    $b=200;       //local
    // 【說明】global $c 宣告後，函式裡的 $c 就是外面那個全域的 $c，讀到 300。
    global $c;    //global
    // 【說明】$d 原本不存在，在函式裡宣告成 global 再賦值 400，函式外面也看得到。
    global $d;    
    $d=400;
    // 【說明】static：只在第一次呼叫時設成 500，之後保留上次的值。
    //   第一次呼叫加 100 變 600，第二次（檔案最後一行）變 700。
    static $e=500;   //initialized only in the first call
    $e+=100;
    //var_dump($a);    
    echo "======== inside function=========\n"; 
    // 【說明】實際執行：$a 在函式裡沒有用 global 宣告，所以是未定義，PHP 8 會出現 Warning: Undefined variable $a，值是空的。
    echo "Variable a inside function is: {$a}\n";    
    echo "Variable b inside function is: {$b}\n";
    echo "Variable c inside function is: {$c}\n";
    echo "Variable d inside function is: {$d}\n";
    echo "Variable e inside function is: {$e}\n";
    // 【說明】$GLOBALS['f'] 不用 global 宣告也能讀到全域變數，結果 600。
    echo "Variable f inside function is: {$GLOBALS['f']}\n";
    echo "Variable g inside function is: {$GLOBALS['g']}\n";
} 
// 【說明】第一次呼叫。
tFun();
// 【說明】函式外面：$b、$e 是函式內的區域變數，外面讀不到（出現 Warning，值是空的）；$d 因為在函式裡宣告成 global，外面讀得到 400。
echo "======== outside function=========\n";
echo "Variable a outside function is: {$a}\n";
echo "Variable b outside function is: {$b}\n";
echo "Variable c outside function is: {$c}\n";
echo "Variable d outside function is: {$d}\n";
echo "Variable e outside function is: {$e}\n";
echo "Variable f outside function is: {$f}\n";
echo "Variable g outside function is: {$g}\n";
// 【說明】第二次呼叫：其他值都一樣，只有 static 的 $e 變成 700。
tFun();
//echo print_r($GLOBALS,1); 

