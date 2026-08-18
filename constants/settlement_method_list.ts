export interface ISettlementMethod {
    name: string;
    value: string;
    id: number;
  }
  
  export const settlement_methods_list = [
      { name: "مانده واریز", value: "remainder" },
    { name: "واریز بیعانه", value: "deposit" },
    { name: "کسر بدهی میزبان", value: "host_debit" },
  ];
  