import shomal from "../public/assets/home/popular-dests-comp/shomal.webp";
import kish from "../public/assets/home/popular-dests-comp/kish.webp";
import mashhad from "../public/assets/home/popular-dests-comp/mashhad.webp";
import ramsar from "../public/assets/home/popular-dests-comp/ramsar.webp";
import tehran from "../public/assets/home/popular-dests-comp/tehran.webp";
import esfehan from "../public/assets/home/popular-dests-comp/esfehan.webp";
import kordan from "../public/assets/home/popular-dests-comp/kordan.webp";
import tabriz from "../public/assets/home/popular-dests-comp/tabriz.webp";
import shiraz from "../public/assets/home/popular-dests-comp/shiraz.webp";
import { BASE_URL } from "@/configs/info";

export const popularDestsComp = [
  {
    name: "شمال",
    image: shomal,
    link: `${BASE_URL}/search/shomal?villa=1`,
  },
  {
    name: "کیش",
    image: kish,
    link: `${BASE_URL}/search/kish`,
  },
  {
    name: "مشهد",
    image: mashhad,
    link: `${BASE_URL}/search/mashhad`,
  },
  {
    name: "رامسر",
    image: ramsar,
    link: `${BASE_URL}/search/ramsar`,
  },
  {
    name: "تهران",
    image: tehran,
    link: `${BASE_URL}/search/tehran`,
  },
  {
    name: "اصفهان",
    image: esfehan,
    link: `${BASE_URL}/search/isfahan`,
  },
  {
    name: "کردان",
    image: kordan,
    link: `${BASE_URL}/search/kordan`,
  },
  {
    name: "تبریز",
    image: tabriz,
    link: `${BASE_URL}/search/tabriz`,
  },
  {
    name: "شیراز",
    image: shiraz,
    link: `${BASE_URL}/search/shiraz`,
  },
];
