import { useMediaQuery } from "@/utilities/useMediaQuery";
import Image from "next/image";
import Section from "../Section";

function TopSection() {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="">
      <div className="flex items-start gap-x-40 CustomContainer bg-white pt-[87px] md:pt-[116px]">
        <div className="grow hidden md:block">
          <p className="text-20 font-l mb-8">سلام،من</p>
          <h1 className="text-40 leading-48 text-black mb-16">میلاد امیری</h1>

          <h2 className="text-14 leading-20 text-gray-959FA7 mb-24">موسس استارتاپ لیدوماتریپ هستم</h2>

          <p className="text-16 leading-28 text-black">
            من میلاد امیری، متولد 1370موسس شرکت لیدوماتریپ هستم. می خوام یه داستان واقعی، از به
            حقیقت پیوستن و شدن رو براتون بگم. داستانی از جنس باور، تلاش و تسلیم نشدن. برای شروع باید
            به ده سال قبل بریم، یعنی زمانی که پشت کنکوری بودم. زماني كه كنكور دادم با توجه به رتبه
            کنکور سراسریم دو مسیر رو روبروی خودم مي ديدم. مسير اول تحصيل در رشته برق بود و من آينده
            ي شغليم رو تو اين رشته روشن مي ديدم. اما مسير دوم، خوندن رشته اي بود كه موجبات استخدام
            من رو تو شركت نفت فراهم مي كرد. خوب احتمالا همتون مي دونين اكثر كساني كه استخدام شركت
            نفت هستن، حقوق بالایی دارن. همين موضوع و یکسری عوامل دیگه، من رو ترغیب می کرد تا تو مسیر
            دوم قدم بگذارم. با رتبه اي كه تو كنكور كسب كرده بودم، به راحتي مي تونستم تو رشته مهندسي
            ايمني و بازرسي فني شركت نفت، بورسيه دانشگاه صنعت نفت آبادان و اهواز بشم. ولي اين وسط
            چيزي بود كه من رو به مسير اول كشوند، و اون این بود .که من از محدوديت و در چهارچوب
            سازماني بودن فراري بودم. دنباله رو عقاید و افکار دیگران نبودم و در عین حال كار روتين
            برام لذت بخش نبود.
          </p>
        </div>

        <div className="w-full md:w-[400px] min-h-[400px] md:h-[480px] shrink-0 relative mb-[108px] md:mb-0">
          <Image
            src={"/assets/milad-amiri/milad-amiri.jpg"}
            fill
            style={{ objectFit: !!isDesktop ? "cover" : "cover", borderRadius: "12px" }}
            alt="میلاد امیری"
            priority
          />

          <div className="absolute right-0 left-0 top-full -translate-y-40 md:hidden">
            <div className="p-16 rounded-24 bg-[rgba(255,255,255,0.10)] backdrop-blur-[10px]">
              <p className="text-16 leading-24 text-white mb-4">سلام،من</p>
              <h1 className="text-24 leading-40 text-black mb-12">میلاد امیری</h1>
              <h2 className="text-14 leading-20 text-gray-616E7C">موسس استارتاپ لیدوماتریپ هستم</h2>
            </div>
          </div>
        </div>
      </div>

      {/*  */}
      <div className="CustomContainer md:hidden pt-24">
        <Section
          title="سفری در زمان"
          // images={["/assets/tmp/res-0.webp", "/assets/tmp/res-0.webp", "/assets/tmp/res-0.webp"]}
          showMainImageAtRight
          bodyText={`
          من میلاد امیری، متولد 1370موسس شرکت لیدوماتریپ هستم. می خوام یه داستان واقعی، از به حقیقت پیوستن و شدن رو براتون بگم. داستانی از جنس باور، تلاش و تسلیم نشدن. برای شروع باید به ده سال قبل بریم، یعنی زمانی که پشت کنکوری بودم. زماني كه كنكور دادم با توجه به رتبه کنکور سراسریم دو مسیر رو روبروی خودم مي ديدم. مسير اول تحصيل در رشته برق بود و من آينده ي شغليم رو تو اين رشته روشن مي ديدم. اما مسير دوم، خوندن رشته اي بود كه موجبات استخدام من رو تو شركت نفت فراهم مي كرد. خوب احتمالا همتون مي دونين اكثر كساني كه استخدام شركت نفت هستن، حقوق بالایی دارن. همين موضوع و یکسری عوامل دیگه، من رو ترغیب می کرد تا تو مسیر دوم قدم بگذارم. با رتبه اي كه تو كنكور كسب كرده بودم، به راحتي مي تونستم تو رشته مهندسي ايمني و بازرسي فني شركت نفت، بورسيه دانشگاه صنعت نفت آبادان و اهواز بشم. ولي اين وسط چيزي بود كه من رو به مسير اول كشوند، و اون این بود .که من از محدوديت و در چهارچوب سازماني بودن فراري بودم. دنباله رو عقاید و افکار دیگران نبودم و در عین حال كار روتين برام لذت بخش نبود.
          `}
        />
      </div>
    </div>
  );
}

export default TopSection;
