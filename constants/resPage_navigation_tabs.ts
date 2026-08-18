export interface IResPageNavigationTab {
  name: string;
  scrollTo: string;
}

export const resPage_navigation_tabs: IResPageNavigationTab[] = [
  {
    name: "تصاویر",
    scrollTo: "#residenceImages",
  },
  {
    name: "مشخصات",
    scrollTo: "#specifications",
  },
  {
    name: "تقویم",
    scrollTo: "#suitResCalendar",
  },
  {
    name: "موقعیت",
    scrollTo: "#resLocation",
  },
  {
    name: "قوانین",
    scrollTo: "#resRules",
  },
  // {
  //   name: "میزبان",
  //   scrollTo: "#Host_Infographianno",
  // },
  {
    name: "نظرات",
    scrollTo: "#resReviews",
  },
];
