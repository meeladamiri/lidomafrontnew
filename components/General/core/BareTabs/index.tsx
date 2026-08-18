interface IBareTab {
  label: string;
  tabIndex: number;
  currentActiveIndex?: number;
  onChange: onChange;
}

type onChange = (arg: number) => void;

interface IBareTabs {
  activeIndex: number;
  data: { tabLabel: string; tabIndex?: number }[];
  onChange: onChange;
}

export function BareTab(props: IBareTab) {
  return (
    <div
      style={
        {
          // flex: "1 1 0px",
        }
      }
      className={`
        flex items-center justify-center cursor-pointer py-4 px-8
        ${
          props.currentActiveIndex === props.tabIndex
            ? "border-b-2 border-solid border-b-primary-main"
            : ""
        }
        text-14 leading-20 font-m text-black
      `}
      onClick={() => {
        props.onChange(props.tabIndex);
      }}
    >
      {[props.label]}
    </div>
  );
}

function BareTabs({ activeIndex, onChange, data }: IBareTabs) {
  return (
    <div className="flex items-center justify-between bg-transparent gap-x-10">
      {data.map((item, i: number) => {
        return (
          <BareTab
            key={i}
            label={item.tabLabel}
            tabIndex={item.tabIndex || i}
            currentActiveIndex={activeIndex}
            onChange={onChange}
          />
        );
      })}
    </div>
  );
}

export default BareTabs;
