import { Switch } from "components/General/core/Switch";
import { TextField } from "components/General/core/TextField";

function SwitchItem({
  itemName,
  itemText,
  isChecked,
  onToggle,
  UserDescAboutRes,
  onChangeUserDescAboutRes,
}: {
  itemName: string;
  itemText: string;
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
  UserDescAboutRes: string;
  onChangeUserDescAboutRes: (text: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-x-6">
        <p className="text-14 leading-24 text-black font-r">{itemText}</p>
        <Switch
          name={`${itemName}-switch`}
          checked={isChecked}
          onChange={(e) => {
            onToggle(e.target.checked);
          }}
        />
      </div>
      {!!isChecked && (
        <div className="mt-12">
          <TextField
            name={`${itemName}-input`}
            placeholder="توضیحات"
            customValue={UserDescAboutRes}
            customOnChange={(value) => onChangeUserDescAboutRes(value)}
          />
        </div>
      )}
    </div>
  );
}
export default SwitchItem;
