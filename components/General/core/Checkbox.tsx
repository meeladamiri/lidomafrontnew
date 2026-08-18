import { ChangeEvent } from "react";

interface ICheckbox {
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  subLabel?: string | JSX.Element;
  className?: string;
  inputClassnames?: string;
  wrapperClassnames?: string;
  lableClassnames?: string;
}

function CustomCheckbox({
  onChange,
  checked,
  label,
  readOnly,
  inputClassnames,
  wrapperClassnames,
  lableClassnames,
  subLabel,
}: ICheckbox) {
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
            after:absolute after:top-0 after:right-0 after:translate-y-[2px] after:w-20 after:h-20 after:content-[''] after:inline-block after:rounded-3 after:bg-white after:border-1 after:border-solid after:border-[rgba(28,46,69,0.6)] after:shadow-none after:cursor-pointer
            checked:after:bg-[url("/assets/tick.svg")] checked:after:bg-[length:9px_7px] checked:after:bg-primary-main checked:after:bg-no-repeat checked:after:bg-center checked:after:border-none checked:after:text-white checked:after:flex checked:after:items-center checked:after:justify-center checked:after:text-12
            ${inputClassnames || ""}
          `}
        checked={checked}
        onChange={onChange}
        type="checkbox"
        name={label}
        readOnly={readOnly}
      />

      {!!subLabel && (
        <span className={`text-10 leading-17 text-black font-l break-all pr-24`}>{subLabel}</span>
      )}

      <span
        className={`
            text-14 leading-24 font-r text-black break-all
            ${!!subLabel ? "pr-8" : "pr-20"}
            ${lableClassnames || ""}
        `}
      >
        {label}
      </span>
    </label>
  );
}

export { CustomCheckbox as Checkbox };
