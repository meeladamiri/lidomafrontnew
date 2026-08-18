export const enum ResidenceStates_enum {
  ACTIVE = "active",
  DISABLED = "disabled",
  COMPLETING = "completing",
  SUSPENDED = "suspended",
}

export const residenceStatesMap = {
  [ResidenceStates_enum.ACTIVE]: {
    text: "فعال",
    bgColor: "bg-success",
  },
  [ResidenceStates_enum.SUSPENDED]: {
    text: "معلق شده",
    bgColor: "bg-warning",
  },
  [ResidenceStates_enum.DISABLED]: {
    text: "غیر فعال",
    bgColor: "bg-error-light",
  },
  [ResidenceStates_enum.COMPLETING]: {
    text: "در حال تکمیل",
    bgColor: "bg-warning",
  },
};
