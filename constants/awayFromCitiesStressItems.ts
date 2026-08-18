import yazd from "../public/assets/home/away-from-city-stress/yazd.webp";
import shiraz from "../public/assets/home/away-from-city-stress/shiraz.webp";
import esfahan from "../public/assets/home/away-from-city-stress/esfehan.webp";
import kashan from "../public/assets/home/away-from-city-stress/kashan.webp";
import qeshm from "../public/assets/home/away-from-city-stress/gheshm.webp";
import bushehr from "../public/assets/home/away-from-city-stress/bushehr.webp";
import tonekabon from "../public/assets/home/away-from-city-stress/tankabon.webp";
import tabas from "../public/assets/home/away-from-city-stress/tabas.webp";
import foman from "../public/assets/home/away-from-city-stress/foman.webp";
import rudbar from "../public/assets/home/away-from-city-stress/rudbar.webp";
import behshahr from "../public/assets/home/away-from-city-stress/behshahr.webp";
import ferdows from "../public/assets/home/away-from-city-stress/ferdos.webp";
import { BASE_URL } from "@/configs/info";

export const awayFromCitiesStressItems = [
  {
    name: "بوم گردی های یزد",
    min_price: 350000,
    image: yazd,
    link: `${BASE_URL}/search/yazd?boomgardi=1`,
  },
  {
    name: "بوم گردی های شیراز",
    min_price: 400000,
    image: shiraz,
    link: `${BASE_URL}/search/shiraz?boomgardi=1`,
  },
  {
    name: "بوم گردی های اصفهان",
    min_price: 375000,
    image: esfahan,
    link: `${BASE_URL}/search/esfahan?boomgardi=1`,
  },
  {
    name: "بوم گردی های کاشان",
    min_price: 280000,
    image: kashan,
    link: `${BASE_URL}/search/kashan?boomgardi=1`,
  },
  {
    name: "بوم گردی های قشم",
    min_price: 430000,
    image: qeshm,
    link: `${BASE_URL}/search/qeshm?boomgardi=1`,
  },
  {
    name: "بوم گردی های بوشهر",
    min_price: 390000,
    image: bushehr,
    link: `${BASE_URL}/search/bushehr?boomgardi=1`,
  },
  {
    name: "بوم گردی های تنکابن",
    min_price: 440000,
    image: tonekabon,
    link: `${BASE_URL}/search/tonekabon?boomgardi=1`,
  },
  {
    name: "بوم گردی های طبس",
    min_price: 290000,
    image: tabas,
    link: `${BASE_URL}/search/tabas?boomgardi=1`,
  },
  {
    name: "بوم گردی های فومن",
    min_price: 270000,
    image: foman,
    link: `${BASE_URL}/search/foman?boomgardi=1`,
  },
  {
    name: "بوم گردی های رودبار",
    min_price: 280000,
    image: rudbar,
    link: `${BASE_URL}/search/rudbar?boomgardi=1`,
  },
  {
    name: "بوم گردی های بهشهر",
    min_price: 310000,
    image: behshahr,
    link: `${BASE_URL}/search/behshahr?boomgardi=1`,
  },
  {
    name: "بوم گردی های فردوس",
    min_price: 300000,
    image: ferdows,
    link: `${BASE_URL}/search/ferdows?boomgardi=1`,
  },
];
