import { vertical_stepper_steps } from "@/constants/Residences/Submit/Vertical_Stepper_Steps";
import Image from "next/image";
import { useRouter } from "next/router";
import { Fragment } from "react";

function VerticalStepper() {
  const { query } = useRouter();

  return (
    <div>
      {vertical_stepper_steps.map((s, idx) => {
        return (
          <Fragment key={`${s}-${idx}`}>
            <div className={`flex items-center gap-x-6 ${idx === 13 ? "mb-0" : "mb-4"}`}>
              <div className="p-2">
                {idx + 1 < Number(query?.step) ? (
                  // passed step
                  <span className="w-16 h-16 rounded-full bg-primary-main flex items-center justify-center">
                    <Image src={"/assets/tick.svg"} width={8} height={6} alt="" />
                  </span>
                ) : idx + 1 === Number(query?.step) ? (
                  // current step
                  <span className="w-16 h-16 block rounded-full bg-white border-solid border-primary-main border-2"></span>
                ) : (
                  // future steps
                  <span className="w-16 h-16 block rounded-full bg-white border-solid border-primary-light border-2"></span>
                )}
              </div>

              <span
                className={`
                    text-14 leading-20
                    ${
                      idx + 1 === Number(query?.step)
                        ? "font-m text-black"
                        : "font-r text-gray-959FA7"
                    }
                `}
              >
                {s}
              </span>
            </div>

            <span
              className={`
                h-20 last:hidden inline-block border-l-2
                border-solid pr-8 rounded-2
                ${
                  idx + 1 < Number(query?.step) ? "border-l-primary-main" : "border-l-primary-light"
                }
              `}
            ></span>
          </Fragment>
        );
      })}
    </div>
  );
}
export default VerticalStepper;
