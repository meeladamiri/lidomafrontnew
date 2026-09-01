import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { divIcon, icon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";

// Standalone lat/lng picker for the admin panel — click or drag the pin.
// Deliberately not reusing components/Map: that one is formik-bound and
// carries the guest-site chrome (routing, "my location", popups).
const PIN = icon({
  iconUrl: "/assets/non-icomoon-icons/current-location-pinpoint.svg",
  iconSize: [36, 36],
  iconAnchor: [18, 34],
});

/**
 * Attractions, drawn as small dots rather than pins.
 *
 * A second pin shape would compete with the listing's own — the point of
 * showing them is to judge whether the listing's pin sits where it should
 * relative to places you recognise, and that reading only works if one marker
 * is obviously the subject.
 *
 * A divIcon, so there is no second asset to ship and it stays crisp at any zoom.
 */
const DOT = divIcon({
  className: "",
  html: '<span style="display:block;width:12px;height:12px;border-radius:9999px;background:#B26A00;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)"></span>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export interface MapMarker {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  /** Shown under the name in the popup, e.g. «۳٫۲ کیلومتر». */
  note?: string | null;
}

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
  markers,
  readOnly = false,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  height?: string;
  /** Nearby attractions, drawn as dots. */
  markers?: MapMarker[];
  /** Shows the pin without letting a click move it. */
  readOnly?: boolean;
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
        {!readOnly && <ClickHandler onPick={onChange} />}
        {(markers ?? []).map((m) => (
          <Marker key={m.id} position={[m.latitude, m.longitude]} icon={DOT}>
            <Popup>
              <span className="text-12 leading-18 text-black font-m">{m.name}</span>
              {!!m.note && (
                <span className="block text-11 leading-16 text-gray-6C6A7D">{m.note}</span>
              )}
            </Popup>
          </Marker>
        ))}
        <Recenter lat={center[0]} lng={center[1]} />
        {hasPin && (
          <Marker
            position={center}
            icon={PIN}
            draggable={!readOnly}
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
        {readOnly
          ? "موقعیت اقامتگاه"
          : hasPin
            ? "برای جابه‌جایی، روی نقشه کلیک کن یا پین را بکش"
            : "برای ثبت موقعیت روی نقشه کلیک کن"}
      </span>
    </div>
  );
}
