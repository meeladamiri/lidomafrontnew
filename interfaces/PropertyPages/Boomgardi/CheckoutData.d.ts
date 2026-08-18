export interface I_CheckoutData {
  specialDatesData: {
    [key: string]: // price
    {
      repeated_frequency: number;
      n_of_discounted_nights: number;
    };
  };
  peakDatesN: number;
  peakDatesUnitPrice: number;
  weekEndDatesN: number;
  weekEndDatesUnitPrice: number;
  weekDatesN: number;
  weekDatesUnitPrice: number;
  extraGuestsN: number;
  extraGuestsUnitPrice: number;
}
