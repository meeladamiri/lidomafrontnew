import villa from "../../public/assets/home/Villa.svg";
import suite from "../../public/assets/home/Suite.svg";
import boomgardi from "../../public/assets/home/Boomgardi.svg";
import apartment from "../../public/assets/home/Apartment.svg";
import cottage from "../../public/assets/home/Cottage.svg";
import pool from "../../public/assets/home/Pool.svg";
import beach from "../../public/assets/home/Beach.svg";
import forest from "../../public/assets/home/Forest.svg";
import MainCategoryItemInDesktop from "./MainCategoryItemInDesktop";

const desktopData = [
  {
    image: villa,
    categoryName: "ویلا",
    link: "/tags/villa/%D8%A7%D8%AC%D8%A7%D8%B1%D9%87-%D9%88%DB%8C%D9%84%D8%A7-%D8%AF%D8%B1-%D8%B4%D9%85%D8%A7%D9%84",
  },
  {
    image: suite,
    categoryName: "سوئیت",
    link: "/search/city/تهران-164",
  },
  {
    image: boomgardi,
    categoryName: "بوم گردی",
    link: `/boomgardi/اجاره-اقامتگاه-بومگردی`,
  },
  {
    image: apartment,
    categoryName: "هتل آپارتمان",
    link: "/tags/hotel-apartment/%D8%B1%D8%B2%D8%B1%D9%88-%D9%87%D8%AA%D9%84-%D8%A2%D9%BE%D8%A7%D8%B1%D8%AA%D9%85%D8%A7%D9%86",
  },
  {
    image: cottage,
    categoryName: "کلبه",
    link: "/tags/cottage/%D8%A7%D8%AC%D8%A7%D8%B1%D9%87-%DA%A9%D9%84%D8%A8%D9%87",
  },
  {
    image: pool,
    categoryName: "استخردار",
    link: "/tags/pool/%D8%A7%D8%AC%D8%A7%D8%B1%D9%87-%D9%88%DB%8C%D9%84%D8%A7-%D8%A7%D8%B3%D8%AA%D8%AE%D8%B1%D8%AF%D8%A7%D8%B1",
  },
  {
    image: beach,
    categoryName: "ساحلی",
    link: "/tags/beach/%D8%A7%D8%AC%D8%A7%D8%B1%D9%87-%D9%88%DB%8C%D9%84%D8%A7-%D8%B3%D8%A7%D8%AD%D9%84%DB%8C",
  },
  {
    image: forest,
    categoryName: "جنگلی",
    link: "/tags/jungle-villa/%D8%A7%D8%AC%D8%A7%D8%B1%D9%87-%D9%88%DB%8C%D9%84%D8%A7-%D8%AC%D9%86%DA%AF%D9%84%DB%8C",
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
