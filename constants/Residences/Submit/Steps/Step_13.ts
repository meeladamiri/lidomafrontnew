import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import * as Yup from "yup";

export const customPolicyFormikInitialValues = {
  "full-return-time": null,
  "before-start-time": null,
  "host-share-total-amount": null,
  "host-share-past-nights": null,
  "host-share-future-nights": null,
};

export const customPolicyYupSchema = {
  "full-return-time": Yup.number()
    .typeError(VALIDATION_MESSAGES.REQUIRED)
    .required(VALIDATION_MESSAGES.REQUIRED),
  "before-start-time": Yup.number()
    .typeError(VALIDATION_MESSAGES.REQUIRED)
    .required(VALIDATION_MESSAGES.REQUIRED),
  "host-share-total-amount": Yup.number()
    .min(0, "حداقل مقدار مجاز 0% می باشد")
    .max(100, "حداکثر مقدار مجاز 100% می باشد")
    .typeError(VALIDATION_MESSAGES.REQUIRED)
    .required(VALIDATION_MESSAGES.REQUIRED),
  "host-share-past-nights": Yup.number()
    .min(0, "حداقل مقدار مجاز 0% می باشد")
    .max(100, "حداکثر مقدار مجاز 100% می باشد")
    .typeError(VALIDATION_MESSAGES.REQUIRED)
    .required(VALIDATION_MESSAGES.REQUIRED),
  "host-share-future-nights": Yup.number()
    .min(0, "حداقل مقدار مجاز 0% می باشد")
    .max(100, "حداکثر مقدار مجاز 100% می باشد")
    .typeError(VALIDATION_MESSAGES.REQUIRED)
    .required(VALIDATION_MESSAGES.REQUIRED),
};
