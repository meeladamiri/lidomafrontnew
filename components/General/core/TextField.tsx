import React, { ForwardedRef, forwardRef, useMemo, useState } from "react";
import { checkOneCharIsNumber, toEnDigit } from "utilities/Number_tools";
import dynamic from "next/dynamic";
import Num2persian from "@/utilities/numberToPersianText";
// const Num2persian = dynamic<any>(
//   () => import("@/utilities/numberToPersianText").then((mod) => mod.default) as any,
//   {
//     ssr: true,
//   }
// );

const FieldError = dynamic(() => import("components/General/core/FieldError"), {
  ssr: true,
});

interface ITextField {
  isFullWidth?: boolean;
  onClick?: (input?: any) => void;
  label?: string | JSX.Element;
  label2?: string;
  label2ClassName?: string;
  labelInBorder?: boolean;
  placeholder?: string;
  placeholderClassname?: string;
  customError?: string;
  customValue?: string | number;
  customOnChange?: (newValue: string) => void;
  disabled?: boolean;
  formik?: any;
  name: string;
  fillFrom?: "ltr" | "rtl";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  readonly?: boolean;
  autofocus?: boolean;
  autoComplete?: boolean;
  isPassword?: boolean;
  maxCharsN?: number;
  type?: React.HTMLInputTypeAttribute;
  fieldIsOptional?: boolean;
  inputClassname?: string;
  wrapperClassname?: string;
  subLable?: string;
  labelClassname?: string;
  wordifyNumbers?: boolean;
  noValidationErrorText?: boolean;
  hasPrimaryColorBorderBottom?: boolean;
  inputmode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  applyCommaSeperation?: boolean;
  applyAllDigitsToEnFeature?: boolean;
}

const CustomTextField = forwardRef(function CustomTextField(
  {
    isFullWidth = true,
    onClick,
    label,
    label2,
    label2ClassName,
    labelInBorder = false,
    placeholder,
    placeholderClassname,
    customError,
    customValue,
    customOnChange,
    disabled,
    formik,
    name,
    fillFrom,
    leftIcon,
    rightIcon,
    readonly,
    autofocus,
    autoComplete = true,
    isPassword,
    maxCharsN,
    type = "text",
    fieldIsOptional = false,
    inputClassname,
    wrapperClassname,
    subLable,
    labelClassname,
    wordifyNumbers = false,
    noValidationErrorText = false,
    hasPrimaryColorBorderBottom,
    inputmode = "text",
    applyCommaSeperation,
    applyAllDigitsToEnFeature,
  }: ITextField,
  ref: ForwardedRef<any>
) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  // const [isFocused, setIsFocused] = useState<boolean>(false);

  const fieldErrorMessage: string | null = useMemo(() => {
    if (!!formik && formik.touched[name] && formik.errors[name]) {
      if (typeof formik.errors[name] !== "object") {
        return formik.errors[name];
      } else {
        return formik.errors[name][Object.keys(formik.errors[name])[0]];
      }
    } else if (!!customError) {
      return customError;
    } else {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik, customError]);

  return (
    <>
      <label
        ref={ref}
        onClick={onClick}
        className={`${isFullWidth ? "w-full" : ""}
        ${labelInBorder ? "relative" : ""}`}
      >
        {!!label && (
          <span
            className={`
              text-12 leading-21 text-black font-r mb-8 flex items-center gap-x-4
              ${labelClassname || ""}
              ${
                labelInBorder
                  ? "absolute top-0 -translate-y-1/2 text-gray-959FA7 leading-16 px-4 bg-white z-1 right-20"
                  : ""
              }
            `}
          >
            {label}
            {!!label2 && (
              <span className={`text-10 leading-17 text-black font-r ${label2ClassName || ""}`}>
                {label2}
              </span>
            )}
            {!!fieldIsOptional && <span className="text-[#1C2E4599] text-10">{"(اختیاری)"}</span>}
          </span>
        )}
        {!!subLable && <p className="text-10 leading-17 text-black font-l mb-4">{subLable}</p>}
        <div
          className={`
          w-full py-10 pr-12 pl-16 bg-white
          border-1 border-solid border-gray-C4CAD3 rounded-8
          ${!!disabled ? "opacity-60 cursor-not-allowed" : ""}
          ${fieldErrorMessage ? "!border-error-light" : ""}
          focus-within:!border-black
          flex items-center gap-x-10
          transition-all
          ease-in-out
          ${!!hasPrimaryColorBorderBottom ? "border-b-2 border-solid border-b-primary-main" : ""}
          ${wrapperClassname || ""}
        `}
        >
          {!!rightIcon && <span className="flex items-center shrink-0">{rightIcon}</span>}
          <input
            // dir="ltr"
            dir={fillFrom || (type === "number" || inputmode === "numeric" ? "ltr" : "rtl")}
            className={`
            w-full focus-visible:outline-none
            ${placeholderClassname}
            placeholder:text-12 placeholder:leading-21 placeholder:font-l placeholder:text-[rgba(28,46,69,0.6)]
            text-14 leading-24 font-m text-black
            ${!!disabled ? "cursor-not-allowed" : ""}
            ${
              fillFrom === "rtl"
                ? "text-right"
                : fillFrom === "ltr"
                ? "text-left"
                : type === "number" || inputmode === "numeric"
                ? "text-left"
                : "text-right"
            }
            ${fieldErrorMessage ? "!text-error-light" : ""}
            ${inputClassname || ""}
            ${readonly ? "cursor-pointer" : ""}
          `}
            autoFocus={autofocus}
            autoComplete={isPassword || !autoComplete ? "off" : "on"}
            readOnly={readonly}
            type={!!isPassword ? (!showPassword ? "password" : "text") : type}
            inputMode={inputmode}
            // type={!!isPassword && !showPassword ? "password" : "text"}
            placeholder={placeholder || ""}
            disabled={disabled}
            name={name}
            value={
              !!formik
                ? inputmode === "numeric" || applyCommaSeperation
                  ? Number(formik?.values?.[name])?.toLocaleString("en-US")
                  : formik?.values?.[name]
                : inputmode === "numeric" || applyCommaSeperation
                ? // For not-showing the value when value is 0 or 'Number(customValue)' results into 0;
                  !!customValue
                  ? Number(customValue)?.toLocaleString("en-US")
                  : ""
                : customValue
            }
            onChange={(e) => {
              let enteredValue = e?.target?.value;

              if (
                type === "number" ||
                inputmode === "numeric" ||
                type === "tel" ||
                applyAllDigitsToEnFeature
              ) {
                enteredValue = toEnDigit(enteredValue);
                // remove non-numeric characters from the value
                enteredValue = enteredValue.replace(/\D/g, "");
              }

              if (!!formik) {
                formik?.setFieldValue(
                  name,
                  inputmode === "numeric" || applyCommaSeperation
                    ? enteredValue.split(",").join("")
                    : enteredValue
                );

                if (customOnChange) {
                  customOnChange(
                    inputmode === "numeric" || applyCommaSeperation
                      ? enteredValue.split(",").join("")
                      : enteredValue
                  );
                }
              } else if (customOnChange) {
                customOnChange(
                  inputmode === "numeric" || applyCommaSeperation
                    ? enteredValue.split(",").join("")
                    : enteredValue
                );
              }
            }}
            // onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              if (!!formik && !readonly) {
                formik?.handleBlur(e);
              }
              // setIsFocused(false);
            }}
            onKeyPress={(e) => {
              if (maxCharsN) {
                if (!!formik) {
                  if (formik?.values[name]?.toString()?.length === maxCharsN) {
                    e.preventDefault();
                    // return;
                  }
                } else if (!!customOnChange) {
                  if (customValue?.toString()?.length === maxCharsN) {
                    e.preventDefault();
                    // return;
                  }
                }
              }
              if (type === "number") {
                if (!checkOneCharIsNumber(e.key)) {
                  e.preventDefault();
                }
              }
            }}
          />
          {!!leftIcon && <span className="flex items-center shrink-0">{leftIcon}</span>}
          {!!isPassword && (
            <span
              className={`
                flex items-center shrink-0
                ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
              `}
              onClick={() => {
                if (!disabled) {
                  setShowPassword((prev) => !prev);
                }
              }}
            >
              {!!showPassword ? (
                <i className="icon-Hide text-24 text-black" />
              ) : (
                <i className="icon-See text-24 text-black" />
              )}
            </span>
          )}
        </div>
        {!!wordifyNumbers &&
          (!!formik?.values?.[name] || !!customValue) && ( // for Not showing when number is 0
            <p className="text-10 leading-17 text-black font-l mt-4">
              {!!formik
                ? !!Num2persian && (Num2persian as any)?.(formik?.values?.[name])
                : !!customValue
                ? !!Num2persian && (Num2persian as any)?.(customValue)
                : null}{" "}
              تومان
            </p>
          )}
      </label>

      {!noValidationErrorText && <FieldError errorMessage={fieldErrorMessage} />}
    </>
  );
});

export { CustomTextField as TextField };
