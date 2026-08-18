interface ITab {
  type?: string;
  label: string;
  tabIndex: number;
  currentActiveIndex?: number;
  onChange: onChange;
}

type onChange = (arg: number) => void;

interface ITabs {
  //   children: ReactElement<ITab> | Array<ReactElement<ITab>>;
  type?: string;
  activeIndex: number;
  data: { tabLabel: string; tabIndex?: number }[];
  onChange: onChange;
}

export function RoundedTab(props: ITab) {
  return (
    <div
      style={{
        flex: "1 1 0px",
        background:
          props.currentActiveIndex === props.tabIndex
            ? props.type === "primary"
              ? "linear-gradient(180deg, #FFC120 0%, #FCAC12 100%)"
              : "white"
            : "",
      }}
      className={`
          flex items-center justify-center cursor-pointer py-8 px-4 text-black
          ${
            props.currentActiveIndex === props.tabIndex
              ? props.type === "primary"
                ? "rounded-50 !text-white"
                : "rounded-12 !text-blue-main"
              : ""
          }
          text-12 leading-21 font-m
        `}
      onClick={() => {
        props.onChange(props.tabIndex);
      }}
    >
      {[props.label]}
    </div>
  );
}

function RoundedTabs({ activeIndex, onChange, data, type = "primary" }: ITabs) {
  //   let tabs: Array<ReactElement<ITab>>;

  //   if (!Array.isArray(children)) {
  //     tabs = [children];
  //   } else {
  //     tabs = children;
  //   }

  return (
    <div
      className={`flex items-center ${
        type === "primary" ? "rounded-50" : "rounded-12"
      } bg-gray-F4F5FA p-4 gap-x-8`}
    >
      {data.map((item, i: number) => {
        return (
          <RoundedTab
            type={type}
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

export default RoundedTabs;
