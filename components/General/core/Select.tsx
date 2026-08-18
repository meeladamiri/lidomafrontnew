import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import OutsideClickHandler from "utilities/OutsideClickHandler";
const FieldError = dynamic(() => import("components/General/core/FieldError"), {
  ssr: true,
});

// const people = [
//   { id: 1, name: "Wade Cooper" },
//   { id: 2, name: "Arlene Mccoy" },
//   { id: 3, name: "Devon Webb" },
//   { id: 4, name: "Tom Cook" },
//   { id: 5, name: "Tanya Fox" },
//   { id: 6, name: "Hellen Schmidt" },
// ];

const people = [{ id: 1, name: "" }];

// type TObjectItem = { id?: string | number; name: string | number };
type TObjectItem = string | number | { id?: string | number; name: string | number };
interface ISelect {
  name: string;
  placeholder?: string;
  labelText?: string;
  formik?: any;
  disabled?: boolean;
  value?: any;
  data?: Array<TObjectItem>;
  keyValue?: string;
  keyLabel?: string;
  onClick?: () => void;
  readOnly?: boolean;
  onChange?: (input: any) => void;
  customError?: string;
  filterBySearch?: boolean;
}

const CustomSelect = ({
  formik,
  value,
  placeholder,
  data = people,
  keyValue,
  keyLabel = "",
  onClick,
  name,
  labelText,
  disabled,
  readOnly = false,
  onChange,
  customError,
  filterBySearch = true,
}: ISelect) => {
  const [open, setOpen] = useState(false);
  const [changed, setChnanged] = useState(1);
  const [tempValue, setTempValue] = useState();
  const [searchText, setSearchText] = useState<string>();

  const getData = () => {
    if (!filterBySearch) return data;
    if (searchText) {
      let temp = data.filter(function (str: any) {
        return !!keyValue
          ? str[keyValue].toString().includes(searchText.toString())
          : str.toString().includes(searchText.toString());
      });

      return temp;
    } else {
      return data;
    }
  };

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
  }, [JSON.stringify(formik?.errors), customError]);

  useEffect(() => {
    setTempValue(value || undefined);
  }, [value]);

  useEffect(() => {
    if (changed !== 1) {
      setOpen(false);
      if (onClick) {
        onClick();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changed]);

  // console.log("fieldErrorMessage", fieldErrorMessage);

  return (
    <OutsideClickHandler
      handleClick={() => setOpen(false)}
      //  exceptionElementsRef={[]}
    >
      <>
        <div id={name} key={tempValue && (keyValue ? tempValue[keyValue] : tempValue)}>
          {labelText && (
            <label htmlFor={name} className="mb-8 flex w-full text-12 leading-21 font-r text-black">
              {labelText}
            </label>
          )}
          <div className="relative">
            <div
              className={`${
                !!formik && formik.touched[name] && formik.errors[name]
                  ? "border-error-light"
                  : "border-[rgba(28,52,84,0.26)]"
              }  flex items-center justify-between rounded-6 border-1 border-solid bg-white px-12 py-8`}
              style={
                open
                  ? {
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    }
                  : {}
              }
              onClick={() => {
                if (data && !disabled && !readOnly) {
                  setOpen(true);
                }
              }}
            >
              <input
                autoComplete={"off"}
                disabled={disabled}
                name={name}
                value={
                  !!keyValue
                    ? !!formik
                      ? formik?.values[name]?.[keyValue]
                      : value?.[keyValue]
                    : !!formik
                    ? formik?.values[name]
                    : value
                }
                onChange={(e) => {
                  if (!!filterBySearch) {
                    formik?.handleChange(e);
                    setSearchText(e.target.value);
                    // console.log("e.target.value is", e.target.value);
                    if (onChange) {
                      onChange(!!keyValue ? { [keyValue]: e.target.value } : e.target.value);
                    }
                  }
                }}
                onBlur={(e) => {
                  if (!!formik && !readOnly) {
                    formik?.handleBlur(e);
                  }
                }}
                className={`w-full flex-1 border-none bg-transparent text-14 text-black font-r placeholder:text-14 placeholder:leading-24 placeholder:text-black placeholder:font-r focus:border-none focus:outline-none ${
                  disabled ? "opacity-30" : ""
                }`}
                placeholder={placeholder}
                readOnly={readOnly}
              />
              <i
                // onClick={() => setOpen((prev) => false)}
                className={`${open ? "rotate-180" : ""} ${
                  disabled ? "opacity-30" : ""
                } icon-FlashDown cursor-pointer text-24 text-gray-292D32`}
              />
            </div>
            {open && (
              <div className="relative mx-auto w-[96%]">
                <hr className="absolute" />
              </div>
            )}

            {open && data && (
              <div className="border-top-none border-bottom-none absolute top-[39px] z-[101] flex h-[152px] w-full flex-row flex-wrap overflow-y-auto rounded-b-5 border border-gray-E8E8E8  bg-white px-[18px] pt-8">
                <div className={`${"basis-full"}  ${""} border-l-gray-E8E8E8`}>
                  {getData()
                    // ?.slice(0, getData()?.length)
                    ?.map((el: any, i) => {
                      return (
                        <>
                          <div
                            key={i}
                            className=" cursor-pointer py-6"
                            onClick={async () => {
                              // console.log("el is", el);
                              setOpen(false);
                              formik?.setFieldValue(name, !!el?.[name] ? el?.[name] : el);
                              if (onChange) {
                                onChange(!!el?.[name] ? el?.[name] : el);
                              }
                            }}
                          >
                            <p
                              className={`text-right text-14 ${
                                (
                                  keyValue && value
                                    ? value[keyValue] === el[keyValue]
                                    : value === el
                                )
                                  ? "text-primary-main"
                                  : "text-gray-888888"
                              } `}
                            >
                              {keyValue ? el[keyValue] : el} {keyLabel}
                            </p>
                          </div>
                        </>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {!!fieldErrorMessage && <FieldError errorMessage={fieldErrorMessage} />}
      </>
    </OutsideClickHandler>
  );
};

export { CustomSelect as Select };
