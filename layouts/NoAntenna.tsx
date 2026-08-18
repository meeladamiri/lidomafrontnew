import { Button } from "@/components/General/core/Button";
import UnHappyMessage from "@/components/General/UnHappyMessage";
import Image from "next/image";
import { useRouter } from "next/router";

export default function NoAntenna() {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <UnHappyMessage
        title="متأسفانه اینترنت شما متصل نمی باشد !"
        iconSrc={
          <div className="w-56 h-56 flex items-center justify-center rounded-12 bg-[rgba(255,66,56,0.1)]">
            <Image src={"/assets/non-icomoon-icons/no-antenna.svg"} width={32} height={32} alt="" />
          </div>
        }
        containerClassname="pt-80"
        actions={
          <div className="flex justify-center">
            <Button
              onClick={() => {
                router.reload();
              }}
              rightIcon={
                <i className="icon-Resend text-white text-20 -scale-x-100 rotate-[137deg]" />
              }
            >
              بارگذاری مجدد صفحه
            </Button>
          </div>
        }
      />
    </div>
  );
}
