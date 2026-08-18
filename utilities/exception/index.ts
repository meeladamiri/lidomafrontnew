import { IMessageItems } from "interfaces/exception";
import { createRef } from "react";

class Exception {
  snackBarRef: any;

  constructor() {
    this.snackBarRef = createRef();
  }

  message(messages: IMessageItems) {
    while (this.snackBarRef?.current === undefined) {}
    this.snackBarRef?.current?.show(messages);
  }
}
let exception = new Exception();

export default exception;
