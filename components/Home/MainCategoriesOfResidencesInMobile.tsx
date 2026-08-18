import MainCategoryItemInMobile from "./MainCategoryItemInMobile";

const mobileData = [
  {
    icon: "/assets/tmp/residence-main-categories/vila.svg",
    nameOfCategory: "ویلا",
    link: "/tags/villa/%D8%A7%D8%AC%D8%A7%D8%B1%D9%87-%D9%88%DB%8C%D9%84%D8%A7-%D8%AF%D8%B1-%D8%B4%D9%85%D8%A7%D9%84",
  },
  {
    icon: "/assets/tmp/residence-main-categories/suit.svg",
    nameOfCategory: "سوئیت",
    link: "/search/city/تهران-164",
  },
  {
    icon: "/assets/tmp/residence-main-categories/Eco.svg",
    nameOfCategory: "بوم گردی",
    link: `/boomgardi/اجاره-اقامتگاه-بومگردی`,
  },
  {
    icon: "/assets/tmp/residence-main-categories/apartment.svg",
    nameOfCategory: "آپارتمان",
    link: "/tags/hotel-apartment/رزرو-هتل-آپارتمان",
  },
  {
    icon: "/assets/tmp/residence-main-categories/kolbe.svg",
    nameOfCategory: "کلبه",
    link: "/tags/jungle-cottage/%D8%A7%D8%AC%D8%A7%D8%B1%D9%87-%DA%A9%D9%84%D8%A8%D9%87-%D8%AC%D9%86%DA%AF%D9%84%DB%8C-%D8%AF%D8%B1-%D8%B4%D9%85%D8%A7%D9%84",
  },
  {
    icon: "/assets/tmp/residence-main-categories/pool.svg",
    nameOfCategory: "استخردار",
    link: "/tags/pool/%D8%A7%D8%AC%D8%A7%D8%B1%D9%87-%D9%88%DB%8C%D9%84%D8%A7-%D8%A7%D8%B3%D8%AA%D8%AE%D8%B1%D8%AF%D8%A7%D8%B1",
  },
];

function MainCategoriesOfResidencesInMobile() {
  return (
    <>
      {mobileData.map((item, i) => {
        return (
          <div className="col-span-4" key={i}>
            <MainCategoryItemInMobile
              link={item.link}
              icon={item.icon}
              nameOfCategory={item.nameOfCategory}
            />
          </div>
        );
      })}
    </>
  );
}

export default MainCategoriesOfResidencesInMobile;
