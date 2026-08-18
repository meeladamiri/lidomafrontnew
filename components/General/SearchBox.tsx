import { TextField } from "./core/TextField";

function SearchBox({
  inputName,
  autoComplete = true,
  placeholder,
  value,
  onChange,
}: {
  inputName: string;
  autoComplete?: boolean;
  placeholder: string;
  value: string | number;
  onChange: (newValue: string) => void;
}) {
  return (
    <div className="py-12 px-16 typical-gray-bg rounded-100 flex items-center gap-x-8">
      <i className="icon-Search text-24 text-black" />
      <TextField
        name={inputName}
        autoComplete={autoComplete}
        wrapperClassname="!border-none !bg-transparent !p-0"
        inputClassname="!bg-transparent !text-12 !leading-21"
        placeholder={placeholder}
        customValue={value}
        customOnChange={(value) => {
          onChange(value);
        }}
      />
    </div>
  );
}

export default SearchBox;
