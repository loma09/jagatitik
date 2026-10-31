# Jakarta landing-page preview

`jakarta-preview.webp` is a locally captured preview of the project's existing OpenStreetMap map, captured at 2x resolution on 25 October 2026. Map data © OpenStreetMap contributors: https://www.openstreetmap.org/copyright. Source tiles: https://tile.openstreetmap.org/.

The page retains visible attribution. Sample dots are fictional demonstration points and are not actual incident reports. The active centre marker and its record remain interactive React elements; the full interactive map remains on `/peta`.

The preview replaces a Leaflet instance that already disabled dragging, zoom, touch and keyboard interaction. It avoids loading a mapping library and remote tile requests merely to display a decorative read-only sample.


`jakarta-heatmap-preview.jpg`: tangkapan layar heatmap demo Jaga Titik (31 Oktober 2026), berisi data simulasi dan peta dasar © OpenStreetMap contributors, https://www.openstreetmap.org/copyright. Pratinjau statis menjaga landing page tetap ringan; peta interaktif berada di `/peta`.
