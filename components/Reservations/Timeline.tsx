import { Radio } from "components/General/core/Radio";
import { ReserveStates_enum } from "constants/enums/reserve_states";
import moment from "moment-jalaali";

const RESERVE_STEPS: string[] = ["درخواست", "بررسی", "پرداخت", "تحویل"];

function Timeline({
  state,
  tempState,
  startDate,
  endDate,
}: {
  state: ReserveStates_enum;
  tempState?:
    | ReserveStates_enum.HOST_APPROVAL
    | ReserveStates_enum.SECOND_PAYMENT
    | ReserveStates_enum.DONE; // TODO: backend bayad ino include kone
  startDate: string;
  endDate: string;
}) {
  return (
    <div>
      <div className="pr-[44px] pl-[48px] flex items-center justify-between">
        <Radio
          name="request-step"
          value={"1"}
          disabled={true}
          //
          checked={true}
          look={"checked"}
        />

        <div
          className={`
                border-b-1 grow
                ${
                  state === ReserveStates_enum.HOST_APPROVAL
                    ? "border-dashed border-primary-main"
                    : (state === ReserveStates_enum.CANCEL ||
                        state === ReserveStates_enum.EXPIRED) &&
                      tempState === ReserveStates_enum.HOST_APPROVAL
                    ? "border-dashed border-error-light"
                    : "border-solid border-primary-main"
                }
            `}
        />

        <Radio
          name="host-approval-step"
          value={"2"}
          disabled={true}
          //
          checked={true}
          look={
            state === ReserveStates_enum.HOST_APPROVAL
              ? "selected"
              : (state === ReserveStates_enum.CANCEL || state === ReserveStates_enum.EXPIRED) &&
                tempState === ReserveStates_enum.HOST_APPROVAL
              ? "isError"
              : "checked"
          }
        />

        <div
          className={`
                border-b-1 grow
                ${
                  state === ReserveStates_enum.SECOND_PAYMENT
                    ? "border-dashed border-primary-main"
                    : state === ReserveStates_enum.DONE
                    ? "border-solid border-primary-main"
                    : (ReserveStates_enum.CANCEL || ReserveStates_enum.EXPIRED) &&
                      tempState === ReserveStates_enum.SECOND_PAYMENT
                    ? "border-dashed border-error-light"
                    : "border-dashed border-[rgba(28,46,69,0.6)]"
                }
            `}
        />

        <Radio
          name="second-payment-step"
          value={"3"}
          disabled={true}
          //
          checked={
            state === ReserveStates_enum.SECOND_PAYMENT ||
            state === ReserveStates_enum.DONE ||
            ((state === ReserveStates_enum.CANCEL || state === ReserveStates_enum.EXPIRED) &&
              tempState === ReserveStates_enum.SECOND_PAYMENT)
          }
          look={
            state === ReserveStates_enum.SECOND_PAYMENT
              ? "selected"
              : state === ReserveStates_enum.DONE
              ? "checked"
              : // ((ReserveStates_enum.CANCEL || ReserveStates_enum.EXPIRED) && tempState === ReserveStates_enum.SECOND_PAYMENT)
                "isError"
          }
        />

        <div
          className={`
                border-b-1 grow
                ${
                  state === ReserveStates_enum.DONE
                    ? new (moment as any)().isBefore(new (moment as any)(startDate))
                      ? // the residence is not yet delivered
                        "border-dashed border-primary-main"
                      : "border-solid border-primary-main"
                    : (state === ReserveStates_enum.CANCEL ||
                        state === ReserveStates_enum.EXPIRED) &&
                      tempState === ReserveStates_enum.DONE
                    ? "border-dashed border-error-light"
                    : "border-dashed border-[rgba(28,46,69,0.6)]"
                }
            `}
        />

        <Radio
          name="done-step"
          value={"4"}
          disabled={true}
          //
          checked={
            state === ReserveStates_enum.DONE ||
            ((state === ReserveStates_enum.CANCEL || state === ReserveStates_enum.EXPIRED) &&
              tempState === ReserveStates_enum.DONE) // TODO: tebge figam reserve mitune dar state == "done" cancel beshe. hala bayad backend in mored ro dar nazar begire.
          }
          look={
            state === ReserveStates_enum.DONE
              ? new (moment as any)().isBefore(new (moment as any)(startDate))
                ? // the residence is not yet delivered
                  "selected"
                : "checked"
              : // ((state === ReserveStates_enum.CANCEL || state === ReserveStates_enum.EXPIRED) && tempState === ReserveStates_enum.DONE)
                "isError"
          }
        />
      </div>

      <div className="pr-[21px] pl-[19px] flex items-center justify-between mt-10">
        {RESERVE_STEPS.map((step, idx: number) => {
          return <span key={idx}>{step}</span>;
        })}
      </div>
    </div>
  );
}

export default Timeline;
