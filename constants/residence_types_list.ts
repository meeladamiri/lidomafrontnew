export interface IResidenceType {
  name: string;
  value: string;
  id: number;
}

export const residences_types_list = [
    { name: "همه اقامتگاه ها", value: "all", id: 0 },
  { name: "ویلا سوئیت ها", value: "suit", id: 1 },
  { name: "بوم گردی ها", value: "boomgardi", id: 2 },
];
