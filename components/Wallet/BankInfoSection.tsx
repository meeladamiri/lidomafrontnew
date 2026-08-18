import NameValueEditCart from "components/General/NameValueEditCart";
import PageTitle from "components/General/PageTitle";

interface IBankInfoSection {
  cartNumber: string;
  cartOwnerName: string;
  shaba: string;
  shabaOwner: string;
  setShowCartNumberBottomSheet: (state: boolean) => void;
  setShowCartOwnerNameBottomSheet: (state: boolean) => void;
  setShowShabaBottomSheet: (state: boolean) => void;
  setShowShabaAccountOwnerNameBottomSheet: (state: boolean) => void;
}

function BankInfoSection({
  cartNumber,
  cartOwnerName,
  shaba,
  shabaOwner,
  setShowCartNumberBottomSheet,
  setShowCartOwnerNameBottomSheet,
  setShowShabaBottomSheet,
  setShowShabaAccountOwnerNameBottomSheet,
}: IBankInfoSection) {
  return (
    <>
      <PageTitle
        title="اطلاعات حساب بانکی"
        icon={<i className="icon-CardBank text-24" />}
        containerClassname="mb-16"
      />

      <div className="">
        <NameValueEditCart
          name="شماره کارت : "
          value={cartNumber}
          onEditClick={() => setShowCartNumberBottomSheet(true)}
        />
        <NameValueEditCart
          name="نام صاحب کارت : "
          value={cartOwnerName}
          onEditClick={() => {
            setShowCartOwnerNameBottomSheet(true);
          }}
        />
        <NameValueEditCart
          name="شماره شبا : "
          value={shaba}
          onEditClick={() => setShowShabaBottomSheet(true)}
        />
        <NameValueEditCart
          name="نام صاحب حساب شبا :"
          value={shabaOwner}
          onEditClick={() => setShowShabaAccountOwnerNameBottomSheet(true)}
        />
      </div>
    </>
  );
}

export default BankInfoSection;
