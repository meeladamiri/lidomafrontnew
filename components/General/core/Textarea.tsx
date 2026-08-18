import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef } from "react";
const FieldError = dynamic(() => import("components/General/core/FieldError"), {
  ssr: true,
});

interface ITextarea {
  label?: string;
  placeholder?: string;
  customError?: string;
  customValue?: string;
  customOnChange?: (newValue: string) => void;
  disabled?: boolean;
  formik?: any;
  name: string;
  fillFrom?: "ltr" | "rtl";
  readonly?: boolean;
  maxCharsN?: number;
  cols?: number;
  autoComplete?: "on" | "off";
  rows?: number;
  autoFocus?: boolean;
  labelClassname?: string;
  styles?: React.CSSProperties;
  textareaClassnames?: string;
  subLable?: string;
  autoResize?: boolean;
}

function CustomTextarea({
  label,
  placeholder,
  customError,
  customValue,
  customOnChange,
  disabled,
  formik,
  name,
  fillFrom = "rtl",
  readonly,
  maxCharsN,
  autoComplete,
  rows = 3,
  cols,
  autoFocus,
  labelClassname,
  styles,
  textareaClassnames,
  subLable,
  autoResize,
}: ITextarea) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (!!autoResize) {
      if (!!textareaRef.current) {
        textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
      }
    }
  }, [autoResize]);

  return (
    <>
      <label className="w-full">
        {!!label && (
          <span
            className={`text-12 leading-21 text-black font-r mb-8 block ${labelClassname || ""}`}
          >
            {label}
          </span>
        )}
        {!!subLable && <p className="text-10 leading-17 text-black font-l mb-4">{subLable}</p>}
        <div>
          <textarea
            ref={textareaRef}
            className={`
            w-full bg-white focus-visible:outline-none
            placeholder:text-12 placeholder:leading-21 placeholder:font-l placeholder:text-[rgba(28,46,69,0.6)]
            text-14 leading-24 font-m text-black
            py-10 pr-12 pl-16
            border-1 border-solid border-gray-C4CAD3 rounded-8
            focus-within:!border-black
            ${!!disabled ? "cursor-not-allowed" : ""}
            ${fillFrom === "ltr" ? "text-left" : fillFrom === "rtl" ? "text-right" : ""}
            ${fieldErrorMessage ? "!text-error-light" : ""}
            ${!!disabled ? "opacity-60 cursor-not-allowed" : ""}
            ${fieldErrorMessage ? "!border-error-light" : ""}
            ${textareaClassnames || ""}
          `}
            rows={rows}
            cols={cols}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            readOnly={readonly}
            placeholder={placeholder || ""}
            disabled={disabled}
            name={name}
            value={formik?.values[name] || customValue || ""}
            onChange={(e) => {
              if (!!formik) {
                formik?.handleChange(e);
                if (!!customOnChange) {
                  customOnChange(e.target.value);
                }
              } else if (!!customOnChange) {
                customOnChange(e.target.value);
              }

              if (!!autoResize) {
                if (textareaRef.current) {
                  textareaRef.current.style.height = e.target.scrollHeight + "px";
                }
              }
            }}
            onBlur={(e) => {
              if (!!formik && !readonly) {
                formik?.handleBlur(e);
              }
            }}
            onKeyPress={(e) => {
              if (maxCharsN) {
                if (!!formik) {
                  if (formik?.values[name]?.length === maxCharsN) {
                    e.preventDefault();
                    // return;
                  }
                } else if (!!customOnChange) {
                  if (customValue?.length === maxCharsN) {
                    e.preventDefault();
                    // return;
                  }
                }
              }
            }}
            style={styles}
          />
        </div>
      </label>

      {!!fieldErrorMessage && <FieldError errorMessage={fieldErrorMessage} />}
    </>
  );
}

export { CustomTextarea as Textarea };
