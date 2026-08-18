import GoToFlash from "../General/GoToFlash";

interface INotificationItem {
  name: string;
  icon: JSX.Element;
  time: string;
  desc: string;
}

function NotificationItem({ name, icon, time, desc }: INotificationItem) {
  return (
    <div className="flex items-center justify-between gap-x-8 border-b-1 border-solid border-b-[rgba(28,52,84,0.26)] py-8">
      <div className="grow">
        {/* first line */}
        <div className="flex items-center gap-x-8 mb-8">
          {icon}
          <p className="text-14 font-m text-black">{name}</p>
          <p className="text-12 font-l text-[rgba(28,46,69,0.6)]">{time}</p>
        </div>
        <p className="text-12 leading-21 text-black font-l">{desc}</p>
        {/* second line */}
        <div></div>
      </div>

      <div className="flex items-center justify-center shrink-0">
        <GoToFlash
          onClick={() => {
            // setShowChangePasswordBottomSheet(true)
          }}
        />
      </div>
    </div>
  );
}

export default NotificationItem;
