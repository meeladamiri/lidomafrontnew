import { TextField } from "../core/TextField";

function Counter({
  inputReadonly = true,
  inputName,
  formik,
  // counterMinimum = 0,
  counterMinimum,
  counterMaximum,
  onInc,
  onDec,
  customValue,
}: {
  inputReadonly?: boolean;
  inputName: string;
  formik?: any;
  counterMinimum?: number;
  counterMaximum?: number;
  onInc?: () => void;
  onDec?: () => void;
  customValue?: number;
}) {
  return (
    <div className="w-full flex items-center">
      <div
        className={`
          w-32 h-32 cursor-pointer rounded-8
          flex items-center justify-center
          shrink-0 grow-0
          border-1 border-solid border-black
          ${
            ((!!counterMaximum || counterMaximum === 0) &&
              Number(formik?.values?.[inputName]) === counterMaximum) ||
            ((!!counterMaximum || counterMaximum === 0) && Number(customValue) === counterMaximum)
              ? "opacity-30 cursor-not-allowed pointer-events-none"
              : ""
          }
        `}
        onClick={() => {
          if (!!formik) {
            if (
              (!!counterMaximum || counterMaximum === 0) &&
              Number(formik?.values?.[inputName]) === counterMaximum
            ) {
              return;
            }

            formik?.setFieldValue(
              inputName,
              Number(
                formik?.values?.[inputName] // must be a number actually
              ) + 1
            );
          } else if (!!onInc) {
            if (
              (!!counterMaximum || counterMaximum === 0) &&
              Number(customValue) === counterMaximum
            ) {
              return;
            }
            onInc();
          }
        }}
      >
        <i className="icon-Plus text-24 text-black" />
      </div>

      <TextField
        name={inputName}
        // inputmode="numeric"
        wrapperClassname="!p-0 !border-none !bg-transparent"
        inputClassname="!text-center !bg-transparent"
        readonly={inputReadonly}
        {...(!!formik
          ? { formik }
          : {
              customValue: customValue,
              // customOnChange: (e) => {
              //   if (on) {
              //     setCounterState(e.target.valueAsNumber);
              //   }
              // },
            })}
        // customValue
        // customOnChange
      />

      <div
        className={`
          w-32 h-32 cursor-pointer rounded-8 flex items-center justify-center
          shrink-0 grow-0 border-1 border-solid border-black
          ${customValue === counterMinimum ? "opacity-30" : ""}
        `}
        onClick={() => {
          if (!!formik) {
            if (
              (!!counterMinimum || counterMinimum === 0) &&
              Number(formik?.values?.[inputName]) - 1 < counterMinimum
            )
              return;
            formik?.setFieldValue(
              inputName,
              Number(
                formik?.values?.[inputName] // must be a number actually
              ) - 1
            );
          } else if (!!onDec) {
            if (
              (!!counterMinimum || counterMinimum === 0) &&
              Number(customValue) - 1 < counterMinimum
            )
              return;
            onDec();
          }
        }}
      >
        <i className="icon-Negative text-24 text-black" />
      </div>
    </div>
  );
}

export default Counter;
