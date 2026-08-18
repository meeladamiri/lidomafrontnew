export interface IResidenceAddressInfo {
  address?: string;
  city?: string;
  neighborhood?: string;
  province?: {
    id: number;
    name: string;
  };
}
