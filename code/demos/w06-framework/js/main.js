// 【說明】main.js：介面互動（側邊欄開關、視窗縮放時調整地圖大小）。
$(function() {
  // 【說明】按導覽列的「圖層列表」：切換側邊欄顯示，並把 Accordion 展開到第一個區塊（active: 0）。
  $("#nav_layerlist").click(function() {
      $("#sidebar").toggle();
      $("#accordion").accordion("option", { active: 0 });
      updateSize();
  });
  // 【說明】按側邊欄標題上的箭頭：收起側邊欄。
  $("#btn-hide").click(function() {
      $("#sidebar").hide();
      updateSize();
  });
  // 【說明】瀏覽器視窗大小改變時，重新計算版面。
  $(window).resize(function() {
      updateSize();
  });  
});

// 【說明】載入時先執行一次，讓地圖一開始就是正確大小。
updateSize();

// 【說明】updateSize：讓地圖跟著版面調整大小。
function updateSize(){
  // 【說明】容器高度＝視窗高度 − 導覽列高度，讓地圖填滿導覽列以下的空間。
  $("#container").css("height", $(window).height() - $("nav").height());
  // 【說明】初始化 Accordion；heightStyle: "fill" 讓面板填滿側邊欄的高度。
  $("#accordion").accordion({        //jQuery UI 
      heightStyle: "fill",
  });
   // 【說明】map.updateSize()：地圖容器尺寸改變後一定要呼叫，否則 OpenLayers 仍以舊尺寸繪圖，會出現空白或變形。
   map.updateSize();
  // 【說明】refresh：容器高度改了之後，讓 Accordion 重新計算各面板高度。
  $("#accordion").accordion("refresh");   
}
