<?php
// 【說明】== 與 === 的差別。實際輸出：identically/exactly same、same。
$i=1;
// 【說明】試著把 $j 改成 1.0 或 "1"：== 只比值，仍然相等；=== 還要比型別，就不相等了，第一個 if 會輸出 same。
$j=1;     // test $j=1.0 , $j="1"  , both are "same"
if($i===$j)
  echo "identically/exactly same<br/>";
elseif($i==$j)
  echo "same<br/>";
else
  echo "different!<br/>";

// 【說明】第一個條件成立時，|| 後面就不會再算（短路求值）。
if($i===$j || $i==$j)
  echo "same<br/>";
else
  echo "different!<br/>";

?>


