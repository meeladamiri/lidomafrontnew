import "leaflet/dist/leaflet.css";
import { DomEvent, icon } from "leaflet";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from "react";
import { IRAN_Lat_Long } from "constants/Residences/Submit/Steps/Step_8";
import { LinkButton } from "../General/core/Button";
import { useMap, TileLayer, Marker, Popup, useMapEvents, MapContainer } from "react-leaflet";

const ProjectMap = ({
  userLat,
  userLang,
  setUserLat,
  setUserLang,
  showZoomControl = false,
  readOnly = false,
  mapClassname,
  getUserLocationBtnClassname,
  // NOTE ABOUT FORMIK: formik.values.[name] ==> [number, number] || []
  // [number, number] ==> [lat, lng]
  // [] ==> no pin-point on the map.
  formik,
  name,
  isPinpointDraggable = true,
  hasRoutingOption = false,
  enableClickOnMap = true,
  hasUserLocationBtn = true,
  automaticallyNavigateToCustomLatLng,
}: {
  userLat?: number | undefined;
  userLang?: number | undefined;
  setUserLat?: Dispatch<SetStateAction<number | undefined>>;
  setUserLang?: Dispatch<SetStateAction<number | undefined>>;
  showZoomControl?: boolean;
  readOnly?: boolean;
  mapClassname?: string;
  getUserLocationBtnClassname?: string;
  formik?: any;
  name: string; // for formik to handle values
  isPinpointDraggable?: boolean;
  hasRoutingOption?: boolean;
  enableClickOnMap?: boolean;
  hasUserLocationBtn?: boolean;
  automaticallyNavigateToCustomLatLng?: {
    lat: number | string;
    lng: number | string;
  };
}) => {
  const ICON = icon({
    iconUrl: "/assets/map/pin-point.svg",
    iconSize: [72, 72],
    // shadowUrl: "/icons/Leaflet-Icons/marker-shadow.png",
    // shadowSize: [50, 64], // size of the shadow
  });

  const markerRef = useRef<any>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latAndLang: { lat: number; lng: number } = marker?.getLatLng();

          if (!!setUserLat && !!setUserLang) {
            setUserLat(latAndLang.lat);
            setUserLang(latAndLang.lng);
          }

          if (!!formik) {
            formik?.setFieldValue(name, [latAndLang.lat, latAndLang.lng]);
          }
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function UserLocation() {
    const map = useMap();

    const ref = useRef<HTMLDivElement>(null);

    function onSuccessOfGettingUsersCurrentPosition(geolocationPosition: GeolocationPosition) {
      const { latitude, longitude } = geolocationPosition.coords;

      // EXPERIMENTALLY COMMENTED
      // if (!!setUserLat && !!setUserLang) {
      //   setUserLat(latitude);
      //   setUserLang(longitude);
      // }
      // if (!!formik) {
      //   formik?.setFieldValue(name, [latitude, longitude]);
      // }

      map.setView([latitude, longitude], undefined, {
        animate: true,
      });
    }

    function onFailureOfGettingUsersCurrentPosition(
      geolocationPositionErrorObj: GeolocationPositionError
    ) {
      console.error("Could not fecth user's geolocation position.");
    }

    const moveMapToUsersCurrentPosition = () => {
      window.navigator.geolocation.getCurrentPosition(
        onSuccessOfGettingUsersCurrentPosition,
        onFailureOfGettingUsersCurrentPosition
      );
    };

    useEffect(() => {
      if (ref.current) {
        DomEvent.disableClickPropagation(ref.current);
      }
    }, []);

    return (
      <div
        ref={ref}
        className={`
            w-40 h-40 rounded-full flex items-center justify-center absolute bottom-16 right-16 bg-white z-[2]
            ${getUserLocationBtnClassname || ""}
        `}
        onClick={(e) => {
          // e.stopPropagation();
          moveMapToUsersCurrentPosition();
        }}
      >
        <i className="text-20 text-black icon-CourantLocation" />
      </div>
    );
  }

  function HandleClickOnMap() {
    const map = useMapEvents({
      click: (e) => {
        const { lat, lng } = e?.latlng;

        if (!!setUserLat && !!setUserLang) {
          setUserLat(lat);
          setUserLang(lng);
        }

        if (!!formik) {
          formik?.setFieldValue(name, [lat, lng]);
        }

        map.setView([lat, lng], undefined, {
          animate: true,
        });
      },
    });

    return null;
  }

  function HasRoutingOption() {
    const [latToGo, longToGo] = !!formik ? formik?.values?.[name] : [userLat, userLang];

    return (
      <LinkButton
        href={`google.navigation:q=${latToGo},${longToGo}`}
        leftIcon={<i className="icon-FlashLeft text-24 text-black" />}
        className="!pl-16 !pr-24 !py-10 absolute z-[2] bottom-16 left-16"
        color="white"
      >
        مسیریابی
      </LinkButton>
    );
  }

  /**
   * Recentres the map when the caller points somewhere new.
   *
   * This used to call flyTo() and setState() *during render*, guarded by a
   * boolean that latched after the first flight. Two consequences: the map
   * would never move again however the target changed, so the only way to
   * recentre it was to remount the whole map — and remounting a map with a
   * draggable marker is what throws "Cannot read properties of undefined
   * (reading 'classList')", because Leaflet tears down a marker whose icon
   * React has already removed.
   *
   * An effect keyed on the coordinates does the same job with no latch, no
   * remount, and no writes during render.
   */
  function HandleCustomFlyTo() {
    const map = useMap();
    const lat = Number(automaticallyNavigateToCustomLatLng?.lat);
    const lng = Number(automaticallyNavigateToCustomLatLng?.lng);

    useEffect(() => {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      // A second is enough to read as movement; three felt like waiting.
      map.flyTo([lat, lng], 12, { duration: 1 });
    }, [map, lat, lng]);

    return null;
  }

  function ResizeMap() {
    const map = useMap();

    useEffect(() => {
      map.invalidateSize();
      // setTimeout(() => {
      // }, 300);
    }, [map]);

    return null;
  }

  return (
    <>
      <div className={`relative h-full`}>
        <MapContainer
          center={
            !!formik
              ? formik?.values?.[name].length === 2
                ? formik?.values?.[name]
                : [IRAN_Lat_Long.lat, IRAN_Lat_Long.long]
              : userLat && userLang
              ? [userLat, userLang]
              : [IRAN_Lat_Long.lat, IRAN_Lat_Long.long]
          }
          zoom={(userLat && userLang) || formik?.values?.[name].length === 2 ? 13 : 5}
          scrollWheelZoom={true}
          style={{ height: "100%" }}
          zoomControl={showZoomControl}
          className={mapClassname || ""}
          tap
        >
          {/* <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        /> */}
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
            // Use type assertion to tell TypeScript that the maxAge option is valid
            {...({ maxAge: 7 * 24 * 60 * 60 * 1000 } as any)}
          />
          {/* <TileLayer
          url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
        /> */}
          {/* <TileLayer
              url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              subdomains={["mt0", "mt1", "mt2", "mt3"]}
            /> */}

          {((!!userLat && !!userLang) || formik?.values?.[name].length === 2) && (
            <Marker
              position={!!formik ? formik?.values?.[name] : [userLat, userLang]}
              ref={markerRef}
              icon={ICON}
              draggable={isPinpointDraggable}
              eventHandlers={eventHandlers}
            >
              <Popup>محل دقیق اقامتگاه</Popup>
            </Marker>
          )}

          {!!hasRoutingOption && <HasRoutingOption />}
          {!!hasUserLocationBtn && <UserLocation />}
          {!!enableClickOnMap && <HandleClickOnMap />}
          {!!automaticallyNavigateToCustomLatLng && <HandleCustomFlyTo />}
          <ResizeMap />
        </MapContainer>
      </div>
    </>
  );
};

export default ProjectMap;
