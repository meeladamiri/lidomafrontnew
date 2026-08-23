import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { icon } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

// Standalone lat/lng picker for the admin panel — click or drag the pin.
// Deliberately not reusing components/Map: that one is formik-bound and
// carries the guest-site chrome (routing, "my location", popups).
const PIN = icon({
  iconUrl: "/assets/non-icomoon-icons/current-location-pinpoint.svg",
  iconSize: [36, 36],
  iconAnchor: [18, 34],
});

// Tehran — used only until a residence has coordinates of its own.
const FALLBACK: [number, number] = [35.6892, 51.389];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Recenters when the coordinates change from outside (e.g. typed inputs). */
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function LocationPicker({
  lat,
  lng,
  onChange,
  height = "h-[300px]",
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  height?: string;
}) {
  const center: [number, number] = useMemo(
    () => (lat != null && lng != null ? [lat, lng] : FALLBACK),
    [lat, lng]
  );
  const hasPin = lat != null && lng != null;

  // Leaflet touches `window` on import — only render after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className={`${height} rounded-12 bg-gray-F0F0F0 animate-pulse`} />;
  }

  return (
    <div className={`${height} rounded-12 overflow-hidden border border-gray-E5E5E6 relative`}>
      <MapContainer center={center} zoom={hasPin ? 14 : 11} className="w-full h-full" scrollWheelZoom>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ClickHandler onPick={onChange} />
        <Recenter lat={center[0]} lng={center[1]} />
        {hasPin && (
          <Marker
            position={center}
            icon={PIN}
            draggable
            eventHandlers={{
              dragend(e) {
                const { lat: newLat, lng: newLng } = e.target.getLatLng();
                onChange(newLat, newLng);
              },
            }}
          />
        )}
      </MapContainer>
      <span className="absolute bottom-8 right-8 z-[400] bg-white/95 rounded-8 px-10 py-4 text-11 leading-16 text-gray-6C6A7D pointer-events-none">
        {hasPin ? "برای جابه‌جایی، روی نقشه کلیک کن یا پین را بکش" : "برای ثبت موقعیت روی نقشه کلیک کن"}
      </span>
    </div>
  );
}
