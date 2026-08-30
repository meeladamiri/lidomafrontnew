import moment from "moment-jalaali";
import { apiBuilder, toEnvelope } from "./_shared";

/**
 * The bookings in a date range.
 *
 * The panel passes Jalali strings ("۱۴۰۵/۰۶/۰۸") because that is what its date
 * pickers produce. They are converted here rather than on the server: the
 * backend deals in ISO dates everywhere else, and one endpoint that quietly
 * expects a different calendar is a trap for whoever writes the next caller.
 */
const jalaliToIso = (value: string) => {
  const m = moment(value, "jYYYY/jMM/jDD");
  return m.isValid() ? m.format("YYYY-MM-DD") : value;
};

const getCheckoutsList = async ({
  start_date,
  till_date,
}: {
  start_date: string;
  till_date: string;
  // Untyped on purpose, as this layer always was: the component reads the
  // envelope with optional chaining, and a stricter type here would only mean
  // editing a screen that works.
}): Promise<any> => {
  const res = await apiBuilder
    .setUrl("/api/deposit/checkouts")
    .setCallMethod("GET")
    .setParams({
      startDate: jalaliToIso(start_date),
      tillDate: jalaliToIso(till_date),
    })
    .call();

  return toEnvelope(res);
};

export { getCheckoutsList };
