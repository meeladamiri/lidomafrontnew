// "نوع ملک" slug — mirrors the backend ResidenceType enum (Odoo
// x_display_type). "hotel" was commented out here historically; the type is
// real data now, so it is part of the union again.
export type I_Residence_display_type = "boomgardi" | "suit" | "hotel";
// export type I_Residence_display_type_without_hotel = Exclude<I_Residence_display_type, "hotel">;
