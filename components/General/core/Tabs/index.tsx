interface ITab {
  label: string | JSX.Element;
  tabIndex: number;
  currentActiveIndex?: number;
  onChange: onChange;
  /** Tabs keep their natural width and overflow into horizontal scroll on
   * mobile instead of shrinking to fit — for tab strips whose count varies
   * (e.g. the host residence-list tabs, which hide empty ones). */
  scroll?: boolean;
}

type onChange = (arg: number) => void;

interface ITabs {
  //   children: ReactElement<ITab> | Array<ReactElement<ITab>>;
  activeIndex: number;
  data: { tabLabel: string | JSX.Element; tabIndex?: number }[];
  onChange: onChange;
  scroll?: boolean;
}

export function Tab(props: ITab) {
  return (
    <div
      // style={{
      //   flex: "1 1 0px",
      // }}
      className={`
        flex flex-row md:flex-col items-center justify-center cursor-pointer pt-4 pb-4 px-4 md:px-0 md:pt-10 md:pb-0
        ${
          props.scroll
            ? "grow-0 shrink-0 basis-auto whitespace-nowrap"
            : "grow md:grow-0 shrink md:shrink-0 basis-0 md:basis-auto"
        }
        ${
          props.currentActiveIndex === props.tabIndex
            ? "bg-white rounded-6 md:after:content-[''] md:after:w-full md:after:mt-10 md:after:block md:after:h-4 md:after:bg-primary-main md:after:rounded-tr-100 md:after:rounded-tl-100"
            : "md:pb-6"
        }
        drop-shadow-[0px_1px_6px_rgba(0,0,0,0.1)] md:drop-shadow-none
        text-12 md:text-16 leading-21 md:leading-24 font-r text-black
      `}
      onClick={() => {
        props.onChange(props.tabIndex);
      }}
      // style={{
      //   transitionProperty: "all",
      //   transitionDuration: "200ms",
      // }}
    >
      {props.label}
    </div>
  );
}

function Tabs({ activeIndex, onChange, data, scroll }: ITabs) {
  //   let tabs: Array<ReactElement<ITab>>;

  //   if (!Array.isArray(children)) {
  //     tabs = [children];
  //   } else {
  //     tabs = children;
  //   }

  return (
    <div className="flex items-center rounded-9 bg-gray-EFEFF0 md:bg-transparent px-4 py-4 md:px-16 md:py-0 gap-x-5 md:gap-x-32 md:border-b-1 md:border-b-gray-CACFD3 md:border-solid md:rounded-0">
      {data.map((item, i: number) => {
        return (
          <Tab
            key={i}
            label={item.tabLabel}
            tabIndex={item.tabIndex || i}
            currentActiveIndex={activeIndex}
            onChange={onChange}
            scroll={scroll}
          />
        );
      })}
    </div>
  );
}

export default Tabs;
