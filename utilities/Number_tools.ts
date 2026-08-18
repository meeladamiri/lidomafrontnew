const persianNumbers: string[] = [
  //
  "۰",
  "۱",
  "۲",
  "۳",
  "۴",
  "۵",
  "۶",
  "۷",
  "۸",
  "۹",
];
const arabicNumbers: string[] = [
  //
  "٠",
  "١",
  "٢",
  "٣",
  "٤",
  "٥",
  "٦",
  "٧",
  "٨",
  "٩",
];
const englishNumbers: string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function toEnDigit(s: string) {
  return s.replace(
    /[\u0660-\u0669\u06f0-\u06f9]/g, // Detect all Persian/Arabic Digit in range of their Unicode with a global RegEx character set
    (a) => (a.charCodeAt(0) & 0xf) as any
    // Remove the Unicode base(2) range that not match
  );
}

export const checkWholeStrIsNumber = (str: string): boolean | undefined => {
  if (typeof str === "string") {
    let i: number = 0;
    let wholeStrIsNumber: boolean = true;

    while (i < str.length) {
      if (
        englishNumbers.includes(str[i]) ||
        persianNumbers.includes(str[i]) ||
        arabicNumbers.includes(str[i])
      ) {
        continue;
      } else {
        wholeStrIsNumber = false;
        break;
      }
    }

    return wholeStrIsNumber;
  }
};

export function checkOneCharIsNumber(char: string): boolean {
  if (
    englishNumbers.includes(char) ||
    persianNumbers.includes(char) ||
    arabicNumbers.includes(char)
  ) {
    return true;
  } else {
    return false;
  }
}

export const numericToStringicMap: { [key: number]: string } = {
  1: "اول",
  2: "دوم",
  3: "سوم",
  4: "چهارم",
  5: "پنجم",
  6: "ششم",
  7: "هفتم",
  8: "هشتم",
  9: "نهم",
  10: "دهم",
  11: "یازدهم",
  12: "دوازدهم",
  13: "سیزدهم",
  14: "چهاردهم",
  15: "پانزدهم",
  16: "شانزدهم",
  17: "هفدهم",
  18: "هیجدهم",
  19: "نوزدهم",
  20: "بیستم",
};
