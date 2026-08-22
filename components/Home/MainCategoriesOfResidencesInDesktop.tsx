import villa from "../../public/assets/home/Villa.svg";
import suite from "../../public/assets/home/Suite.svg";
import boomgardi from "../../public/assets/home/Boomgardi.svg";
import apartment from "../../public/assets/home/Apartment.svg";
import cottage from "../../public/assets/home/Cottage.svg";
import pool from "../../public/assets/home/Pool.svg";
import beach from "../../public/assets/home/Beach.svg";
import forest from "../../public/assets/home/Forest.svg";
import MainCategoryItemInDesktop from "./MainCategoryItemInDesktop";

// Category "tags" are now query attributes on the search list page
// (/search?<tag>=1) — the same format the legacy /tags/... SEO URLs 301 to.
// Tag keys match the legacy website_tags.x_title values the search page and
// backend understand (villa / pool / hotelapartment / ...).
const desktopData = [
  {
    image: villa,
    categoryName: "ویلا",
    link: "/search?villa=1",
  },
  {
    image: suite,
    categoryName: "سوئیت",
    link: "/search/tehran",
  },
  {
    image: boomgardi,
    categoryName: "بوم گردی",
    link: "/search?boomgardi=1",
  },
  {
    image: apartment,
    categoryName: "هتل آپارتمان",
    link: "/search?hotelapartment=1",
  },
  {
    image: cottage,
    categoryName: "کلبه",
    link: "/search?cottage=1",
  },
  {
    image: pool,
    categoryName: "استخردار",
    link: "/search?pool=1",
  },
  {
    image: beach,
    categoryName: "ساحلی",
    link: "/search?beach=1",
  },
  {
    image: forest,
    categoryName: "جنگلی",
    link: "/search?forest=1",
  },
];

function MainCategoriesOfResidencesInDesktop() {
  return (
    <>
      {desktopData.map((item, i) => {
        return (
          <div className="w-[89px] pt-14 pb-12" key={i}>
            <MainCategoryItemInDesktop
              image={item.image}
              categoryName={item.categoryName}
              link={item.link}
            />
          </div>
        );
      })}
    </>
  );
}

export default MainCategoriesOfResidencesInDesktop;
