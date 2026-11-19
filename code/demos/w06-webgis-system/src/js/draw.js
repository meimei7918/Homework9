// 【說明】draw.js：繪圖、編輯、匯出 GeoJSON，以及這版新增的「Alt＋點選後按 Delete 刪除」。
//   和 W06 framework 版不同的是：index.html 這次真的載入了它，也有對應的按鈕。
//   整段包在 $(function(){ … }) 裡，等 DOM 建好才執行。
$(function() {
  // 【說明】畫出來的圖徵放在一個獨立的向量圖層（drawLayer），用紅框、半透明白底；點用半徑 7 的紅色圓點。
  var drawSource = new ol.source.Vector();
  var drawLayer = new ol.layer.Vector({
    source: drawSource,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.5)'
      }),
      stroke: new ol.style.Stroke({
        color: '#ff3333',
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: '#ff3333'
        })
      })
    })
  });
  // 【說明】drawLayer 最後加入，又沒有設 zIndex，所以會在 initLayers 設了 zIndex 的套疊圖層下面。
  map.addLayer(drawLayer);
  // 【說明】兩個變數記住目前啟用中的互動，切換工具時先把舊的移除，避免同時有好幾個工具在作用。
  var select_interaction=undefined;
  var mouse_interaction=undefined;
  // 【說明】setInteraction(type)：開始畫某一種幾何。ol.interaction.Draw 的 type 可以是 Point、LineString、Polygon。
  //   線、面的畫法：點擊加節點，雙擊結束。
  function setInteraction(type){
    if(select_interaction!=undefined)     map.removeInteraction(select_interaction);
    if(mouse_interaction!=undefined)      map.removeInteraction(mouse_interaction);
    mouse_interaction = new ol.interaction.Draw({
      source: drawSource,
      type: type, //Point,LineString,Polygon
    });
    // 【說明】畫完一個就把 Draw 互動移除，所以每按一次按鈕只能畫一個；想連續畫，把這段刪掉即可。
    mouse_interaction.on('drawend', function(event) {
      map.removeInteraction(mouse_interaction);
      mouse_interaction=undefined;             //the usage is to judge drawing or not 
    });
    map.addInteraction(mouse_interaction);
    
  }
  // 【說明】三個繪圖按鈕：讀按鈕上的 drawType 屬性決定要畫哪一種。
  $('.btn-draw').click(function(){
    setInteraction($(this).attr('drawType'));    
  });
  
  // 【說明】Edit：Select 先選取圖徵，Modify 讓選到的圖徵可以拖曳節點。
  //   注意：這個 Select 沒有限定圖層，所以捷運站等資料圖層的點也能被選取、拖動。
  $('#btn-edit').click(function(){
    if(select_interaction!=undefined)     map.removeInteraction(select_interaction);
    if(mouse_interaction!=undefined)      map.removeInteraction(mouse_interaction);
    select_interaction = new ol.interaction.Select();
    mouse_interaction = new ol.interaction.Modify({   
      features: select_interaction.getFeatures()      
    });
    map.addInteraction(select_interaction);
    map.addInteraction(mouse_interaction);
  });
  
  
  // 【說明】下載 GeoJSON：writeFeatures 把地圖座標（EPSG:3857）轉回經緯度（EPSG:4326）輸出。
  //   JSON.parse 再 JSON.stringify(…, null, ' ') 是為了排版成好讀的格式。
  //   下載的原理：把連結的 href 換成 data: 網址並設定 download 屬性，瀏覽器接著跟隨這個連結就會下載。
  //   （json 沒有用 var 宣告，會變成全域變數）
  $('#btn-json').click(function(){
    //convert drawn features to geojson
    var gjsonfile = new ol.format.GeoJSON();
    var geojsonStr = gjsonfile.writeFeatures(drawSource.getFeatures(),{
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    //pretty print of geojson
    json=JSON.parse(geojsonStr);
    geojsonStr=JSON.stringify(json,null,' ');
    
    //download the geojson file
    var link=$(this);
    var filename="draw.geojson";
    $(link).attr('download',filename);
    $(link).attr('href','data:application/json,'+encodeURI(geojsonStr));
    console.log(geojsonStr);
  });

  // 【說明】新增：Alt＋點選來選取圖徵。condition 決定什麼操作算「選取」：click 且只按著 Alt 鍵。
  //   這個互動一直開著，而且不限圖層，所以資料圖層（例如機場捷運站）也能被選取。
  //   macOS 的 Alt 是 Option 鍵。
  //通過 alt+click 選擇 feature  
  var selectAltClick = new ol.interaction.Select({
    condition: function(mapBrowserEvent) {
      return ol.events.condition.click(mapBrowserEvent) && ol.events.condition.altKeyOnly(mapBrowserEvent);
    }
  });
  
  map.addInteraction(selectAltClick);
  //delete features
  // 【說明】新增：按 Delete 鍵（keyCode 46）時，把 Alt 選到的圖徵從它所屬圖層的 source 移除，再清空選取。
  //   刪除只發生在瀏覽器記憶體，重新整理頁面後資料檔裡的點又會回來。
  //   evt.which 是舊寫法，新的寫法是 evt.key === 'Delete'；Mac 筆電鍵盤的 delete 鍵其實是 Backspace，要按 fn＋delete 才是 Delete。
  document.addEventListener('keydown', function(evt) {
    if(evt.which==46){     // || evt.key=='Delete', key code for Delete key, evt.key for string comparison
      selectAltClick.getFeatures().forEach(function(feature){
        selectAltClick.getLayer(feature).getSource().removeFeature(feature);
      });
      selectAltClick.getFeatures().clear();
    }
  });
});