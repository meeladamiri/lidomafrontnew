import { ChangeEvent, useRef } from "react";

interface ISwitch {
  name: string;
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  label?: string | JSX.Element;
  labelClassnames?: string;
  inputClassnames?: string;
  wrapperClassnames?: string;
  formik?: any;
}

const CustomSwitch = ({
  checked,
  onChange,
  disabled,
  label,
  labelClassnames,
  inputClassnames,
  name,
  wrapperClassnames,
  formik,
}: ISwitch) => {
  // const inactiveBg = "bg-[linear-gradient(0deg,rgba(25,59,103,0.05),rgba(25,59,103,0.05))]";
  const inputRef = useRef(null);
  // console.log("Switch formik ", formik.values[name]);

  return (
    <div
      className={`
        flex items-center gap-x-8
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        ${wrapperClassnames || ""}
      `}
    >
      {label && (
        <div className={`text-14 leading-24 text-black font-r ${labelClassnames || ""}`}>
          {label}
        </div>
      )}
      <div
        className={`relative w-40 h-24 rounded-50 transition-all ${
          (!!formik && !!formik.values?.[name]) || !!checked
            ? inputClassnames || "bg-primary-main"
            : "bg-gradient-to-b from-[rgba(25,59,103,0.05)] to-[rgba(25,59,103,0.05)] bg-white"
        }`}
        onClick={(e) => {
          if (!disabled) {
            (inputRef?.current as any)?.click?.();
            // onChange(e);
          }
        }}
      >
        <input
          name={name}
          type="checkbox"
          id="toggleB"
          // disabled={disabled}
          // className="sr-only"
          checked={!!formik ? !!formik?.values?.[name] : checked}
          onChange={(e) => {
            if (!!formik) {
              formik.setFieldValue(name, e.target.checked);
            } else if (!!onChange) {
              onChange(e);
            }
          }}
          hidden
          ref={inputRef}
          // style={{ display: "none" }}
        />
        <div
          className={`
            absolute w-20 h-20 bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.16)] rounded-full top-2
            ${(!!formik && !!formik.values?.[name]) || !!checked ? "right-2" : "left-2"}
          `}
        ></div>
      </div>
    </div>
  );
};

export { CustomSwitch as Switch };
