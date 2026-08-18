import PageTitle from "components/General/PageTitle";
import IncompleteProfileItem from "components/dashboard/IncompleteProfileItem";
import Divider from "components/General/Divider";

function Profile({
  // incompleteProfileItems,
  avatarNeedsChange,
  shabaNeedsChange,
  national_card_image_NeedsChange,
}: {
  // incompleteProfileItems: string[];
  avatarNeedsChange?: boolean;
  shabaNeedsChange?: boolean;
  national_card_image_NeedsChange?: boolean;
}) {
  const incompleteProfileItems: string[] = [];
  // const incompleteProfileItems = [
  //   "تصویر پروفایل خود را بروزرسانی کنید",
  //   "شماره شبا خود را وارد کنید",
  //   "تصویر کارت ملی خود را بارگذاری کنید",
  // ];

  if (!!avatarNeedsChange) incompleteProfileItems.push("تصویر پروفایل خود را بروزرسانی کنید");
  if (!!shabaNeedsChange) incompleteProfileItems.push("شماره شبا خود را وارد کنید");
  if (!!national_card_image_NeedsChange)
    incompleteProfileItems.push("تصویر کارت ملی خود را بارگذاری کنید");

  if (!avatarNeedsChange && !shabaNeedsChange && !national_card_image_NeedsChange) return null;

  return (
    <>
      <div className="py-16">
        <PageTitle
          title="پروفایل کاربری"
          icon={<i className="icon-Profile text-24" />}
          containerClassname="mb-16"
        />

        {incompleteProfileItems.map((item: string, i: number) => (
          <IncompleteProfileItem key={i} name={item} />
        ))}
      </div>

      <Divider />
    </>
  );
}

export default Profile;
