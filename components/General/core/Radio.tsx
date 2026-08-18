import { ChangeEvent } from "react";

type IRadio_Color = "primary" | "blue";

interface IRadio {
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  label?: string;
  // selected?: boolean;
  // isError?: boolean;
  inputClassnames?: string;
  wrapperClassnames?: string;
  lableClassnames?: string;
  look: "selected" | "checked" | "isError";
  value: string;
  formik?: any;
  name: string;
  color?: IRadio_Color;
}

const getStyles = (state: "selected" | "checked" | "isError", color: IRadio_Color) => {
  if (state === "selected") {
    return `
              checked:after:border-5
              ${
                color === "primary"
                  ? "checked:after:border-primary-main"
                  : "checked:after:border-blue-main"
              }
              checked:after:border-solid
          `;
  } else if (state === "checked") {
    return `checked:after:bg-[url("/assets/tick.svg")] checked:after:bg-[length:9px_7px] checked:after:bg-primary-main checked:after:bg-no-repeat checked:after:bg-center checked:after:border-none checked:after:text-white checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-12`;
  } else if (state === "isError") {
    return `checked:after:bg-error-light checked:after:border-none checked:after:bg-[url("/assets/x-icon.svg")] checked:after:bg-no-repeat checked:after:bg-center checked:after:bg-[length:12px_12px]`;
  } else {
    return "";
  }
};

const CustomRadio = ({
  onChange,
  checked,
  look = "checked",
  disabled,
  label,
  inputClassnames,
  wrapperClassnames,
  lableClassnames,
  value,
  formik,
  name,
  color = "primary",
}: IRadio) => {
  return (
    <label
      className={` 
        flex relative items-center gap-x-8 cursor-pointer
        ${wrapperClassnames || ""}
        min-h-[24px]
      `}
    >
      <input
        className={`
          w-0 h-0 shrink-0
          after:absolute after:top-0 after:right-0 after:translate-y-[2px] after:w-20 after:h-20 after:content-[''] after:inline-block after:rounded-50 after:bg-white after:border-2 after:border-solid after:border-gray-E1E1E5 after:shadow-none after:cursor-pointer
          ${inputClassnames} ${getStyles(look, color)}
        `}
        value={value}
        checked={checked}
        onChange={(e) => {
          if (!disabled) {
            if (!!formik) {
              formik.setFieldValue(name, value);
            }
            if (!!onChange) onChange(e);
          }
        }}
        type="radio"
        name={name}
        disabled={disabled}
      />
      {!!label && (
        <span
          className={`text-14 leading-24 font-r text-black break-all pr-20 ${
            lableClassnames || ""
          }`}
        >
          {label}
        </span>
      )}
    </label>
  );
};

export { CustomRadio as Radio };
