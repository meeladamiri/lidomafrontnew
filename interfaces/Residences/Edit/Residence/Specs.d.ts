export interface IEditResidence_SpecsInitV {
  resName: string;
  aboutResidence: string;
  "select-province":
    | {
        name: string;
        id: number;
      }
    | undefined;
  "select-city": undefined | string;
  neighborhood: string;
  exactAddress: string;
  totalArea: null | number;
  infraArea: null | number;
  floor: string;
  reslatlng: [number, number] | [];
}
