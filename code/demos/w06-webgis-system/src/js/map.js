// 【說明】map.js：建立地圖、定義所有圖層與樣式、產生側邊欄的圖層選單，並處理點擊跳出資訊表。
//   開頭 4 行是新增的 proj4 設定：
//   proj4.defs 定義 EPSG:3826（TWD97 二度分帶，中央經線 121 度、單位公尺）。原文把 units 寫成「公尺」，proj4 不認得這個字，會用預設的公尺，所以結果還是對的；正式寫法是 +units=m。
//   另外兩行讓 GeoJSON 檔頭 crs 裡的 urn 寫法（例如 urn:ogc:def:crs:EPSG::3826）也能對應到同一個座標系統。
//   ol.proj.proj4.register(proj4) 把這些定義交給 OpenLayers，之後 OpenLayers 讀到 EPSG:3826 的資料就會自動從 EPSG:3826 轉成地圖用的 EPSG:3857。
proj4.defs('EPSG:3826', "+title=二度分帶：TWD97 TM2 台灣 +proj=tmerc  +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=公尺 +no_defs");
proj4.defs('urn:ogc:def:crs:OGC:1.3:CRS:84',  proj4.defs('EPSG:4326'));
proj4.defs('urn:ogc:def:crs:EPSG::3826',      proj4.defs('EPSG:3826'));
ol.proj.proj4.register(proj4);


// 【說明】初始中心點（臺灣中部）與縮放層級。
let init_lat=23.62;
let init_lng=120.5;
let zoom=8;
let user_location=null;
// 【說明】View：中心點要從經緯度（EPSG:4326，[經度, 緯度]）轉成地圖用的 EPSG:3857。
let view = new ol.View({
  center: ol.proj.transform([init_lng, init_lat], 'EPSG:4326', 'EPSG:3857'),
  zoom: zoom
});
// 【說明】Map 一開始沒有圖層（layers: []），之後由 initLayers() 一個個加進去。
let map = new ol.Map({
  layers: [],
  target: 'map',
  view: view,
  // 【說明】打開這行可以取消「雙擊放大」。畫線、面時要雙擊結束，會同時觸發放大，需要時可以打開。
  //interactions: ol.interaction.defaults({ doubleClickZoom: false }),
});

// 【說明】定位功能（Geolocation）仍整段被註解掉。打開後：
//   tracking: true 開始追蹤位置；projection 讓回傳座標直接是地圖的 EPSG:3857。
//   change:position 位置改變時觸發；第一次取得位置時把地圖移過去並放大到 14。
//   瀏覽器會先詢問是否允許定位，而且只在 HTTPS 或 localhost 下可用。
//for Geolocation
/*
var geolocation = new ol.Geolocation({
  tracking: true,
  projection: map.getView().getProjection()
});
geolocation.on('change:position', function() {
  if(user_location==null){
    user_location= geolocation.getPosition();  
    map.getView().setCenter(user_location);
    map.getView().setZoom(14);    
    var q=ol.proj.transform([parseFloat(user_location[0]), parseFloat(user_location[1])],'EPSG:3857','EPSG:4326');
    console.log(user_location,q);
  }  
});/**/

// 【說明】WMTS 圖磚格網設定（國土測繪中心底圖用）：第 0 層解析度＝EPSG:3857 世界寬度 ÷ 256 ≈ 156543 公尺／像素，
//   下面的迴圈算出 0～19 層，每層解析度減半。
//setting for tile services
let projection = ol.proj.get('EPSG:3857');              //projection
let projectionExtent = projection.getExtent();          //projectionExtent
let size = ol.extent.getWidth(projectionExtent) / 256;  //size
let resolutions = new Array(20);                        //resolutions
let matrixIds = new Array(20);                          //matrixIds
for (let z = 0; z < 20; ++z) {   
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
}

// 【說明】layers：用「物件」管理所有圖層。每一筆的鍵是圖層代號，值有三個欄位：
//   title：選單上顯示的名稱；type：base（底圖，單選）或 overlay（套疊圖層，可複選）；layer：OpenLayers 圖層物件。
//   要新增圖層，只要在這裡多加一筆，選單會自動長出來。
let layers = {
    'OSM': { 
        'title': 'OpenStreetMap(開放街圖)', 
        'type': 'base', 
        'layer': new ol.layer.Tile({ 
            visible:false,
            source: new ol.source.OSM()  
            }) 
        },
    // 【說明】Google 道路圖（XYZ 圖磚）。lyrs=m 道路圖、s 衛星、y 衛星＋道路。直接用 Google 圖磚網址僅適合課堂練習。
    'Google Maps': { 
        'title': 'Google Maps', 
        'type': 'base', 
        'layer': new ol.layer.Tile({ 
            visible:false,
            source: new ol.source.XYZ({
                crossOrigin: 'anonymous',
                url: 'https://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            })
        })
    },
    // 【說明】國土測繪中心 WMTS：layer 為 EMAP（臺灣通用電子地圖），tileGrid 使用上面算好的解析度。
    'EMAP': {
        'title': '通用電子地圖(門牌)',
        'type': 'base',
        'layer': new ol.layer.Tile({
            visible:false,
            extent: projectionExtent,
            source: new ol.source.WMTS({
                // 【說明】[網站版修改] url 原為 http://，改成 https，否則 HTTPS 網站會擋下圖磚。
                url: 'https://maps.nlsc.gov.tw/S_Maps/wmts?',
                layer: 'EMAP',
                matrixSet: 'GoogleMapsCompatible',
                format: 'image/jpeg',
                projection: projection,
                tileGrid: new ol.tilegrid.WMTS({
                    origin: ol.extent.getTopLeft(projectionExtent),
                    resolutions: resolutions,
                    matrixIds: matrixIds
                }),
                extent: projectionExtent,
                style: 'default'
            })
        })
    },
    // 【說明】機場捷運站（22 站，EPSG:4326）。每個點有 name、lat、lng、stype 屬性，下方的 popup 就是讀這幾個欄位。
    'metro': {
        'title': '機場捷運站',
        'type': 'overlay',
        'layer': new ol.layer.Vector({
            visible:false,
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: './data/metro.geojson',
            })
        })
    },
    // 【說明】新增：台北捷運站（121 站，EPSG:4326）。屬性是中文欄位（中文站名、路線名、地址…），沒有 name，
    //   所以點它不會跳出資訊表。結尾的 /**/ 是老師用來快速開關整段的習慣寫法，這裡沒有作用。
    'taipei-metro': {
        'title': '台北捷運站',
        'type': 'overlay',
        'layer': new ol.layer.Vector({
            visible:false,
            source: new ol.source.Vector({
              format: new ol.format.GeoJSON(),
              url: './data/taipei-metro.geojson',
            })       
       })
    },/**/
    // 【說明】新增：自行車租借站（10 個河濱公園）。這個檔案的座標是 TWD97（EPSG:3826），檔頭的 crs 有寫明，
    //   所以靠開頭的 proj4 設定才能放到正確位置；沒有 proj4 的話會讀不到這個座標系統。
    //   它沒有在 styles 裡定義樣式，所以顯示 OpenLayers 預設的藍色圓點；屬性也沒有 name，點了不會跳出資訊表。
    'bike': {
        'title': 'bike',
        'type': 'overlay',
        'layer': new ol.layer.Vector({
          visible:false,
          source: new ol.source.Vector({
              format: new ol.format.GeoJSON(),
              url: './data/bike.geojson',
          })  
        })
    },
    // 【說明】捷運路線（線資料）。
    'metroline': {
        'title': '捷運線',
        'type': 'overlay',
        'layer': new ol.layer.Vector({
            visible:false,
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: './data/metroline.geojson',
            })
        })
    },
    // 【說明】縣市界檔案約 14 MB，第一次勾選時需要幾秒下載。
    'county': {
        'title': '縣市範圍',
        'type': 'overlay',
        'layer': 
        
        new ol.layer.Vector({
            visible:false,
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: './data/county.geojson',
            })
        })
    },
}

// 【說明】setLayer(key)：只讓代號為 key 的底圖可見，其他底圖隱藏；overlay 不受影響。（迴圈的 i 沒有宣告，會變成全域變數）
let setLayer=function(key){     //function setLayer(idx)
  for (i = 0; i < Object.keys(layers).length; i++) {
    let tlayer = layers[Object.keys(layers)[i]];
    if (tlayer.type == 'base') 
      layers[Object.keys(layers)[i]].layer.setVisible(Object.keys(layers)[i]==key);    
  }
}

// 【說明】styles：每個圖層的樣式。這版 initLayers 裡套用樣式的那一行打開了，所以這些樣式會生效。
let styles = {
    // 【說明】注意：'metro' 寫了兩次。物件的鍵重複時，後面的會蓋掉前面的，
    //   所以這個黑底紅框圓點不會用到，機場捷運站實際顯示的是下一段的 Google 紅色圖釘。
    'metro': [new ol.style.Style({
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({color: 'black'}),
            stroke: new ol.style.Stroke({
              color: [255,0,0], width: 2
            })
        })
    })],
    // 【說明】Icon：用一張圖片當點的符號。crossOrigin: 'anonymous' 讓 OpenLayers 能讀取這張外部圖片來判斷點擊位置；
    //   如果圖片載入失敗，這些站點就不會顯示。想換回圓點，把這段刪掉或註解掉即可。
    'metro': [new ol.style.Style({
        image: new ol.style.Icon({
          crossOrigin: 'anonymous',
          src:'https://maps.google.com/mapfiles/ms/icons/red-dot.png'         
        })
    })],/**/
    // 【說明】台北捷運站：黑色填色、紅色外框的圓點。
    'taipei-metro': [new ol.style.Style({
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({color: 'black'}),
            stroke: new ol.style.Stroke({
              color: [255,0,0], width: 2
            })
        })
    })],
    // 【說明】線：stroke 設定顏色、寬度；lineDash [4, 8] 代表畫 4 像素、空 8 像素的虛線。
    'metroline': [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(100, 100, 100, 0.5)',
            width: 5,
            lineDash: [4,8]   //line dash pattern [line, space]
        })
    })],
    // 【說明】面：stroke 是邊界線，fill 是填色；rgba 的第四個值是透明度。
    'county': [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(100, 100, 200, 0.7)',
            width: 6
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.3)'
        })
    })]
};

// 【說明】initLayers：依 layers 產生側邊欄選單，並把每個圖層加進地圖。
function initLayers() {
  //console.log("layers:",layers[Object.keys(layers)[0]].layer);
  //console.log("layers:",Object.keys(layers)[0].layer);
  for (i = 0; i < Object.keys(layers).length; i++) {
    let tlayer = layers[Object.keys(layers)[i]];
    // 【說明】底圖：用 jQuery 組出一個單選鈕加到「基本底圖」標題後。i==2（第三個，EMAP）預設勾選。
    if (tlayer.type == 'base') {
      $('<div class="radio"><label><input type="radio" class="basecontrol" name="baselayer" id=' + Object.keys(layers)[i] + ' value="' + Object.keys(layers)[i] +'"'+ (i==2?' checked':'')   +' >' + tlayer.title + '</label></div>').appendTo("#baselayerlist");
      //console.log(layers[Object.keys(layers)[i]].title);
      map.addLayer(tlayer.layer);           
    // 【說明】套疊圖層：產生勾選框，加到「套疊圖資」標題後。
    }else if(tlayer.type == 'overlay') {
      $('<div class="checkbox"><label><input type="checkbox" class="overlaycontrol" name="overlayer" value="' + Object.keys(layers)[i] + '">' + tlayer.title + '</label></div>').appendTo("#overlayerlist");
      map.addLayer(tlayer.layer);
      // 【說明】setZIndex：數字大的畫在上面。10000 - i 讓 layers 中越前面的套疊圖層越上層。
      tlayer.layer.setZIndex(10000-i);
      // 【說明】這行在 W06 framework 版是註解掉的，這版打開了：依圖層代號套用 styles 裡的樣式。
      //   沒有對應樣式的圖層（bike）會拿到 undefined，等於使用預設樣式。
      tlayer.layer.setStyle(styleFunction(Object.keys(layers)[i]));
    }
  }
 
}

// 【說明】styleFunction：依圖層代號取出對應的樣式。
function styleFunction(stylename) {
  return styles[stylename];
};

initLayers();


// 【說明】新增：點擊圖徵跳出資訊表（popup）。
//   singleclick 是「單擊」事件，會等一下確認不是雙擊才觸發。
//   forEachFeatureAtPixel 找出點擊位置上的圖徵，回傳第一個找到的。
let popup=undefined;
map.on('singleclick', function(evt) {  //triger singleclick, get evt,
    let feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {  //get feature and layer by evt.pixel
    return feature;
    });
    // 【說明】每次點擊先移除舊的資訊表。
    //   小問題：typeof 回傳的是字串（例如 "undefined"），和 undefined 比較永遠不相等，所以這個判斷永遠成立；
    //   第一次點擊時等於呼叫 removeOverlay(undefined)，OpenLayers 會直接忽略，不會出錯。正確寫法是 if (popup !== undefined)。
    if(typeof(popup)!=undefined){
    map.removeOverlay(popup);
    }
    if (feature) {
    // 【說明】只有具備 name 屬性的圖徵才顯示資訊表，所以目前只有機場捷運站會跳出來；
    //   台北捷運站、自行車站的欄位名稱不同，點了沒有反應。要支援它們，可以改讀 feature.get('中文站名') 等欄位。
    if(feature.get('name')!=undefined){
        // 【說明】ol.Overlay：把一個 HTML 元素釘在地圖的某個座標上，地圖移動時會跟著動。
        //   這裡用 jQuery 一層層組出 table（表頭 key／value，四列：名稱、lat、lng、type），最後的 [0] 把 jQuery 物件轉回 DOM 元素。
        popup = new ol.Overlay({
        element: $("<div />").addClass('info').append(   //put a table to element parameter
            $("<table />").addClass('table').append(
            $("<thead />").append(
                $("<tr />").append(
                $("<th />").html("key")
                ).append(
                $("<th />").html("value")
                )
            )
            ).append(
            $("<tbody />").append(
                $("<tr />").append(
                $("<td />").html("名稱")
                ).append(
                $("<td />").html(feature.get('name'))
                )
            ).append(
                $("<tr />").append(
                $("<td />").html("lat")
                ).append(
                $("<td />").html(feature.get('lat'))
                )
            ).append(
                $("<tr />").append(
                $("<td />").html("lng")
                ).append(
                $("<td />").html(feature.get('lng'))
                )
            ).append(
                $("<tr />").append(
                $("<td />").html("type")
                ).append(
                $("<td />").html(feature.get('stype'))
                )
            )
            )
        )[0]
        });
        // 【說明】setPosition：資訊表放在點擊的位置；addOverlay 才會真正顯示。
        popup.setPosition(evt.coordinate);
        map.addOverlay(popup);
    }
    }
});


$(function() {
  //baseLayer control
  // 【說明】預設顯示通用電子地圖。
  setLayer('EMAP');
  // 【說明】底圖單選鈕改變時：被勾選的那個就切換成目前底圖。
  $("input.basecontrol").change(function() {
    if($(this).is(':checked'))
      setLayer($(this).attr('value'));    
  });
  
  //overlayLayer control
  // 【說明】套疊圖層勾選框改變時：勾選就顯示、取消就隱藏。
  $("input.overlaycontrol").change(function() {
    if($(this).is(':checked'))
      layers[$(this).val()].layer.setVisible(true);
    else
      layers[$(this).val()].layer.setVisible(false);
  });

});

