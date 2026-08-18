type TNameValueEditCart = {
  name: string;
  value: string | number | undefined;
  onEditClick: (() => void) | null;
  editable?: boolean;
  sub?: JSX.Element;
};

function NameValueEditCart({ name, value, onEditClick, editable = true, sub }: TNameValueEditCart) {
  return (
    <div
      style={{
        background: !editable
          ? "linear-gradient(0deg, rgba(25, 59, 103, 0.05), rgba(25, 59, 103, 0.05)), #FFFFFF"
          : "",
      }}
      className={`
        px-16 py-12 mb-12 gap-x-4 last:mb-0 border-1 border-solid border-[rgba(28,52,84,0.26)] rounded-6
        ${!editable ? "cursor-not-allowed" : ""}
      `}
    >
      <div
        className={`
            flex items-center justify-between 
            ${!!sub ? "pb-12 border-b-1 border-solid mb-12 border-b-[rgba(28,52,84,0.26)]" : ""}
        `}
      >
        <div className="flex flex-wrap gap-y-4 items-center gap-x-4">
          <span className="text-12 leading-21 text-black font-l">{name}</span>
          <span className="text-14 leading-24 text-black font-m">{value}</span>
        </div>
        {!!editable && (
          <div
            className="flex items-center cursor-pointer"
            onClick={() => {
              if (!!editable && !!onEditClick) onEditClick();
            }}
          >
            <i className="icon-Edit text-22" />
          </div>
        )}
      </div>

      {!!sub && <div>{sub}</div>}
    </div>
  );
}

export default NameValueEditCart;
