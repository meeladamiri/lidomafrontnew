export function numberPrettier(number: number) {
  // This function supports prettifing 1-digit and 2-digit numbers.
  if (0 <= number && number < 10) {
    // so number has one digit
    return "0" + number;
  } else if (10 <= number && number < 100) {
    // so number has two digits
    return number.toString();
  }
}
