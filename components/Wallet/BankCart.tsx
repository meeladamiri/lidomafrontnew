import Image from "next/image";

interface IBankCart {
  cartNumber: string;
  cartOwnerName: string;
  shaba: string;
}

function BankCart({ cartNumber, cartOwnerName, shaba }: IBankCart) {
  return (
    <div className="rounded-12 bg-[url('/assets/Wallet-Effect.svg')] bg-primary-main bg-no-repeat bg-cover py-16">
      <div className="flex justify-end mb-24 px-16">
        <Image
          src={"/assets/logos/Logo-white-landscape.svg"}
          //  objectFit="cover" layout="fill"
          width={102}
          height={24}
          alt="لوگو"
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
      </div>

      <div className="px-16">
        <div className="text-26 leading-46 md:leading-28 font-b-en md:font-m text-white mb-12 text-center drop-shadow-[0px_2px_4px_rgba(0,0,0,0.2)]">
          {cartNumber
            ?.toString()
            ?.replace(/[^\dA-Z]/g, "")
            ?.replace(/(.{4})/g, "$1 ")
            ?.trim()}
        </div>

        <p className="text-14 font-m drop-shadow-[0px_2px_4px_rgba(0,0,0,0.2)] text-white mb-16">
          {cartOwnerName}
        </p>

        <div className="flex items-center gap-x-4 flex-wrap gap-y-4">
          <span className="font-m text-14 text-white drop-shadow-[0px_0px_4px_rgba(0,0,0,0.2)]">
            شماره شبا‌ :
          </span>
          <span className="font-m-en text-white text-16 drop-shadow-[0px_0px_4px_rgba(0,0,0,0.2)]">
            {shaba}
          </span>
        </div>
      </div>
    </div>
  );
}

export default BankCart;
