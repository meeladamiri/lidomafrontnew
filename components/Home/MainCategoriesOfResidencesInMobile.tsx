import MainCategoryItemInMobile from "./MainCategoryItemInMobile";

// Category "tags" are now query attributes on the search list page
// (/search?<tag>=1) — see MainCategoriesOfResidencesInDesktop.tsx.
const mobileData = [
  {
    icon: "/assets/tmp/residence-main-categories/vila.svg",
    nameOfCategory: "ویلا",
    link: "/search?villa=1",
  },
  {
    icon: "/assets/tmp/residence-main-categories/suit.svg",
    nameOfCategory: "سوئیت",
    link: "/search/tehran",
  },
  {
    icon: "/assets/tmp/residence-main-categories/Eco.svg",
    nameOfCategory: "بوم گردی",
    link: "/search?boomgardi=1",
  },
  {
    icon: "/assets/tmp/residence-main-categories/apartment.svg",
    nameOfCategory: "آپارتمان",
    link: "/search?hotelapartment=1",
  },
  {
    icon: "/assets/tmp/residence-main-categories/kolbe.svg",
    nameOfCategory: "کلبه",
    link: "/search?cottage=1",
  },
  {
    icon: "/assets/tmp/residence-main-categories/pool.svg",
    nameOfCategory: "استخردار",
    link: "/search?pool=1",
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
