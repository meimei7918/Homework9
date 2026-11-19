// 【說明】draw.js：繪製、編輯圖徵，並匯出成 GeoJSON 下載。
//   注意：index.html 目前沒有載入這支檔案，也沒有 .btn-draw、#btn-edit、#btn-json 這些按鈕，需要自己加上（見 W06 課後練習實作題 3）。
//   整段包在 $(function(){ … }) 裡，等 DOM 建好才執行。
$(function() {
  // 【說明】暫存圖層：空的向量來源＋向量圖層，用來放使用者畫的圖徵。
  var drawSource = new ol.source.Vector();
  var drawLayer = new ol.layer.Vector({
    source: drawSource,
    // 【說明】畫出來的圖徵樣式：半透明白色填色、紅色邊線、紅色圓點。
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
  // 【說明】把暫存圖層加到地圖上（map 是 map.js 建立的全域變數，所以 draw.js 要在 map.js 之後載入）。
  map.addLayer(drawLayer);
  // 【說明】select_interaction、mouse_interaction 記錄目前啟用中的互動，切換功能時才能先移除舊的。
  var select_interaction=undefined;
  var mouse_interaction=undefined;
  // 【說明】setInteraction(type)：開始繪製 type 指定的幾何（Point、LineString、Polygon）。
  function setInteraction(type){
    // 【說明】先移除目前的互動，避免同時開著「繪圖」和「編輯」。
    if(select_interaction!=undefined)     map.removeInteraction(select_interaction);
    if(mouse_interaction!=undefined)      map.removeInteraction(mouse_interaction);
    // 【說明】ol.interaction.Draw：讓使用者在地圖上點擊繪圖，畫完的圖徵自動加進 source（drawSource）。
    //   線、面的畫法：點擊加節點，雙擊結束。
    mouse_interaction = new ol.interaction.Draw({
      source: drawSource,
      type: type, //Point,LineString,Polygon
    });
    // 【說明】drawend：畫完一個圖徵時觸發。這裡畫完一個就關閉繪圖模式；要再畫得再按一次按鈕。
    mouse_interaction.on('drawend', function(event) {
      map.removeInteraction(mouse_interaction);
      mouse_interaction=undefined;             //the usage is to judge drawing or not 
    });
    // 【說明】map.addInteraction：啟用這個互動。
    map.addInteraction(mouse_interaction);
  }
  // 【說明】按下 class 為 btn-draw 的按鈕時，讀取它的 drawType 屬性（自訂屬性）決定要畫什麼。
  $('.btn-draw').click(function(){
    setInteraction($(this).attr('drawType'));    
  });
  
  // 【說明】編輯模式：Select（點選圖徵）＋ Modify（拖動被選圖徵的節點）。
  $('#btn-edit').click(function(){
    if(select_interaction!=undefined)     map.removeInteraction(select_interaction);
    if(mouse_interaction!=undefined)      map.removeInteraction(mouse_interaction);
    select_interaction = new ol.interaction.Select();
    // 【說明】Modify 的 features 指定為「被 Select 選到的圖徵」，所以只能修改選到的那一個。
    mouse_interaction = new ol.interaction.Modify({   
      features: select_interaction.getFeatures()      
    });
    map.addInteraction(select_interaction);
    map.addInteraction(mouse_interaction);
  });
  
  
  // 【說明】匯出：把畫好的圖徵轉成 GeoJSON 字串並下載。
  $('#btn-json').click(function(){
    //convert drawn features to geojson
    // 【說明】writeFeatures：圖徵在地圖上是 EPSG:3857（featureProjection），輸出時轉成 GeoJSON 標準的 EPSG:4326（dataProjection）。
    var gjsonfile = new ol.format.GeoJSON();
    var geojsonStr = gjsonfile.writeFeatures(drawSource.getFeatures(),{
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    //pretty print of geojson
    // 【說明】先 parse 再 stringify(json, null, ' ')：加上縮排換行，讓輸出的檔案好閱讀。（json 沒有宣告，會變成全域變數）
    json=JSON.parse(geojsonStr);
    geojsonStr=JSON.stringify(json,null,' ');
    
    //download the geojson file
    // 【說明】把被點的連結（#btn-json 必須是 <a>）加上 download 檔名與 data: 網址，瀏覽器就會把字串當成檔案下載。
    var link=$(this);
    var filename="draw.geojson";
    $(link).attr('download',filename);
    $(link).attr('href','data:application/json,'+encodeURI(geojsonStr));
    console.log(geojsonStr);
  });
});