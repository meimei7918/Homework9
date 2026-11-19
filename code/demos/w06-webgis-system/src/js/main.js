// 【說明】main.js：介面互動（側邊欄開關、視窗縮放時調整地圖大小）。和 W06 framework 版完全相同。
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

updateSize();

// 【說明】updateSize：容器高度＝視窗高度 − 導覽列高度；初始化 Accordion 並填滿側邊欄；
//   map.updateSize() 在容器尺寸改變後一定要呼叫，否則 OpenLayers 仍以舊尺寸繪圖。
function updateSize(){
  $("#container").css("height", $(window).height() - $("nav").height());
  $("#accordion").accordion({        //jQuery UI 
      heightStyle: "fill",
  });
   map.updateSize();
  $("#accordion").accordion("refresh");   
}
