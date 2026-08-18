import { EXCEPTIONTYPES } from "constants/enums/exception_types";
import { IMessageItems } from "interfaces/exception";
import React from "react";
import { ToastContainer, toast, TypeOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const getContextClass = (type: TypeOptions) => {
  if (type === "success") {
    return `!bg-[#F2FFF2] border-success border-solid border-1 !text-success`;
  } else if (type === "error") {
    return `!bg-[#FFF0EF] border-error-light border-solid border-1 !text-error-light`;
  } else if (type === "info") {
    return `!bg-[#F1F7FF] border-info border-solid border-1 !text-info`;
  } else if (type === "warning") {
    return `!bg-[#FFFBEF] border-warning border-solid border-1 !text-warning`;
  }
};

const getIcon = (type: TypeOptions) => {
  if (type === "success") {
    return <i className="icon-Success text-24" />;
  } else if (type === "error") {
    return <i className="icon-Error text-24" />;
  } else if (type === "info") {
    return <i className="icon-Warning text-24" />;
  } else if (type === "warning") {
    return <i className="icon-Warning2 text-24" />;
  }
};

const getBorderColor = (type: TypeOptions) => {
  if (type === "success") {
    return "border-l-success";
  } else if (type === "error") {
    return "border-l-error-light";
  } else if (type === "info") {
    return "border-l-info";
  } else if (type === "warning") {
    return "border-l-warning";
  }
};

class CustomSnackbar extends React.Component {
  show = (messages: IMessageItems) => {
    if (messages) {
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].type === EXCEPTIONTYPES.ERROR) {
          toast.error(messages[i].title);
        } else if (messages[i].type === EXCEPTIONTYPES.WARNING) {
          toast.warn(messages[i].title);
        } else if (messages[i].type === EXCEPTIONTYPES.INFO) {
          toast.info(messages[i].title);
        } else {
          toast.success(messages[i].title);
        }
      }
    }
  };

  render() {
    return (
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        bodyClassName="font-m text-14 leading-24 !p-0 !my-0" // Toastify__toast-body class
        style={
          {
            // maxWidth: "83%",
            // margin: "0 auto",
          }
        }
        className="!top-[80px]"
        toastClassName={({ type, defaultClassName }: any) => {
          // Toastify__toast class
          return `${defaultClassName} ${getContextClass(
            type
          )} max-w-[83%] md:max-w-[420px] mx-auto !px-12 !py-12 !rounded-6 !mb-8`;
        }}
        limit={3}
        closeButton={false}
        // icon={}
        icon={(
          { theme, type } // Toastify__toast-icon ==> ru in neveshte mishe
        ) => (
          <span
            className={`flex items-center pl-12 border-l-1 border-solid ${getBorderColor(type)}`}
          >
            {getIcon(type)}
          </span>
        )}
      />
    );
  }
}

export default CustomSnackbar;
