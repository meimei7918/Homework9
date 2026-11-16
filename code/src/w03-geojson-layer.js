// W03｜GeoJSON 分類著色＋圖例
// 執行環境：Leaflet 1.9.4，地圖容器 #map
// 資料：data/geo/w03-taipei-landmarks.geojson（相對於本頁是 ../data/geo/...）

// 1. 底圖
const map = L.map("map").setView([25.035, 121.53], 13);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 19,
}).addTo(map);

// 2. 分類 → 顏色對照表（新增分類只要改這裡）
const COLORS = {
  交通: "#1f6f78",
  地標: "#c2412d",
  學校: "#b8651b",
  商圈: "#7a4b9c",
  公園: "#5f7a32",
};
const colorOf = (cat) => COLORS[cat] || "#666";

// 3. 讀取 GeoJSON 並加到地圖
fetch("../data/geo/w03-taipei-landmarks.geojson")
  .then((res) => res.json())
  .then((data) => {
    const layer = L.geoJSON(data, {
      // 點：用圓點取代預設的藍色圖釘
      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 8,
          color: "#fff",
          weight: 2,
          fillColor: colorOf(feature.properties.category),
          fillOpacity: 0.9,
        }),
      // 線、面：用 style 設定
      style: (feature) => ({
        color: colorOf(feature.properties.category),
        weight: 2,
        fillOpacity: 0.25,
      }),
      // 每個圖徵都綁上 popup
      onEachFeature: (feature, lyr) => {
        const p = feature.properties;
        lyr.bindPopup(`<b>${p.name}</b><br>分類：${p.category}`);
      },
    }).addTo(map);

    // 4. 把畫面縮放到剛好包住所有資料
    map.fitBounds(layer.getBounds(), { padding: [20, 20] });
  })
  .catch((err) => console.error("GeoJSON 讀取失敗：", err));

// 5. 自製圖例控制項
const legend = L.control({ position: "bottomright" });
legend.onAdd = () => {
  const div = L.DomUtil.create("div");
  div.style.cssText =
    "background:#fffdf8;padding:8px 12px;border-radius:8px;font-size:13px;line-height:1.8;box-shadow:0 1px 4px rgba(0,0,0,.2)";
  div.innerHTML =
    "<b>分類</b><br>" +
    Object.entries(COLORS)
      .map(
        ([name, c]) =>
          `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c};margin-right:6px"></span>${name}`
      )
      .join("<br>");
  return div;
};
legend.addTo(map);
