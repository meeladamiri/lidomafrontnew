import React from "react";

interface IPageTitle {
  icon?: JSX.Element;
  title: string;
  containerClassname?: string;
  element?: JSX.Element;
  asH1?: boolean;
}

function PageTitle({ icon, title, containerClassname, element, asH1 }: IPageTitle) {
  return (
    <div className={`flex items-center justify-between ${containerClassname || ""}`}>
      <div className="flex items-center">
        {!!icon && <div className="flex items-center ml-12">{icon}</div>}
        {!!asH1 ? (
          <h1 className="text-[#000000] text-16 leading-28 font-m">{title}</h1>
        ) : (
          <h2 className="text-[#000000] text-16 leading-28 font-m">{title}</h2>
        )}
      </div>
      {element}
    </div>
  );
}
export default PageTitle;
