import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { icon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";

// Standalone lat/lng picker for the admin panel — click or drag the pin.
// Deliberately not reusing components/Map: that one is formik-bound and
// carries the guest-site chrome (routing, "my location", popups).
/**
 * The listing's pin.
 *
 * The old icon was a general-purpose "current location" graphic borrowed from
 * the guest site; on OpenStreetMap tiles it sat between the green of parks and
 * the beige of built-up areas and was hard to find on a busy map. This one is
 * navy — the panel's own header colour, which appears on no map tile — with a
 * white ring to cut it out from whatever is underneath and a teal centre
 * marking the exact point.
 *
 * Deliberately an `icon()` with a data-URI, not a `divIcon`. A divIcon renders
 * a <div> whose children become drag targets, and Leaflet's drag teardown then
 * reaches for a class list on an element that is no longer the marker —
 * "Cannot read properties of undefined (reading 'classList')". An <img> is one
 * opaque element with nothing inside to become a target, which is the shape
 * this marker had before and the shape marker dragging expects.
 *
 * The anchor is the tip, so the pixel the pin appears to indicate is the
 * coordinate actually stored.
 */
const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 34 46">
<path d="M17 44.5C17 44.5 31.5 27.2 31.5 17A14.5 14.5 0 1 0 2.5 17c0 10.2 14.5 27.5 14.5 27.5Z" fill="#2B3A55" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>
<circle cx="17" cy="17" r="7.5" fill="#FFFFFF"/>
<circle cx="17" cy="17" r="4" fill="#03D6BB"/>
</svg>`;

const PIN = icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(PIN_SVG)}`,
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
 * An `icon()` for the same reason as PIN above: a divIcon's children become
 * drag targets and break Leaflet's drag teardown.
 */
const DOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
<circle cx="7" cy="7" r="5" fill="#B26A00" stroke="#FFFFFF" stroke-width="2"/>
</svg>`;

const DOT = icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(DOT_SVG)}`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -8],
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
