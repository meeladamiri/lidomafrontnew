export interface IAuth {
  token?: string;
  expireDate?: any;
}

export interface ILoginedUser {
  token?: any;
  profile?: {
    field?: string;
    grade?: string;
    hasBoughtPlan?: boolean;
    hasOrderNeedPay?: boolean;
    fullName: string;
    phone: string;
    credit?: number;
    shabaNumber?: string;
    cartNumber?: string;
  };
  isAuthenticated?: any;
  isLoading?: any;
  setting?: {
    slogan: string;
    footerData: {
      endTime: string;
      startTime: string;
      footer: string;
      phone: string;
    };
  };
}

export interface IAuthProvider {
  logIn: (inputs: ILoginedUser) => void;
  logOut: () => void;
  token?: any;
  profile?: any;
  isAuthenticated?: any;
  isLoading?: any;
  setting?: {
    slogan: string;
    footerData: {
      endTime: string;
      startTime: string;
      footer: string;
      phone: string;
    };
  };
}
