// W02｜多底圖切換＋點擊顯示座標
// 執行環境：Leaflet 1.9.4，地圖容器 #map

// 1. 建立地圖，中心設在臺北（Leaflet 是 [緯度, 經度]）
const map = L.map("map").setView([25.04, 121.54], 13);

// 2. 準備三種底圖
const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 19,
});

// 國土測繪中心 WMTS：網址順序是 {z}/{y}/{x}
const emap = L.tileLayer(
  "https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}",
  { attribution: "&copy; 內政部國土測繪中心", maxZoom: 19 }
);

const photo = L.tileLayer(
  "https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/GoogleMapsCompatible/{z}/{y}/{x}",
  { attribution: "&copy; 內政部國土測繪中心", maxZoom: 19 }
);

osm.addTo(map); // 預設顯示 OSM

// 3. 圖層切換控制項：第一個物件是「底圖」（單選）
L.control
  .layers({ OpenStreetMap: osm, 臺灣通用電子地圖: emap, 正射影像: photo })
  .addTo(map);

// 4. 比例尺（只顯示公制）
L.control.scale({ imperial: false }).addTo(map);

// 5. 一個固定標記
L.marker([25.0478, 121.517])
  .addTo(map)
  .bindPopup("<b>臺北車站</b><br>點地圖其他地方試試看");

// 6. 點擊地圖 → 在點擊處彈出經緯度
map.on("click", (e) => {
  const { lat, lng } = e.latlng;
  L.popup()
    .setLatLng(e.latlng)
    .setContent(`緯度 ${lat.toFixed(5)}<br>經度 ${lng.toFixed(5)}`)
    .openOn(map);
});
