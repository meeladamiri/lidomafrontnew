import PageTitle from "@/components/General/PageTitle";
import { Dispatch, SetStateAction } from "react";

const Ratings = [
  {
    name: "مهم نیست",
    value: "-1",
  },
  {
    name: "3 تا 4  ",
    value: "3-4",
  },

  {
    name: "4 تا 5",
    value: "4-5",
  },
];

function ResidenceAverageRating({
  tmpAverageRating,
  setTmpAverageRating,
}: {
  tmpAverageRating:
    | {
        name: string;
        value: string;
      }
    | undefined;
  setTmpAverageRating: Dispatch<
    SetStateAction<
      | {
          name: string;
          value: string;
        }
      | undefined
    >
  >;
}) {
  return (
    <>
      <PageTitle
        title="میانگین امتیاز اقامتگاه"
        icon={<i className="icon-Star text-24" />}
        containerClassname="mb-16"
      />

      <div className="flex items-center gap-x-12 overflow-x-auto hideScrollbar">
        {Ratings.map((rating, idx: number) => {
          return (
            <div
              className={`
                py-4 px-16 text-14 leading-24 font-r border-1 border-solid rounded-full cursor-pointer shrink-0
                ${
                  tmpAverageRating?.value === rating.value ||
                  (rating.value === "-1" && !tmpAverageRating)
                    ? "bg-black text-white border-black"
                    : "text-black bg-white border-gray-CACFD3"
                }
            `}
              key={idx}
              onClick={() => {
                if (rating.value === "-1") {
                  setTmpAverageRating(undefined);
                } else {
                  setTmpAverageRating({ name: rating.name, value: rating.value });
                }
              }}
            >
              {rating.name}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default ResidenceAverageRating;
