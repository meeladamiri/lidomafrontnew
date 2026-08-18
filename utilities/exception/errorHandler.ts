import { defaultError, EXCEPTIONTYPES } from "constants/enums/exception_types";
import exception from ".";

const errorHandler = (error: any) => {
  if (
    error &&
    (error?.data?.status === "validation-error" || error?.status === "validation-error")
  ) {
    if (error.data) {
      for (let i = 0; i < (error.data?.data ? error.data?.data : error.data).length; i++) {
        exception.message([
          {
            type: EXCEPTIONTYPES.ERROR,
            title: (error.data?.data ? error.data?.data : error.data)[i].errorMessage,
          },
        ]);
      }
    } else {
      exception.message([{ title: error.message, type: EXCEPTIONTYPES.ERROR }]);
      return "";
    }
  } else {
    if (error.message) {
      exception.message([{ title: error?.data?.message, type: EXCEPTIONTYPES.ERROR }]);
      return "";
    } else {
      exception.message([{ title: defaultError, type: EXCEPTIONTYPES.ERROR }]);
      return "";
    }
  }
};

export { errorHandler };
