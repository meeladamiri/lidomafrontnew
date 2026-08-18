export interface INavItem {
  name: string;
  icon: {
    src: JSX.Element;
  };
  href: string;
  bottomSheetDescription?: string;
  bottomSheetIcon?: JSX.Element
}
