import JobContactInfo from "./JobContactInfo";
import React, { useState, useEffect } from "react";
function JobDetailItem({ body }: { body: JSX.Element | string }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [style, setStyle] = useState<{}>();
  useEffect(() => {
    if (isOpen) {
      setStyle({ opacity: "1" });
    } else setStyle({ opacity: "0" });
  }, [isOpen]);
  return (
    <div>
      {isOpen && (
        <div
          style={{
            ...style,
          }}
          className={`grid grid-cols-12 transition-all ease-in-out delay-150  duration-700 overflow-y-hidden`}
        >
          <div className="col-span-9 pr-5">{body}</div>
          <div className="col-span-3">
            <JobContactInfo />
          </div>
        </div>
      )}
      <a
        className="text-12 text-[#007AFF] cursor-pointer flex items-center gap-3" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "بستن جزئیات" : "مشاهده جزئیات بیشتر"}
        {isOpen ? (
          <i className="icon-FlashUp text-16 text-[#007AFF]" />
        ) : (
          <i className="icon-FlashDown text-16 text-[#007AFF]" />
        )}
      </a>
    </div>
  );
}

export default JobDetailItem;
