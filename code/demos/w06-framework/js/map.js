// 【說明】map.js：建立地圖、定義所有圖層與樣式，並產生側邊欄的圖層選單。
//   初始中心點（臺灣中部）與縮放層級。
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
  // 【說明】打開這行可以取消「雙擊放大」，在需要雙擊做其他事（例如結束繪圖）時有用。
  //interactions: ol.interaction.defaults({ doubleClickZoom: false }),
});

// 【說明】定位功能（Geolocation）目前整段被註解掉。打開後：
//   tracking: true 開始追蹤位置；projection 讓回傳座標直接是地圖的 EPSG:3857。
//   change:position 位置改變時觸發；user_location 為 null 代表第一次取得位置，把地圖移過去並放大到 14。
//   瀏覽器會先詢問使用者是否允許定位，而且只在 HTTPS 或 localhost 下可用。
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
        // 【說明】全部先設 visible:false，由選單決定顯示哪些。ol.source.OSM() 是 OpenStreetMap 的內建來源。
        'layer': new ol.layer.Tile({ 
            visible:false,
            source: new ol.source.OSM()  
            }) 
        },
    'Google Maps': { 
        'title': 'Google Maps', 
        'type': 'base', 
        'layer': new ol.layer.Tile({ 
            visible:false,
            // 【說明】Google 道路圖（XYZ 圖磚）。lyrs=m 道路圖、s 衛星、y 衛星＋道路。直接用 Google 圖磚網址僅適合課堂練習。
            source: new ol.source.XYZ({
                crossOrigin: 'anonymous',
                url: 'https://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            })
        })
    },
    'EMAP': {
        'title': '通用電子地圖(門牌)',
        'type': 'base',
        'layer': new ol.layer.Tile({
            visible:false,
            extent: projectionExtent,
            // 【說明】國土測繪中心 WMTS：layer 為 EMAP（臺灣通用電子地圖），tileGrid 使用上面算好的解析度。
            //   [網站版修改] url 原為 http://，改成 https。
            source: new ol.source.WMTS({
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
    'metro': {
        'title': '機場捷運站',
        'type': 'overlay',
        // 【說明】ol.layer.Vector：向量圖層；source 給 url 與 GeoJSON 格式，勾選時才下載顯示。
        //   GeoJSON 是 EPSG:4326，OpenLayers 會自動轉成 EPSG:3857。
        'layer': new ol.layer.Vector({
            visible:false,
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: './data/metro.geojson',
            })
        })
    },
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
    'county': {
        'title': '縣市範圍',
        'type': 'overlay',
        'layer': new ol.layer.Vector({
            visible:false,
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                // 【說明】縣市界檔案約 14 MB，第一次勾選時需要幾秒下載。
                url: './data/county.geojson',
            })
        })
    },
}

// 【說明】setLayer(key)：只讓代號為 key 的底圖可見，其他底圖隱藏；overlay 不受影響。
//   Object.keys(layers) 取得所有代號組成的陣列，例如 ['OSM','Google Maps','EMAP','metro',…]。（i 沒有宣告，會變成全域變數）
let setLayer=function(key){     //function setLayer(idx)
  for (i = 0; i < Object.keys(layers).length; i++) {
    let tlayer = layers[Object.keys(layers)[i]];
    if (tlayer.type == 'base') 
      layers[Object.keys(layers)[i]].layer.setVisible(Object.keys(layers)[i]==key);    
  }
}

// 【說明】styles：每個圖層的樣式。
//   注意：下方 initLayers 中套用樣式的那一行被註解掉了，所以目前圖層顯示的是 OpenLayers 預設樣式（藍色）。打開那一行才會使用這裡的樣式。
let styles = {
    // 【說明】點：image 用 ol.style.Circle，半徑 5、黑色填色、紅色外框（[R, G, B] 陣列也可以當顏色）。
    'metro': [new ol.style.Style({
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
    if (tlayer.type == 'base') {
      // 【說明】底圖：用 jQuery 組出一個單選鈕，appendTo 加到「基本底圖」標題後。i==2（第三個，EMAP）預設勾選。
      //   同一組單選鈕的 name 相同，所以一次只能選一個。（id 用了圖層代號，'Google Maps' 含空白，嚴格來說不是合法的 id）
      $('<div class="radio"><label><input type="radio" class="basecontrol" name="baselayer" id=' + Object.keys(layers)[i] + ' value="' + Object.keys(layers)[i] +'"'+ (i==2?' checked':'')   +' >' + tlayer.title + '</label></div>').appendTo("#baselayerlist");
      //console.log(layers[Object.keys(layers)[i]].title);
      map.addLayer(tlayer.layer);           
    }else if(tlayer.type == 'overlay') {
      // 【說明】套疊圖層：產生勾選框，加到「套疊圖資」標題後。
      $('<div class="checkbox"><label><input type="checkbox" class="overlaycontrol" name="overlayer" value="' + Object.keys(layers)[i] + '">' + tlayer.title + '</label></div>').appendTo("#overlayerlist");
      map.addLayer(tlayer.layer);
      // 【說明】setZIndex：數字大的畫在上面。10000 - i 讓 layers 中越前面的套疊圖層越上層（捷運站在捷運線上面，捷運線在縣市界上面）。
      tlayer.layer.setZIndex(10000-i);
      // 【說明】打開這行，就會用上面 styles 物件裡的樣式。
      //tlayer.layer.setStyle(styleFunction(Object.keys(layers)[i]));
    }
  }
 
}

// 【說明】styleFunction：依圖層代號取出對應的樣式。
function styleFunction(stylename) {
  return styles[stylename];
};

// 【說明】立刻執行 initLayers。它不在 ready 裡，但因為 map.js 放在 body 最後，這時側邊欄的元素已經存在。
initLayers();

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
  // 【說明】套疊圖層勾選框改變時：$(this).val() 是圖層代號，勾選就顯示、取消就隱藏。
  $("input.overlaycontrol").change(function() {
    if($(this).is(':checked'))
      layers[$(this).val()].layer.setVisible(true);
    else
      layers[$(this).val()].layer.setVisible(false);
  });

});

