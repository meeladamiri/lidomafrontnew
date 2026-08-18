import { numberPrettier } from "./prettiers";

export const getTimeDiff = (d1Mills: number, d2Mills: number) => {
  // console.log("d1Mills", d1Mills);
  // console.log("d2Mills", d2Mills);

  const diff = d2Mills - d1Mills;
  // console.log("diff", diff);

  const totalSeconds = Math.floor(diff / 1000);

  const hours = Math.floor(totalSeconds / (60 * 60));
  const remainingSeconds = totalSeconds - hours * (60 * 60);
  const minutes = Math.floor(remainingSeconds / 60);

  const seconds = remainingSeconds - minutes * 60;

  // To indicate that the timer has reached 0 and therefore is finished.
  if (hours === 0 && minutes === 0 && seconds === 0) return 0;

  if (hours === 0) {
    return `${numberPrettier(minutes)}:${numberPrettier(seconds)}`;
  } else {
    return `${hours}:${numberPrettier(minutes)}:${numberPrettier(seconds)}`;
  }
};
