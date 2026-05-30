import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const SEVERITY_COLORS = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MODERATE: "#f59e0b",
  LOW: "#3b82f6",
}

const createPulsingIcon = (color) => L.divIcon({
  className: "",
  html: `<div style="position:relative;width:20px;height:20px">
    <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.3;animation:rg-ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>
    <div style="position:absolute;inset:3px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color}66"></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})

const createResponderIcon = (color) => L.divIcon({
  className: "",
  html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 6px ${color}88"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

const createHospitalIcon = () => L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:4px;background:#10b981;border:2px solid white;display:grid;place-items:center;color:white;font-weight:900;font-size:12px;box-shadow:0 0 10px #10b98166">H</div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const LiveMap = ({ accidents = [], selectedAccident, onSelectAccident }) => {
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const routeRef = useRef(null)
  const heatCirclesRef = useRef([])
  const responderMarkersRef = useRef([])

  // Init map — cleanup on unmount prevents "already initialized" on hot reload
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return

    const map = L.map(mapEl.current, { zoomControl: false }).setView([20.5937, 78.9629], 5)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: "bottomright" }).addTo(map)

    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      const userIcon = L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#60a5fa;border:3px solid white;box-shadow:0 0 0 4px #60a5fa44"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker([coords.latitude, coords.longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>Your Location</b>")
    })

    mapRef.current = map

    // CRITICAL: force Leaflet to re-measure after React paints the container
    setTimeout(() => map.invalidateSize(), 0)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Markers + heatmap
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    Object.values(markersRef.current).forEach(m => m.remove())
    markersRef.current = {}
    heatCirclesRef.current.forEach(c => c.remove())
    heatCirclesRef.current = []

    accidents.forEach(acc => {
      if (!acc.latitude || !acc.longitude) return
      const color = SEVERITY_COLORS[acc.severity] || "#64748b"

      const heat = L.circle([acc.latitude, acc.longitude], {
        radius: 800,
        color: "transparent",
        fillColor: color,
        fillOpacity: 0.08,
      }).addTo(map)
      heatCirclesRef.current.push(heat)

      const marker = L.marker([acc.latitude, acc.longitude], { icon: createPulsingIcon(color) })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:system-ui;min-width:160px">
            <div style="font-weight:700;color:#fff;margin-bottom:4px">${acc.locationName || "Unknown"}</div>
            <div style="font-size:11px;color:#94a3b8">${acc.severity} · ${acc.status}</div>
            ${acc.casualties ? `<div style="font-size:11px;color:#f87171;margin-top:4px">Casualties: ${acc.casualties}</div>` : ""}
          </div>
        `)
      marker.on("click", () => onSelectAccident?.(acc))
      markersRef.current[acc.id] = marker
    })
  }, [accidents, onSelectAccident])

  // Focus + responder routes for selected
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    // Clean up previous route + responder markers
    if (routeRef.current) { routeRef.current.remove(); routeRef.current = null }
    responderMarkersRef.current.forEach(m => m.remove())
    responderMarkersRef.current = []

    if (!selectedAccident?.latitude) return

    map.flyTo([selectedAccident.latitude, selectedAccident.longitude], 13, { duration: 1.2 })

    const responders = []
    if (selectedAccident.ambulanceAssigned)
      responders.push({
        pos: [
          selectedAccident.ambulanceLatitude || selectedAccident.latitude + 0.015,
          selectedAccident.ambulanceLongitude || selectedAccident.longitude + 0.015
        ],
        color: "#ef4444",
        label: `Ambulance · ${selectedAccident.currentResponderStatus || "DISPATCHED"} · ETA ${selectedAccident.etaMinutes ?? "--"}m`
      })
    if (selectedAccident.policeAssigned)
      responders.push({ pos: [selectedAccident.latitude - 0.015, selectedAccident.longitude - 0.015], color: "#94a3b8", label: "Police Unit" })

    if (responders.length > 0) {
      const lines = []
      responders.forEach(r => {
        const m = L.marker(r.pos, { icon: createResponderIcon(r.color) })
          .addTo(map)
          .bindPopup(`<b>${r.label}</b>`)
        responderMarkersRef.current.push(m)
        lines.push(r.pos)
      })
      routeRef.current = L.polyline(
        lines.map(p => [p, [selectedAccident.latitude, selectedAccident.longitude]]).flat(),
        { color: "#60a5fa", weight: 2, dashArray: "6 8", opacity: 0.7 }
      ).addTo(map)
    }

    if (selectedAccident.hospitalAssigned) {
      const pos = [selectedAccident.latitude + 0.025, selectedAccident.longitude - 0.02]
      const marker = L.marker(pos, { icon: createHospitalIcon() })
        .addTo(map)
        .bindPopup(`<b>${selectedAccident.hospitalAssigned.firstName} ${selectedAccident.hospitalAssigned.lastName}</b>`)
      responderMarkersRef.current.push(marker)
    }
  }, [selectedAccident])

  return (
    <>
      <style>{`
        @keyframes rg-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          background: #0f172a !important;
          border: 1px solid #1e293b !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-tip { background: #0f172a !important; }
        .leaflet-popup-close-button { color: #64748b !important; }
      `}</style>
      <div ref={mapEl} style={{ width: "100%", height: "100%", minHeight: "320px" }} />
    </>
  )
}

export default LiveMap
