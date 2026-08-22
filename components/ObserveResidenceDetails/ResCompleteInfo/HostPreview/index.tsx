import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import Image from "next/image";

function HostPreview() {
  const { data } = useGetObserveResidence();
  const host_image = data?.params?.residence_info?.host?.image_url;
  const host_name = data?.params?.residence_info?.host?.name;

  return (
    <>
      <section className="flex items-center gap-x-10 md:mb-20 py-20 md:py-0 md:border-none border-t border-gray-E5E5E6">
        <figure
          className="w-48 h-48 relative shrink-0 cursor-pointer"
          onClick={() => {
            const hostInfographySection = document.querySelector("#Host_Infographianno");
            hostInfographySection?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        >
          <Image
            src={host_image || "/assets/default-profile.svg"}
            alt={host_name}
            className="rounded-full"
            fill
            style={{
              objectFit: "cover",
            }}
          />
        </figure>
        <div className="flex flex-col gap-y-10">
          <header>
            <h2 className="text-12 leading-14 text-gray-3D3D40 font-r">
              {`${data?.params?.residence_info?.residence_type} به میزبانی: `}
            </h2>
          </header>
          <p className="text-14 leading-18 text-black font-r">{host_name}</p>
        </div>
      </section>
    </>
  );
}

export default HostPreview;
