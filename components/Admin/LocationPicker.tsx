import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";

// Standalone lat/lng picker for the admin panel — click or drag the pin.
// Deliberately not reusing components/Map: that one is formik-bound and
// carries the guest-site chrome (routing, "my location", popups).
/**
 * The listing's pin.
 *
 * Drawn inline rather than loaded from /assets: the previous icon was a
 * general-purpose "current location" graphic borrowed from the guest site,
 * which on OpenStreetMap tiles sat somewhere between the green of parks and
 * the beige of built-up areas and was genuinely hard to find on a busy map.
 *
 * This one is built to be found. The navy body is the panel's own header
 * colour and appears nowhere on a map tile; the white ring separates it from
 * whatever is underneath; the teal centre marks the exact point, so the pin
 * says which pixel it means rather than merely roughly where it is. A drop
 * shadow lifts it off dense city tiles.
 *
 * The tip is the anchor — `iconAnchor` is the bottom centre — so the point
 * the pin appears to indicate is the coordinate actually stored.
 */
const PIN = divIcon({
  className: "",
  html: `
    <svg width="34" height="46" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="lp-shadow" x="-50%" y="-30%" width="200%" height="170%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.35" />
        </filter>
      </defs>
      <path filter="url(#lp-shadow)"
            d="M17 45C17 45 32 27.4 32 17A15 15 0 1 0 2 17c0 10.4 15 28 15 28Z"
            fill="#2B3A55" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" />
      <circle cx="17" cy="17" r="7.5" fill="#FFFFFF" />
      <circle cx="17" cy="17" r="4" fill="#03D6BB" />
    </svg>`,
  iconSize: [34, 46],
  iconAnchor: [17, 45],
  popupAnchor: [0, -40],
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
