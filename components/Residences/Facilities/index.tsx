import FacilityDetailsBottomSheet, {
  IShowFacilityDetails,
} from "@/components/ObserveResidenceDetails/ResCompleteInfo/ResFacilities/FacilityDetailsBottomSheet";
import FacilityItem from "@/components/ObserveResidenceDetails/ResCompleteInfo/ResFacilities/FacilityItem";
import BottomSheet, { THandleSmoothClose } from "components/General/core/BottomSheet";
import ModalHeader from "components/General/core/ModalHeader";
import { useRouter } from "next/router";
import { useState } from "react";

interface IRuleItem {
  icon: JSX.Element;
  name: string;
}

const RuleItem = ({ icon, name }: IRuleItem) => {
  return (
    <div className="flex items-start gap-x-12 mb-16 last:mb-0">
      <div className="flex items-center">{icon}</div>
      <p className="text-14 leading-30 text-zilgara font-r">{name}</p>
    </div>
  );
};

const residenceFacilities = [
  {
    title: "آرایشی بهداشتی",
    items: [
      {
        name: "تحویل 24 ساعته",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: true,
        data: [],
      },
      {
        name: "سرایدار/نگهبان",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: false,
        data: [],
      },
      {
        name: "اتاق و اسباب ورزش",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: true,
        data: [],
      },
      {
        name: "حمام",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: false,
        data: [],
      },
    ],
  },
  {
    title: "لوازم خانگی",
    items: [
      {
        name: "تحویل 24 ساعته",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: true,
        data: [],
      },
      {
        name: "سرایدار/نگهبان",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: false,
        data: [],
      },
    ],
  },
  {
    title: "پارکینگ",
    items: [
      {
        name: "تحویل 24 ساعته",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: true,
        data: [],
      },
      {
        name: "سرایدار/نگهبان",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: false,
        data: [],
      },
    ],
  },
  {
    title: "سرویس های بهداشتی",
    items: [
      {
        name: "تحویل 24 ساعته",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: true,
        data: [],
      },
      {
        name: "سرایدار/نگهبان",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: false,
        data: [],
      },
    ],
  },
  {
    title: "وسایل آشپزخانه",
    items: [
      {
        name: "تحویل 24 ساعته",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: true,
        data: [],
      },
      {
        name: "سرایدار/نگهبان",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: false,
        data: [],
      },
    ],
  },
  {
    title: "اینترنت",
    items: [
      {
        name: "تحویل 24 ساعته",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: true,
        data: [],
      },
      {
        name: "سرایدار/نگهبان",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: false,
        data: [],
      },
    ],
  },
  {
    title: "لوازم خواب",
    items: [
      {
        name: "تحویل 24 ساعته",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: true,
        data: [],
      },
      {
        name: "سرایدار/نگهبان",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: false,
        data: [],
      },
    ],
  },
  {
    title: "امنیت ساختمان",
    items: [
      {
        name: "تحویل 24 ساعته",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: true,
        data: [],
      },
      {
        name: "سرایدار/نگهبان",
        icon: <i className="icon-Home text-18 text-black" />,
        hasDetails: false,
        data: [],
      },
    ],
  },
];

const facilityDetailsInitialValues = {
  show: false,
  payload: {
    title: "",
    description: "",
    data: [],
  },
};

function ResidenceFacilities() {
  const router = useRouter();

  const [showFacilityDetailsBottomSheet, setShowFacilityDetailsBottomSheet] =
    useState<IShowFacilityDetails>(facilityDetailsInitialValues);

  return (
    <>
      <div className="pb-48">
        <div className="mb-16">
          <ModalHeader headerTitle={"مشاهده همه امکانات"} onBackClick={() => router.back()} />
        </div>

        <div className="px-20">
          <div>
            {residenceFacilities.map((f, index) => (
              <div key={index} className="mb-28 last:mb-0">
                <p className="text-16 leading-28 text-zilgara font-r mb-24">{f.title}</p>

                <div>
                  {f.items.map((fItem, i) => (
                    <div
                      className="py-12 border-b-1 border-solid border-b-gray-DBDFE5 last:border-b-none"
                      key={i}
                    >
                      <FacilityItem
                        name={fItem.name}
                        icon={fItem.icon}
                        hasDetails={fItem.hasDetails}
                        setShowFacilityDetailsBottomSheet={setShowFacilityDetailsBottomSheet}
                        data={fItem.data}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomSheet
        open={!!showFacilityDetailsBottomSheet.show}
        handleClose={() => setShowFacilityDetailsBottomSheet(facilityDetailsInitialValues)}
        headerTitle={showFacilityDetailsBottomSheet.payload.title}
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <FacilityDetailsBottomSheet
              handleSmoothClose={handleSmoothClose}
              payload={showFacilityDetailsBottomSheet.payload}
            />
          );
        }}
      />
    </>
  );
}

export default ResidenceFacilities;
