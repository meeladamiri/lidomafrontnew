// import dynamic from "next/dynamic";
import Link from "next/link";
import React, { ForwardedRef, forwardRef } from "react";
import ButtonLoader from "./ButtonLoader";
// const ButtonLoader = dynamic(() => import("./ButtonLoader"), {
//   ssr: true,
// });

export interface ICustomButton {
  variant?: "contained" | "outlined" | "text";
  children: React.ReactNode | string;
  className?: string;
  color?:
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "black"
    | "grey"
    | "white"
    | "dark-blue"
    | "light-blue"
    | "light-error"
    | "tertiary";
  onClick?: (input?: any) => void; // TODO: onClick is a function
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullHeight?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  rounded?: boolean;
  customBorderClassname?: string;
  isLoading?: boolean;
  loadingText?: string;
  loadingTextClassName?: string;
  styles?: React.CSSProperties;
  rightIconWrapper?: string;
  leftIconWrapper?: string;
}

const CustomButton = forwardRef(function CustomButton(
  {
    variant = "contained",
    disabled,
    children,
    className,
    color = "primary",
    onClick,
    isFullWidth,
    leftIcon,
    rightIcon,
    rightIconWrapper,
    leftIconWrapper,
    fullHeight,
    type,
    customBorderClassname,
    rounded,
    styles,
    isLoading,
    loadingText,
    loadingTextClassName,
    ...props // like type, ...
  }: ICustomButton,
  ref: ForwardedRef<any>
) {
  // Backgrounds Start
  const primaryBg = "bg-gradient-to-b from-[#00E0C4] to-[#00D1B7]";
  const defaultBg = primaryBg;
  const secondaryBg = "bg-gradient-to-b from-[#FFC120] to-[#FCAC12]";
  const errorBg = variant === "contained" ? "bg-error-light" : "bg-transparent";
  const warningBg = variant === "outlined" ? "bg-transparent" : "bg-warning";
  const blackBg =
    variant === "contained"
      ? "bg-gradient-to-b from-[#4E5D71] to-[#18273A]"
      : variant === "outlined"
      ? "bg-transparent"
      : // in fallback shayad avaz she (shayad -- vali fikr elamiram)
        "bg-transparent";
  const greyBg =
    variant === "contained"
      ? "bg-gradient-to-b from-[rgba(25,59,103,0.05)] to-[rgba(25,59,103,0.05)]"
      : "bg-transparent";
  const whiteBg = variant === "contained" || "outlined" ? "bg-white" : "bg-transparent";
  const lightBlueBg = variant === "contained" ? "bg-blue-light" : "bg-transparent";
  const darkBlueBg = variant === "contained" ? "bg-blue-dark" : "bg-transparent";
  const lightErrorBg = variant === "contained" ? "bg-red-light" : "bg-transparent";
  const tertiaryBg = variant === "contained" ? "bg-tertiary" : "bg-transparent";

  const bgColorsMap = {
    primary: primaryBg,
    secondary: secondaryBg,
    error: errorBg,
    warning: warningBg,
    black: blackBg,
    grey: greyBg,
    white: whiteBg,
    "light-blue": lightBlueBg,
    "dark-blue": darkBlueBg,
    "light-error": lightErrorBg,
    tertiary: tertiaryBg,
  };
  // Backgrounds End

  // Hovers Start
  const hoverMap = {
    primary: "hover:bg-primary-dark",
    secondary: "",
    error:
      variant === "contained"
        ? "hover:!bg-white hover:!text-error-light"
        : "hover:!text-white hover:!bg-error-light",
    warning: "",
    black:
      variant === "contained"
        ? ""
        : variant === "outlined"
        ? ""
        : // in fallback shayad avaz she (shayad -- vali fikr elamiram)
          "",
    grey: "",
    "light-blue": "",
  };
  // Hovers End

  // TextColors Start
  const defaultTextColor = "text-white";

  const textColorMap = {
    primary: "text-white",
    secondary: "text-white",
    error: variant === "contained" ? "text-white" : "text-error-light",
    warning: variant === "contained" ? "text-white" : "text-warning",
    black:
      variant === "contained"
        ? "text-white"
        : variant === "outlined"
        ? "text-black"
        : // in fallback shayad avaz she (shayad -- vali fikr elamiram)
          "text-black",
    grey: "text-black",
    white: variant === "text" ? "text-white" : "text-black",
    "dark-blue": variant === "contained" ? "text-white" : "text-blue-dark",
    "light-blue": "text-info",
    "light-error": "text-error-light",
    tertiary: "text-white",
  };
  // TextColors End

  // Border Start
  const primaryBorder = variant === "outlined" ? "border-1 border-solid border-primary-main" : "";
  const secondaryBorder = variant === "outlined" ? "border-1 border-solid border-[#FFC120]" : ""; // in aslan tuye design system nabud va khodam hadsi neveshtam (ye hamchin halati baraye button tuye design system nabud)
  const errorBorder = variant === "outlined" ? "border-1 border-solid border-error-light" : "";
  const warningBorder = variant === "outlined" ? "border-1 border-solid border-warning" : "";
  const blackBorder = variant === "outlined" ? "border-1 border-solid border-black" : "";
  const greyBorder = variant === "outlined" ? "border-1 border-solid border-gray-CACFD3" : "";
  const whiteBorder =
    variant === "contained"
      ? ""
      : variant === "outlined"
      ? "border-1 border-solid border-gray-airbnb"
      : "";
  const darkBlueBorder = variant === "outlined" ? "border-1 border-solid border-gray-E9ECF0" : "";
  const lightBlueBorder =
    variant === "outlined"
      ? "border-1 border-solid border-info" // Not sure --> Not avaialble in design system
      : "";
  const lightErrorBorder =
    variant === "outlined"
      ? "border-1 border-solid border-red-light" // Not sure --> Not avaialble in design system
      : "";
  const tertiaryBorder = variant === "outlined" ? "border-1 border-solid border-tertiary" : "";

  const borderMap = {
    primary: primaryBorder,
    secondary: secondaryBorder,
    error: errorBorder,
    warning: warningBorder,
    black: blackBorder,
    grey: greyBorder,
    white: whiteBorder,
    "dark-blue": darkBlueBorder,
    "light-blue": lightBlueBorder,
    "light-error": lightErrorBorder,
    tertiary: tertiaryBorder,
  };
  // Border End

  //  ${!isFullWidth ? "w-[96px] sm:w-[140px]" : ""}
  return (
    <button
      className={`
        py-8 px-16 sm:px-32
        text-14 font-m leading-24
        ${fullHeight ? "h-full" : ""}
        ${rounded ? "rounded-50" : "rounded-6"}
        ${!isFullWidth ? "w-max sm:w-max" : ""}
        text-center
        ${bgColorsMap[color] || defaultBg}
        ${disabled ? "opacity-30 cursor-not-allowed pointer-events-none" : ""}
        ${textColorMap[color] || defaultTextColor}
        ${customBorderClassname || borderMap[color]}
        ${isFullWidth ? "w-full" : ""}
        transition ease-in-out
        flex items-center justify-center
        ${isLoading ? "pointer-events-none cursor-default" : ""}
        ${className || ""}
      `}
      // ${!disabled ? hoverMap[color] : ""}
      disabled={disabled}
      onClick={onClick}
      type={type}
      style={styles}
      ref={ref}
      {...props}
    >
      {!!rightIcon && !isLoading && (
        <span className={`flex items-center ml-8 ${rightIconWrapper || ""}`}>{rightIcon}</span>
      )}
      {!!isLoading ? (
        <>
          {!!loadingText && <span className={`${loadingTextClassName || ""}`}>{loadingText}</span>}
          <ButtonLoader />
        </>
      ) : (
        children
      )}
      {!!leftIcon && !isLoading && (
        <span className={`flex items-center mr-8 ${leftIconWrapper || ""}`}>{leftIcon}</span>
      )}
    </button>
  );
});

const withLink = (
  Button: React.ForwardRefExoticComponent<Omit<ICustomButton, "ref"> & React.RefAttributes<unknown>>
) => {
  return function LinkButton(props: { href: string } & ICustomButton) {
    const { href, ...rest } = props;

    return (
      <Link
        passHref
        prefetch={false}
        href={href}
        className={`${!!rest.disabled ? "pointer-events-none" : ""}`}
      >
        <Button {...rest}></Button>
      </Link>
    );
  };
};

const LinkButton = withLink(CustomButton);

export { CustomButton as Button, LinkButton };
