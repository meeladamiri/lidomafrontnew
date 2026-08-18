type TProfileStatus = {
  status: "verified" | "pending" | "rejected" | "";
};

const statusMap = {
  verified: {
    title: "حساب کاربری شما تأیید شده است",
    icon: <i className="icon-Success text-18 text-success" />,
    borderRightColor: "border-r-success",
  },
  pending: {
    title: "حساب کاربری شما در حال برررسی است",
    icon: <i className="icon-Warning text-18 text-warning" />,
    borderRightColor: "border-r-warning",
  },
  rejected: {
    title: "حساب کاربری شما تأیید نشد",
    icon: <i className="icon-Error text-18 text-error-light" />,
    borderRightColor: "border-r-error-light",
  },
};

function ProfileStatus({ status }: TProfileStatus) {
  if (!status) return null;

  return (
    <div className="rounded-12 p-12 typical-gray-bg">
      <div className={`border-r-2 border-solid pr-12 ${statusMap[status].borderRightColor}`}>
        <div className="flex items-center justify-between mb-12">
          <p className="text-14 leading-24 text-black font-m">{statusMap[status].title}</p>
          <div className="flex items-center">{statusMap[status].icon}</div>
        </div>

        <p className="text-10 leading-17 font-l text-black">
          در صورت ویرایش اطلاعات هویتی، اطلاعات شما پس از تأیید از سوی کارشناسان ما منتشر می شوند.
        </p>
      </div>
    </div>
  );
}
export default ProfileStatus;
