import { TextField } from "@/components/General/core/TextField";

function WhereYouWannaGoTextField({
  readonly,
  value,
  onChange,
  placeholderText = "جستجوی شهر یا اقامتگاه",
}: {
  readonly: boolean;
  value?: string;
  onChange?: (value: string) => void;
  placeholderText?: string;
}) {
  return (
    <TextField
      autofocus
      wrapperClassname="rounded-[12px]"
      name="whereYouWannaGo"
      placeholder={placeholderText}
      placeholderClassname="placeholder:text-14 placeholder:font-r placeholder:text-gray-616E7C"
      rightIcon={<i className="icon-Search text-black text-24" />}
      hasPrimaryColorBorderBottom
      readonly={readonly}
      customValue={value}
      customOnChange={(newValue) => {
        if (!readonly && !!onChange) {
          onChange(newValue);
        }
      }}
    />
  );
}

export default WhereYouWannaGoTextField;
