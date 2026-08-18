import Divider from "../General/Divider";
import ContactMiladAmiri from "./ContactMiladAmiri";
import Section from "./Section";
import TopSection from "./TopSection";

// ################## IMAGES ##################
// Jashn Images
import Jashn0 from "../../public/assets/milad-amiri/Jashn/305357_138673832904271_1285780060_n.jpg";
import Jashn1 from "../../public/assets/milad-amiri/Jashn/IMG-20150422-WA0005.jpg";
import Jashn2 from "../../public/assets/milad-amiri/Jashn/IMG-20150518-WA0003.jpg";
import Jashn3 from "../../public/assets/milad-amiri/Jashn/IMG_2564.jpg";
import Jashn4 from "../../public/assets/milad-amiri/Jashn/IMG_2588.jpg";
import Jashn5 from "../../public/assets/milad-amiri/Jashn/Untitled.png";
// InSearchOfMeaning Images
import InSearchOfMeaning0 from "../../public/assets/milad-amiri/InSearchOfMeaning/image.jpeg";
import InSearchOfMeaning1 from "../../public/assets/milad-amiri/InSearchOfMeaning/image (1).jpeg";
import InSearchOfMeaning2 from "../../public/assets/milad-amiri/InSearchOfMeaning/image (2).jpeg";
import InSearchOfMeaning3 from "../../public/assets/milad-amiri/InSearchOfMeaning/image (3).jpeg";
import InSearchOfMeaning4 from "../../public/assets/milad-amiri/InSearchOfMeaning/image (4).jpeg";
// OutsideUni Images
import OutsideUni0 from "../../public/assets/milad-amiri/OutsideUni/image.jpeg";
import OutsideUni1 from "../../public/assets/milad-amiri/OutsideUni/image (1).jpeg";
import OutsideUni2 from "../../public/assets/milad-amiri/OutsideUni/image (2).jpeg";
import OutsideUni3 from "../../public/assets/milad-amiri/OutsideUni/image (3).jpeg";
// NoWishButGoal Images
import NoWishButGoal0 from "../../public/assets/milad-amiri/NoWishButGoal/image.jpeg";
import NoWishButGoal1 from "../../public/assets/milad-amiri/NoWishButGoal/image (1).jpeg";
import NoWishButGoal2 from "../../public/assets/milad-amiri/NoWishButGoal/image (2).jpeg";
import NoWishButGoal3 from "../../public/assets/milad-amiri/NoWishButGoal/image (3).jpeg";
// WinterIsComing Images
import InspiringTrip0 from "../../public/assets/milad-amiri/InspiringTrip/photo_10_2023-07-25_16-31-47.jpg";
import InspiringTrip1 from "../../public/assets/milad-amiri/InspiringTrip/photo_11_2023-07-25_16-31-47.jpg";
import InspiringTrip2 from "../../public/assets/milad-amiri/InspiringTrip/photo_12_2023-07-25_16-31-47.jpg";
import InspiringTrip3 from "../../public/assets/milad-amiri/InspiringTrip/photo_13_2023-07-25_16-31-47.jpg";
import InspiringTrip4 from "../../public/assets/milad-amiri/InspiringTrip/photo_14_2023-07-25_16-31-47.jpg";
import InspiringTrip5 from "../../public/assets/milad-amiri/InspiringTrip/photo_15_2023-07-25_16-31-47.jpg";
import InspiringTrip6 from "../../public/assets/milad-amiri/InspiringTrip/photo_16_2023-07-25_16-31-47.jpg";
import InspiringTrip7 from "../../public/assets/milad-amiri/InspiringTrip/photo_1_2023-07-25_16-31-47.jpg";
import InspiringTrip8 from "../../public/assets/milad-amiri/InspiringTrip/photo_2_2023-07-25_16-31-47.jpg";
import InspiringTrip9 from "../../public/assets/milad-amiri/InspiringTrip/photo_3_2023-07-25_16-31-47.jpg";
import InspiringTrip10 from "../../public/assets/milad-amiri/InspiringTrip/photo_4_2023-07-25_16-31-47.jpg";
import InspiringTrip11 from "../../public/assets/milad-amiri/InspiringTrip/photo_5_2023-07-25_16-31-47.jpg";
import InspiringTrip12 from "../../public/assets/milad-amiri/InspiringTrip/photo_6_2023-07-25_16-31-47.jpg";
import InspiringTrip13 from "../../public/assets/milad-amiri/InspiringTrip/photo_7_2023-07-25_16-31-47.jpg";
import InspiringTrip14 from "../../public/assets/milad-amiri/InspiringTrip/photo_8_2023-07-25_16-31-47.jpg";
import InspiringTrip15 from "../../public/assets/milad-amiri/InspiringTrip/photo_9_2023-07-25_16-31-47.jpg";
// WordPress Images
import WordPress0 from "../../public/assets/milad-amiri/WordPress/image.jpeg";
import WordPress1 from "../../public/assets/milad-amiri/WordPress/image (1).jpeg";
import WordPress2 from "../../public/assets/milad-amiri/WordPress/image (2).jpeg";
import WordPress3 from "../../public/assets/milad-amiri/WordPress/image (3).jpeg";
import WordPress4 from "../../public/assets/milad-amiri/WordPress/image (4).jpeg";
// NightsWithNoSleep Images
import NightsWithNoSleep0 from "../../public/assets/milad-amiri/NightsWithNoSleep/image.jpeg";
import NightsWithNoSleep1 from "../../public/assets/milad-amiri/NightsWithNoSleep/image (1).jpeg";
import NightsWithNoSleep2 from "../../public/assets/milad-amiri/NightsWithNoSleep/image (2).jpeg";
import NightsWithNoSleep3 from "../../public/assets/milad-amiri/NightsWithNoSleep/image (3).jpeg";
// WinterIsComing Images
import WinterIsComing0 from "../../public/assets/milad-amiri/WinterIsComing/image.jpeg";
import WinterIsComing1 from "../../public/assets/milad-amiri/WinterIsComing/image (1).jpeg";
import WinterIsComing2 from "../../public/assets/milad-amiri/WinterIsComing/image (2).jpeg";
import WinterIsComing3 from "../../public/assets/milad-amiri/WinterIsComing/image (3).jpeg";
import WinterIsComing4 from "../../public/assets/milad-amiri/WinterIsComing/image (4).jpeg";
import WinterIsComing5 from "../../public/assets/milad-amiri/WinterIsComing/image (5).jpeg";
import WinterIsComing6 from "../../public/assets/milad-amiri/WinterIsComing/image (6).jpeg";
import WinterIsComing7 from "../../public/assets/milad-amiri/WinterIsComing/image (7).jpeg";
import WinterIsComing8 from "../../public/assets/milad-amiri/WinterIsComing/image (8).jpeg";
import WinterIsComing9 from "../../public/assets/milad-amiri/WinterIsComing/image (9).jpeg";
import WinterIsComing10 from "../../public/assets/milad-amiri/WinterIsComing/image (10).jpeg";
// InterestingEid Images
import InterestingEid0 from "../../public/assets/milad-amiri/InterestingEid/image.jpeg";
import InterestingEid1 from "../../public/assets/milad-amiri/InterestingEid/image (1).jpeg";
import InterestingEid2 from "../../public/assets/milad-amiri/InterestingEid/image (2).jpeg";
import InterestingEid3 from "../../public/assets/milad-amiri/InterestingEid/image (3).jpeg";
// CuriousFriendsAndHope Images
import CuriousFriendsAndHope0 from "../../public/assets/milad-amiri/CuriousFriendsAndHope/image.jpeg";
import CuriousFriendsAndHope1 from "../../public/assets/milad-amiri/CuriousFriendsAndHope/image (1).jpeg";
import CuriousFriendsAndHope2 from "../../public/assets/milad-amiri/CuriousFriendsAndHope/image (2).jpeg";
import CuriousFriendsAndHope3 from "../../public/assets/milad-amiri/CuriousFriendsAndHope/image (3).jpeg";
// ChickenAndEgg Images
import ChickenAndEgg0 from "../../public/assets/milad-amiri/ChickenAndEgg/image.jpeg";
import ChickenAndEgg1 from "../../public/assets/milad-amiri/ChickenAndEgg/image (1).jpeg";
import ChickenAndEgg2 from "../../public/assets/milad-amiri/ChickenAndEgg/image (2).jpeg";
import ChickenAndEgg3 from "../../public/assets/milad-amiri/ChickenAndEgg/image (3).jpeg";
import ChickenAndEgg4 from "../../public/assets/milad-amiri/ChickenAndEgg/image (4).jpeg";
// LowBudgetBigWill Images
import LowBudgetBigWill0 from "../../public/assets/milad-amiri/LowBudgetBigWill/image.jpeg";
import LowBudgetBigWill1 from "../../public/assets/milad-amiri/LowBudgetBigWill/image (1).jpeg";
import LowBudgetBigWill2 from "../../public/assets/milad-amiri/LowBudgetBigWill/image (2).jpeg";
// DefenseToGetRoom Images
import DefenseToGetRoom0 from "../../public/assets/milad-amiri/DefenseToGetRoom/image.jpeg";
import DefenseToGetRoom1 from "../../public/assets/milad-amiri/DefenseToGetRoom/image (1).jpeg";
import DefenseToGetRoom2 from "../../public/assets/milad-amiri/DefenseToGetRoom/image (2).jpeg";
import DefenseToGetRoom3 from "../../public/assets/milad-amiri/DefenseToGetRoom/image (3).jpeg";
import DefenseToGetRoom4 from "../../public/assets/milad-amiri/DefenseToGetRoom/image (4).jpeg";
// NightTravel Images
import NightTravel0 from "../../public/assets/milad-amiri/NightTravel/image.jpeg";
import NightTravel1 from "../../public/assets/milad-amiri/NightTravel/image (1).jpeg";
// BelowZeroStart Images
import BelowZeroStart0 from "../../public/assets/milad-amiri/BelowZeroStart/image.jpeg";
import BelowZeroStart1 from "../../public/assets/milad-amiri/BelowZeroStart/image (1).jpeg";
import BelowZeroStart2 from "../../public/assets/milad-amiri/BelowZeroStart/image (2).jpeg";
import BelowZeroStart3 from "../../public/assets/milad-amiri/BelowZeroStart/image (3).jpeg";
import BelowZeroStart4 from "../../public/assets/milad-amiri/BelowZeroStart/image (4).jpeg";
import BelowZeroStart5 from "../../public/assets/milad-amiri/BelowZeroStart/image (5).jpeg";
import BelowZeroStart6 from "../../public/assets/milad-amiri/BelowZeroStart/image (6).jpeg";
import BelowZeroStart7 from "../../public/assets/milad-amiri/BelowZeroStart/image (7).jpeg";
import BelowZeroStart8 from "../../public/assets/milad-amiri/BelowZeroStart/image (8).jpeg";
// IncomeStart Images
import IncomeStart0 from "../../public/assets/milad-amiri/IncomeStart/image.jpeg";
import IncomeStart1 from "../../public/assets/milad-amiri/IncomeStart/image (1).jpeg";
import IncomeStart2 from "../../public/assets/milad-amiri/IncomeStart/image (2).jpeg";
import IncomeStart3 from "../../public/assets/milad-amiri/IncomeStart/image (3).jpeg";
import IncomeStart4 from "../../public/assets/milad-amiri/IncomeStart/image (4).jpeg";
import IncomeStart5 from "../../public/assets/milad-amiri/IncomeStart/image (5).jpeg";
// LidomaLaunch Images
import LidomaLaunch0 from "../../public/assets/milad-amiri/LidomaLaunch/image.jpeg";
import LidomaLaunch1 from "../../public/assets/milad-amiri/LidomaLaunch/image (1).jpeg";
import LidomaLaunch2 from "../../public/assets/milad-amiri/LidomaLaunch/image (2).jpeg";
import LidomaLaunch3 from "../../public/assets/milad-amiri/LidomaLaunch/image (3).jpeg";
import LidomaLaunch4 from "../../public/assets/milad-amiri/LidomaLaunch/image (4).jpeg";

function MiladAmiri() {
  return (
    <div className="pb-40 md:pb-64">
      <style>
        {`
            body {
                background-color: #F4F5F6;
            }
            @media screen and (min-width: 768px) {
              body {
                background-color: white;
              }
            }
        `}
      </style>

      <TopSection />

      <Divider className="my-24 md:my-40 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="جشن برای یک پایان خوش و شروعی دوباره"
          images={[Jashn0, Jashn1, Jashn2, Jashn3, Jashn4, Jashn5]}
          bodyText={`
        بعد از مدتی کلنجار رفتن، قدم در مسير اول، يعني انتخاب رشته برق گذاشتم. اما زمانی که وارد دانشگاه شدم، تمام تصوراتم به هم ریخت. همه ی اون چیزی که تو رشته برق به دنبالش بودم، فقط یک سراب بود، البته برای من!! به تدریج با این واقعیت روبرو شدم که خواسته های درونی من با رشته ای که در اون تحصیل می کنم همسو نیست، به علاوه محیط دانشکده برق، با روحیاتم سازگاری نداشت. چون محیط آنطور که فکر می کردم علمی و آکادمیک نبود و همین مرا نسبت به اطراف دلسرد می کرد. اما شکی ندارم که دانشکده برق اهواز، با همه خوبی و بدی هایی که داشت، در خلق نقش و شخصیت میلاد امیری، تا به این روز نقش زیادی داشت.
        چهار سالی که در آنجا سپری شد به من کمک کرد تا علایق درونیم رو کشف کنم و عواملی که وجود اونها موفقیت و اهدافم رو به تعویق می انداخت، شناسایی و درسال های بعدی از اونها دوری کنم. چهار سال دوران کارشناسی ، کم کم داشت به پایان می رسید. سال هاي آخر دانشگاه بود، مثل بقیه سردرگمی های قبل از فارغ التحصیلی رو داشتم. این موضوع برای من خیلی جدی بود و مدام از خودم می پرسیدم بالاخره می خوای چیکار کنی؟؟! قدم بعدی چیه؟ برق رو ادامه بدی؟ یه رشته جدیدی رو بخونی؟ وارد بازار کار بشی؟ و ده ها سوال دیگه که سعی می کردم پاسخی براشون پیدا کنم. در همون روزها ما داشتيم براي جشن فارغ التحصيلي آماده مي شديم.
        می خواستیم یه جشن مفصل برای فارغ التحصیلی بگیریم و همکلاسیان و دوستان دنبال کسی بودن که برنامه ریزی های قبلش رو انجام بده و یه خداحافظی به یاد موندنی از همدیگه داشته باشیم. داشتن يك سري روحيات باعث شد كه بچه ها، مديريت این جشن رو به من بسپارن. من آدم برونگرایی بودم، ارتباطات اجتماعی خوبی داشتم و وقتی پروژه ای رو شروع می کردم خودم رو ملزم می دیدم تا با حداکثر توان خودم کارها رو پیش ببرم. برای برنامه ریزی جشن شروع به تفكيك تيم، منابع انساني ، برنامه ريزي، بودجه بندي ، پيدا كردن اسپانسر و... کردم. در حالیکه هیچ پیش زمینه و تجربه ای در پیش بردن این مراسمات نداشتم و تمام کارها رو كاملا غريزي انجام می دادم.
        اونجا بود که به خودم گفتم مديريت هم مي تونه جذاب باشه!! این لحظات و تجربیات مثل روشنایی شمعی تو تاریکی بود و به مرور زمان راهي جديد به اسم مديريت و تحصيل در رشته «MBA» رو به من نشون داد. اينطور شد كه من عطاي برق رو به لقاش بخشيدم و وارد دوره ي ارشد در رشته MBA شدم.
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="انسان در جستجوی معنا"
          images={[
            InSearchOfMeaning0,
            InSearchOfMeaning1,
            InSearchOfMeaning2,
            InSearchOfMeaning3,
            InSearchOfMeaning4,
          ]}
          bodyText={`
          وقتی وارد دوره ی MBA شدم، اهدافم برام روشن بود و تو ذهنم برای آینده برنامه ریزی هایی داشتم. مي خواستم كسب و كاري و راه بندازم که با روحيات جنگنده ي من سازگاري داشته باشه و در عین حال بتونم برای تعداد زیادی کارآفرینی بکنم. به دنبال پیدا کردن معنی برای زندگی بودم، شغل و کار جزو اولویت های من بود و احساس می کردم شغلی که نیاز تعداد زیادی از افراد رو رفع کنه و آیینه ای برای انعکاس استعدادهام باشه به زندگیم معنا می بخشه. در اون زمان «ام بي اي» رو راهي براي كسب دانش لازم ، در جهت رسيدن به اهداف و روياهام مي ديدم. وقتي وارد دانشگاه تبريز شدم اولين كاري كه كردم، شبكه اي از ارتباطات رو تشكيل دادم. به اين صورت كه دانشجويان ورودي ٩٥ «ام بي اي» تبريز رو در يك گروه تلگرامي جمع كردم و حتي اين شبكه ارتباطي رو تا ساير دانشگاه ها هم گسترش دادم. همه این فعالیت ها ذخيره اي تجربي و انساني براي خواسته هاي فردي و تيمي ام بود كه قصد داشتم در آينده تشكيل بدم. روزها سپری می شد و دوره ها و ساعات آموزشیم رو در کلاس های دانشگاه تبریز می گذروندم ولی مسئله ای بود که من رو به شدت آزار می داد. من اشتیاق زیادی برای شنیدن در مورد ايده های نو و راه اندازي كسب و كارهاي جديد داشتم ولي چيزي كه با آن برخورد كردم، تمايل استادان و دانشجويان دانشگاه تبریز به مدرك گرايي و مقاله نویسی بود، برخلاف دانشگاهي مثل دانشگاه شريف. از قبل در مورد دانشگاه های مختلف و جوّی که داشتن تحقیق کرده بودم. دانشکده اهواز من رو نسبت به این مسئله حساس کرده بود و با دقت زیادی محیط رو زیر نظر داشتم. یکی از تفاوت هایی که بین دانشگاه تبریز و شریف می دیدم این بود که بيشتر دانشجويان شريف يا در فكر ايجاد كسب و كار بودند و يا در يك استارت آپ به عنوان عضوي از مجموعه فعاليت مي كردند. من راه اول یعنی راه اندازی یک کسب و کار رو انتخاب کرده بودم ولی فضا و جوّی که دانشگاه تبریز داشت باعث شده بود که همکلاسی ها و دوستانم، به معضل مدرک گرایی و مقاله نویسی، گرفتار بشن و همین مسئله پیدا کردن همراه و هم تیمی خوب رو برای من خیلی سخت و مشکل می کرد.
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="بیرون از دانشگاه چه خبر بود؟"
          images={[OutsideUni0, OutsideUni1, OutsideUni2, OutsideUni3]}
          showMainImageAtLeft
          bodyText={`
          فعالیت تنها در داخل دانشگاه انتظارات من رو برآورده نمی کرد. به همین علت به دنبال گذراندن دوره هایی خارج از دانشگاه بودم. دوره ی صادرات واردات و تجارت خارجي یکی از اونها بود. با بابک، دوستم این دوره ها رو می گذروندیم. اكثر اطرافيان من بابک رو می شناسن. ما دو نفر عقایدمون به هم نزدیک بود و یک جورهایی هم فاز بودیم، تقريبا جز اون هيچكس ديگه اي از ورودياي «ام بي اي» دانشگاه اين فعاليت ها رو جدي نمي گرفتن! منو و بابك تو دوره تجارت خارجي فهميديم كه براي وارد شدن تو كار صادرات و واردات نياز به تجربه و سرمايه بالايي هست، چيزي كه ما نداشتيم. بايد تجربيات بيشتري كسب مي كرديم، بي تجربگي هم به اندازه بي سرمايگي كار رو براي ما سخت كرده بود، همین باعث شد که به فكراستخدام شدن تو يه شركت بازرگاني افتاديم. ما نُه جا رفتيم و از همه ي اون نُه جا هم رد شديم! شرايط نا اميد كننده شد تا حدی که ناچارا تجارت خارجی رو هم فراموش کردم. اما این هیچوقت پایان راه نبود. بازم دنبال ايده هاي جديد بودم، مي دونستم كه بايد کاری کرد و حاضر بودم براش بجنگم.
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="آرزو نداشتم، هدف داشتم"
          images={[NoWishButGoal0, NoWishButGoal1, NoWishButGoal2, NoWishButGoal3]}
          bodyText={`
          راه اندازي استارت آپ جزو آرزوهايي بود كه داشتم. نه اینکه فقط یه آرزو باشه، مي خواستم اون رو تبديل به هدف كنم و براي داشتن يه استارت آپ واقعي تو تبريز كه در مسير رشد قرار بگيره، همه تلاشم رو بكنم. اوايل برام كار سختي به نظر می رسید، تصور مي كردم سرمايه آنچناني ميخواد، مي خوندم و می شنیدم كه از هر ١٠٠ استارت آپ ، ٩٩ تاش با شكست مواجه ميشه و... تو اين دوران از افكارم بودم كه بازار تبريز ٢٠١٨ هم داغ بود. شهر تبریز در سال 2018 به عنوان پایتخت کشور گردشگری کشورهای اسلامی انتخاب شده بود و قرار بود پذیرای تعداد زیادی مسافر و توریست باشه. من اين سوال رو از خودم مي پرسيدم كه چطور مي تونم از تبریز2018 پول دربیارم؟ قرار بود مسافراي زيادي به اين مناسبت ، به تبريز بيان. ولي با توجه به شناختي كه پیدا کرده بودم، مي دونستم تعداد هتل هاي تبريز پاسخگوي تقاضاي اين تعداد مسافر نخواهد نبود. تقاضا زیاد بود و عرضه به اندازه کافی وجود نداشت. براي ايجاد توازن بين عرضه و تقاضا، به فكر ظرفيتي كه اقامتگاه هاي مردمي داشتن افتادم. هر يك از شماها ممكنه يه طبقه از خونتون خالي و بلا استفاده باشه، اتاق و يا سوئيت اضافي داشته باشين. به این فک افتادم که سايت بزنم و مشخصات اين اقامتگاه هاي خالي رو تو سايت ثبت كنم تا به صورت آنلاين توسط مسافران رزرو بشه. براي شروع نياز به كمك دوستانم داشتم. با هر كسي كه صحبت مي كردم مي گفتن اين كار سخت و نشدنيه، حتي بابك. يك جورايي هم راست ميگفتن .ما تجربه ، دانش كافي ، سرمايه ، تيم خوب، دفتر كار و... نداشتيم. مي دونستم ميشه انجامش داد ولي هيچ پاسخ دقيقي در جواب سوال هاي بابك كه مي پرسيد: چطوري ميشه؟؟ نداشتم. فقط عمیقا این احساس رو داشتم که کاری باید انجام بدم، اما چطور؟؟ نمی دونستم. فشار روم زياد بود و نهایتا بيخيال اين قضيه شدم ولي موقتا!!
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="سفری که الهام بخش شد"
          images={[
            InspiringTrip0,
            InspiringTrip1,
            InspiringTrip2,
            InspiringTrip3,
            InspiringTrip4,
            InspiringTrip5,
            InspiringTrip6,
            InspiringTrip7,
            InspiringTrip8,
            InspiringTrip9,
            InspiringTrip10,
            InspiringTrip11,
            InspiringTrip12,
            InspiringTrip13,
            InspiringTrip14,
            InspiringTrip15,
          ]}
          bodyText={`
       من دانشگاه مي رفتم ، كلاسهاي فن بيان ، زبان بدن و... رو مي گذروندم، تا زماني كه به خرداد ماه ٩٦ و تعطيلي هاي قبل از امتحانات رسيديم. فكر يه سفر خارجي كم هزينه به سرم افتاد. با محمدرضا، یکی از دوستانم و یکی از کسانی که بعدها در بنیانگذاری لیدوماتریپ با من همراه شد، همسفر بودیم. مي خواستم تجربه اي جديد كسب كنم و سفر هم كه سفر بود، به يه انرژي جديد تو هوايي تازه نياز داشتم. اول به ترابزون تركيه رفتيم و مقصد بعديمون باتومي گرجستان بود. در سفر به تركيه، دنبال هتل بوديم ، به معناي واقعي كلافه كننده بود. زبان بلد نبوديم و نمي تونستيم ارتباط برقرار كنيم، تو شهري كه هيچ جايي از اون رو نمي شناختيم، توریستی بودیم که زبان نمی دونست و ارتباط برقرار کردن با هتل دارا و تخفيف گرفتن از اونها كاری سخت بود. بالاخره بعد از چند بار جابجايي و غرولندهای فراوان، واحدي كه نسبتا مناسبمون باشه رو پيدا كرديم. اين تجربه باعث شد كه براي سفر به گرجستان روش رزرو آنلاين اقامتگاه رو امتحان كنم كه تا اتفاقات تركيه دوباره تكرار نشه. از سايت بوكينگ ،یه واحد برای اقامتمون رزرو کردیم. اما شرایط رزرو برام عجيب و غير قابل باور بود. اول اینکه نيازي به پرداخت آنلاين نبود و مبلغ حضوری پرداخت می شد و دوم اینکه واحد انتخابی ما ٧٣ درصد تخفيف داشت. تصورمون اين بود كه به احتمال زياد وقتي به اونجا برسيم ، با دلايلي مانع از اقامت ما تو اون واحد ميشن و ما رسما سركاريم!! اون شب، ميزبان واحدي كه رزرو كرده بوديم به من پيام داد تا از اومدن ما مطمئن بشه. روش كار سايت بوكينگ به اين صورت بود كه اگه ما اقامتمون رو تو اين واحد كنسل می کردیم، سايت بوكينگ به عنوان خسارت مبلغي رو به ميزبانِ ما كه يه خانوم بود پرداخت می كرد. نحوه ی کار سايت بوكينگ توجهم رو جلب كرده بود و قصد داشتم بیشتر از قوانین و نحوه کارش سر دربیارم. من دوباره از ميزبان درخواست تخفيف كردم و اون هم گفت در صورتي بهت تخفيف ميدم كه رزروت رو كنسل كني و من به اندازه مبلغي كه سايت بوكينگ به عنوان خسارت پرداخت می کنه رو به شما تخفيف ميدم. تو سایت بوکینگ، مي تونستم تمامي مشخصات واحد رو تو سايت ببينم، تخفيف زيادي بگيرم و با ميزبان در ارتباط باشم. چيزي كه برام جالب بود تعهد زياد اين سايت در مقابل ميزبانانش بود. از طرفي باز هم نسبت به رزرو آنلاين كمي بدبين بودم. به همين خاطر دو واحد رو رزرو كرديم كه اگه مورد اولي سركاري باشه، حداقل يه واحد جايگزيني باشه. واحد دوم هم متعلق به ميزبان قبلي ما بود. بعد از رزرو ميزبان متوجه شد كه ما براي دومين بار رزرو كرديم. این بار بهم پيام داد و گفت: دركتون نمي كنم كه چرا اين كارو كردين! برام مثل يه بازي شده بود و مي خواستم بيشتر از كار سايت سردربيارم. اگه اقامت دوم رو هم كنسل مي كردم، سايت به ميزبان دوباره خسارت پرداخت مي كرد و ما می تونستیم دوبرابر تخفيف بگيریم، اما چیزی که بیشتر از تخفیف برام مهم بود، تعهد این سیستم در قبال میزبان ها و نحوه ی کارش بود. در سفرمان به باتومي، واحد رو از نزديك ديديدم، اقامت خوبي داشتيم و سفرمون پر از تجربه و اتفاقات خوب و چالش هاي متفاوت بود. اين رو بايد اضافه كنم كه به خاطر كاري كه كرديم خوشحال نبودم، اما تجربه اي بود كه از اون درس هاي زيادي آموختم و همونجا به درستي كار سايت بوكينگ ايمان آوردم. سفر به باتومي و كار با بوكينگ، تلنگري دوباره براي ادامه مسير كسب و كاري من بود. خواست من براي راه اندازي يك كسب و كار مثل خاكستر زير آتش بود كه وقتي از سفر باتومي به ایران برگشتم، شعله ور شد. بعد از بازگشت از این سفر، دوستانم رو برای تشکیل تیم جمع می کردم، از نحوه ی کار و فکرهایی که تو سرم داشتم می گفتم، اما سه ماه اول باز هم اين كلمات رو از زبان دوستان و اطرافيان مي شنيدم : "نميشه". تصميم گرفتم بدون تیم و به تنهايي شروع كنم. نه سرمايه اي داشتم، نه تجربه اي و نه شناختی نسبت به این صنعت. هدفم اين بود كه سايتي رو براي يكي از ميزبان هاي تبريز بزنم و واحداش رو براي اجاره تو سايت قرار بدم. از سايت هاي مختلف شماره ميزبان هاي تبريز رو پيدا می کردم و برای همکاری بهشون زنگ می زدم. هيچكسي حاضر به همكاري نبود. كار با سايت براشون سخت بود و به علت اينكه يه كسب و كار نسبتا جديدي بود اونطور كه بايد و شايد، جايي تو تفكراتشون نداشت. تا اينكه با يكي از ميزبان هاي تبريز به اسم اميد آشنا شدم. اميد به شدت از اين طرح من استقبال كرد. چون خودش با سايتي كار مي كرد كه گاهي اوقات براي فرستادن مسافر به واحد اميد، تا ٥٠ درصد ازش كميسيون مي گرفت و از اين روند ناراضي بود.
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="روزنه امیدی به نام ووردپرس"
          images={[WordPress0, WordPress1, WordPress2, WordPress3, WordPress4]}
          showMainImageAtLeft
          bodyText={`
          تصور من از راه اندازی سایت های اینترنتی، این بود که کاری سخت و مشکل هست که نیاز به دانش برنامه نویسی داره. بعد از مطالعه و تحقیق با ووردپرس آشنا شدم. همون چیزی بود که می خواستم، با ووردپرس میشد بدون داشتن دانش زیادی از کد نویسی یه کارهایی کرد. اما طراحی سایت ووردپرسی هم کاری تخصصی بود. یادگیری همیشه با رنج همراه هست، رنج یادگیری ووردپرس از نقطه صفرو بدون داشتن هیچ آموزشی، رو به جان خریدم. تمام هزينه هاي سايت با اميد بود و كار از من. شب ها و روز ها روی طراحی و محتوای سایت کار می کردم، آموزش های مروبط به ووردپرس رو می خوندم و نهایتا سايت رو بالا آوردم. همکاری دو طرفه بین امید و من باعث می شد من خودم رو در مقابل اميد متعهد ببینم و كاري رو كه پيشنهاد شروعش رو دادم به پايان برسونم. چون من بهش قول داده بودم سايت رو تا اسفند و قبل از شروع سفرهاي نوروزي تحويل بدم. اين كار براي من يك چوب دو سر طلا بود. اگر كار سايت و امید مي گرفت مي تونستم درآمدي از اين طريق داشته باشم و كارم رو در مقياس كشوري ادامه بدم. اگه شكست مي خوردم باز هم چيزي از دست نمي دادم و حداقلش اين بود كه كار با سايت هاي ووردپرسي رو ياد گرفته بودم.
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="شب هایی که خواب نداشتم!"
          images={[NightsWithNoSleep0, NightsWithNoSleep1, NightsWithNoSleep2, NightsWithNoSleep3]}
          showMainImageAtRight
          bodyText={`
          ماه ها روي سايت خودم و امید كار كردم. دوستاني كه من رو مي ديديدن بازهم انرژي منفيشون رو از من دريغ نكردن. با چه اميدي داري اين كار رو شروع مي كني؟! تو كه فرق بين دامنه و هاست رو تا دو روز پيش نميدونستي!! تو هيچ شناختي روي بازار اين كار نداري و... اينها حرفهايي بود كه مدام مي شنيدم. اما من هدفم كسب تجربه و شناخت بازار بود، حرفهاي هيچ كسي رو نمي شنيدم و تمركزم روي كار و اهدافم بود. سال هایی که گذروندم به من یاد داده بود که در مقابل حرف ها و انرژی های منفی اطرافیان، باید کور و کر بود و ادامه داد. شبانه روز تو خوابگاه روي سايت كار مي كردم، از تفريحات و خوابم زده بودم. مي دونستم كه با مطالعه و آزمون خطا مي تونم كارهام رو پيش ببرم و حتي از كساني متخصص اين كار بودن ، جلو بزنم و همين اتفاق هم افتاد. اطراف من، افرادی بودن كه دانش سئو و ووردپرس داشتن. این شب بیداری ها بی نتیجه نمونده بود و باعث شد كه حتي از اونها جلو بزنم. تا جايي كه سوالاتي برام پيش ميومد كه پاسخي براش نداشتن. اين يعني من در زمينه كاري خودم پيشرفت كرده و به روزتر بودم.
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="وینتر ایز کامینگ"
          images={[
            WinterIsComing0,
            WinterIsComing1,
            WinterIsComing2,
            WinterIsComing3,
            WinterIsComing4,
            WinterIsComing5,
            WinterIsComing6,
            WinterIsComing7,
            WinterIsComing8,
            WinterIsComing9,
            WinterIsComing10,
          ]}
          showMainImageAtLeft
          bodyText={`
          بالاخره، سايت اميد و من با سختي زياد بالا اومد. اسفند ماه سايت ما صفحه يك گوگل بود و نيمه دوم اسفند، تمام واحد هاي اميد پر از مسافر بود. تا جايي كه مجبور شدم شماره اميد رو از سايت بردارم. چون تماس هاش به قدري زياد كه وقت پاسخگويي بهشون رو نداشت. البته خیلی از تماس های امید مسافرای قبلی خودش بودن و همه اش از سایت نبود. تو همون دوران بود که با اميد به مشكل برخوردم. اون حاضر به خريد سايتي كه با زحمات زياد به صفحه يك گوگل رسونده بودمش، نشد و يه جورايي زير تمام قول و قرارهامون زد. تمام پولي كه من از اين سايت به دست آوردم حتي به يك تومن هم نرسيد و امید می گفت دیگه پرداختی ای انجام نمیده و تمام هزینه های سایت رو باید خودم به عهده بگیرم. من موندم با زحماتی که احساس می کردم هدر رفته و زمانی که تلف شده. اما ِاشتباه می کردم...
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="عیدِ هیجان انگیز"
          images={[InterestingEid0, InterestingEid1, InterestingEid2, InterestingEid3]}
          bodyText={`
          در اون زمان با دوستانم قصد سفر به كيش به رو داشتم اما از سفر جا موندم. من براي اين سفر، روي پولي كه قرار بود بابت طراحي سايت اميد به دست بيارم، حساب كرده بودم و اون حاضر به خريد سايت نشده بود، پس سفر بی سفر! به شيراز برگشتم. زمان سال تحويل بود، همه ي اتفاقات گذشته از جلو چشام رد مي شدن و ناراحت بودم. تمام شب بيداري ها، دوندگي ها و تلاشم براي يادگيري سئو و ووردپرس تو نظرم رنگ باخته بودن. با خودم ميگفتم اين بود بازار ميلياري سئو؟؟ احساس مي كردم همه ي تلاشهام بي فايده بوده و زمانم رو بي جهت براي پيشرفت تو اين بازار، از دست دادم. افكار نااميدانه، پشيماني از گذشته و نگراني از آينده ذهن من رو پر كرده بود. شب اول فروردين بود كه من به جاي شماره اميد، شماره خودم رو تو سايت قرار دادم و خوابیدم. دوم فروردين ٩٧ وقتي از خواب بيدار شدم و داشتم گوشیم رو چک می کردم. تو اون لحظه هیچی من رو به اندازه ی چیزی که رو صفحه گوشیم می دیدیم خوشحال نمی کرد. من اونروز ١٧ تماس از دست رفته از نقاط مختلف كشور داشتم. لحظه ای بود که از مدتها پیش منتظرش بودم، یکی از قشنگ ترین لحظات زندگیم بود. گوشیم زنگ می خورد ازسر شوق همه تماس ها رو جواب می دادم و عذرخواهی می کردم و می گفتم واحدام پر هستن. همون روز یکی از میزبان ها تماس گرفت گفت که شما واحد اجاره می دین، جواب دادم که واحدامون پر هست و عذرخواهی کردم. اما صدای پشت خط گفت که من میزبانم و می خوام واحدم رو توی سایتتون ثبت کنم. همون روز واحدش رو تو سایت ثبت کردم و همون شب هم براش مسافر فرستادم. این رزرو سریع، باعث شد که فردای اون روز همون میزبان 4 واحدی که متعلق به خودش و همکارانش بود رو برام ارسال کنه تا ثبت کنم. من به صورت دستی و غیر سیستمی از طریق واتس آپ و تلگرام کار های رزرو رو انجام میدادم و برای میزبان ها مسافر می فرستادم. از اون روز تا پایان عید من 5 واحد داشتم که هر روز همه ی اون 5 واحد رو با قیمتی که خیلی بالاتر از انتظار میزبان ها بود اجاره می دادم. با این اتفاقات انگیزه ای بزرگ رو در وجودم حس کردم و لیدوماتریپ در ذهن من متولد شد.
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="دوستانِ کنجکاو و امیدی که بازگشت!"
          images={[
            CuriousFriendsAndHope0,
            CuriousFriendsAndHope1,
            CuriousFriendsAndHope2,
            CuriousFriendsAndHope3,
          ]}
          bodyText={`
          بعد از عید، امید دوباره می خواست برای همکاری دوباره باهام مذاکره کنه، اما من دیگه قصد فروش سایت رو نداشتم و میزبان های زیادی هم بودن که می خواستن باهام همکاری داشته باشن و واحدشون رو توی سایت ثبت کنم . دیگه خبری از تمسخرها و نگاه های متعجب همکلاسی ها و دوستانم نبود. اونها متوجه شده بودن که ایمان من به کار و توانایی های خودم و فعالیت های چند ساله ام نتیجه داده، و حالا می خواستن از کارم سردربیارن. از طرفی برای فعالیت کشوری اعتماد به نفس و تجربه کافی رو به دست آورده بودم. می دونستم راه پرپیچ و خمی پیش رو شروع کردم، شروعی برای زندگی سختی ک هر کارآفرینی داره...
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="استارت برای استارت آپ"
          // images={["/assets/tmp/res-0.webp", "/assets/tmp/res-0.webp", "/assets/tmp/res-0.webp"]}
          bodyText={`
          تیم اولیه ما با چهار نفر تشکیل شد. هدفم این بود که با یک استراتژی مشخص، فعالیتم رو در سطح کشوری ادامه بدم. من سرمایه کافی نداشتم و البته صبرِ کافی! تو بعضی شرایط به جای راه رفتن، دویدم و حالا می خواستم به جای دویدن پرواز کنم. می خواستم هر چه سریع تر کل کشور رو بگیرم. تمام پولی که از عید و فروردین ماه به دست آورده بودم رو هزینه و واحد های جدیدی تو شهرهای جدید اضافه کردم. عطش «خواستن» برای رسیدن به «اهدافم» در وجود من به قدری قوی بود که بدون تیم با همه تنهایی ها، بدون سرمایه با دانش کم و عدم شناخت بازار شروع کردم و حالا همه ی این هارو به اضافه ی یک تیم جدید که همراهم بودن، داشتم. برای خلق برند یک پلتفرم گردشگری خیلی هیجان زده بودم. قبل از همه باید سرمایه جذب می کردیم، اما هنوز آمادگی کافی برای جذب سرمایه نداشتیم.
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="کمک گرفتن از «3F»"
          // images={["/assets/tmp/res-0.webp", "/assets/tmp/res-0.webp", "/assets/tmp/res-0.webp"]}
          bodyText={`
          بهترین راه برای پیش بردن اهدافم استفاده از «3F» بود. یعنی کمک از «fools»، «family»، «freinds». «3F» در واقع همان دوستان، خانواده و اطرافیان هستند که به عنوان یک منبع تامین سرمایه، در دوره های ابتدایی راه اندازی استارت آپ معرفی می شود. خانواده، دوستان و اطرافیان از این جهت که اعتماد کافی به فرد داشته و بدون نیاز به ضمانت و یا طرح پیچیده کسب و کار، حاضر به حمایت و کمک مالی هستن.
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="اول مرغ بود یا تخم مرغ؟"
          showMainImageAtLeft
          images={[ChickenAndEgg0, ChickenAndEgg1, ChickenAndEgg2, ChickenAndEgg3, ChickenAndEgg4]}
          bodyText={`
          کسی که می خواد کاری بزرگ انجام بده باید فرضیه ساز توانمندی هم باشه تا بتونه استراتژی کاریش رو مشخص کنه، فرضیه هایی که بعدها تبدیل به یک واقعیت میشن. فرضیه ما این بود: ما همه اون چیزی که می خواهیم رو داریم. یه سایت خفن، یه تیم کاری و همراه، دانش و تجربه کافی ، شناخت نسبت به بازار گردشگری و... حالا با چه کمبودهایی روبرو هستیم؟ دیجیتال مارکتینگ رو چیکار باید بکنیم؟ مسافر چطور باید مارو پیدا کنه؟ بدون سرمایه باید از چه راهی بریم تا زودتر به مقصدمون برسیم؟ چطور خودمون رو به رقیبان سرسخت تو این حوزه برسونیم؟ به این نتیجه رسیدیم که در شرایط کنونی، «سئو» بهترین راه و از تجربه «MVP» امیدوار کننده تر است. هر چی جلوتر می رفتیم با سوالات و چالش های بیشتری روبرو می شدیم. اگه سئو سایت خوب شد بعدش چی؟ از چه راه هایی باید در مقابل تقاضاهامون عرضه کننده پیدا کنیم؟ از راه های مختلفی مسیر آینده رو پیش بینی می کردیم و باز به داستان همیشگی استارت آپ ها می رسیدیم. اول مرغ بود یا تخم مرغ؟
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="سرمایه ی کوچک، اراده ی بزرگ"
          images={[LowBudgetBigWill0, LowBudgetBigWill1, LowBudgetBigWill2]}
          bodyText={`
          برای شبیه سازی فرضیاتم در دنیای واقعی، به سرمایه نیاز داشتم. باید حداقل سرمایه رو جور می کردم و سایت ها رو گسترش می دادم. نیاز به حداقل سرمایه برای درجا نزدن ، کسب تجربه و آماده کردن زیر ساخت ها برای هدف بزرگم داشتم. از چند نفری کمک خواستیم که اونها درگیری های خودشون رو داشتن و یا نمی خواستن کمک کنن. نهایتا یکی از دوستانم مبلغی که می خواستیم رو به ما قرض داد. حالا ما سرمایه حداقلی سرمایه و یک تیم داشتیم. فعالیت در بیشتر از 20 شهر رو برنامه ریزی کردیم و کارمون رو از خوابگاه شروع کردیم.
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="دفاعیه ای که مارو صاحب دفتر کار کرد"
          showMainImageAtLeft
          images={[
            DefenseToGetRoom0,
            DefenseToGetRoom1,
            DefenseToGetRoom2,
            DefenseToGetRoom3,
            DefenseToGetRoom4,
          ]}
          bodyText={`
          با انگیزه و انرژی زیادی کار می کردیم. با هر پیشرفتی، پرانرژی تر از قبل ادامه می دادیم. ما تیم بودیم و به آینده ای که هنوز نیومده بود ایمان داشتیم. کم کم به فکر گرفتن دفتر کار افتادیم. به همین منظور تو مرکز نوآوری دانشگاه تبریز، از طرحمون دفاع کردیم، طرح پذیرفته شد و یک دفتر کار در اختیار ما قرار داده شد و ما کارمون رو در دفتری تو این مرکز ادامه دادیم. اوایل بچه ها کارها رو تو دفتر انجام می دادن، اما رفته رفته تنوع کارها کم می شد و همزمان انگیزه و ذوق اولیه بچه ها هم با اون کمتر شده بود. تا جایی که دیگه دفتر نمیومدن. هر چی جلوتر می رفتیم شرایط سخت تر می شد، اومدن از صفحه 7 گوگل به 4 راحت تر از اومدن از صفحه 4 به 3 هست. تمرکز هم تیمی ها از روی کار برداشته شده بود، تنها چیزی که باعث می شد ادامه بدن صمیمیت و دوستی هامون بود اما امید و انگیزه ای نمونده بود. آذر ماه 97 از راه رسید. باز هم فقط خودم بودم و خودم... سایت ها باید دائم آپدیت می شدن، سئو تقویت می شد، میزبان پیدا می کردم، پلتفرمی که باید راه اندازی می شد رو طراحی می کردم، ولی تنهایی فایده ای نداشت و وقت برای تشکیل تیم کم بود. عید کم کم داشت می رسید. احساس می کردم باز هم راه رو اشتباهی اومدم...
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="سفر شبانه ای که نتیجه اش لانچ لیدوماتریپ بود"
          images={[NightTravel0, NightTravel1]}
          bodyText={`
          شب و روز پشت سیستم در حال کار کردن بودم. سایت ها رو آپدیت و روی سئو کار می کردم. شب ها به قدری روی استراتژی و اهدافم فکر می کردم که نمی تونستم بخوابم، به هم ریخته بودم. روزهای سختی بود. با برنامه نویس های مختلفی صحبت کردم، اونها رقابت رو سخت می دیدن و دارایی من رو کوچک، به همین خاطر تشکیل تیمی که می خواستم دائم به تعویق می افتاد. یکی از دوستانم که تو شیراز پایتون کار بود، پیشنهاد همکاری با شرکتی که توش کار می کرد رو داد. ساعت 2:30 نصف شب بود، بلیط گرفتم و راهی شیراز شدم. تو شیراز دنبال سرمایه گذار برای راه اندازی پلتفرم اصلی و استخدام کارمند بودم. ولی هر کدوم از سرمایه گذارا یه ایرادی می گرفتن. هر کاری می کردم نمی شد، نا امید شده بودم اما نمی خواستم کم بیارم. تا اینکه یکی از دوستام به اسم محمدرضا شهریور رو دیدم. آقای شهریور یکی از دوستان من بود و وقتی روحیه، باور و ثابت قدمی من رو دید پیشنهاد سرمایه گذاری زیر 100 میلیون رو در قبال سهام بهم داد. من منتظر این موقعیت بودم و ما باهم قرارداد بستیم. بلافاصله به تبریز برگشتم تا استارت یک پلتفرم گردشگری را بزنم. با یکی از دوستان برنامه نویسم صحبت کردم تا کار رو شروع کنیم. نهایتا پلتفرم گردشگری «لیدوماتریپ» پس از سختی ها و دوندگی های فراوان، ثبت شد. قدم بزرگی بود و من خوشحال ترین بودم، اما مشکلات تمومی نداشتن. من تنها بودم و تیم قبلی، تیم قابل قبولی برای ادامه برنامه های لیدوما نبود. زمان کم بود و باید تیمی جدید تشکیل میدادم. تیمی جدی و فعال که با نهایت سرعت، به سوی اهدافمان حرکت کنیم.
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="از صفر نه، از زیر صفر شروع کردیم"
          images={[
            BelowZeroStart0,
            BelowZeroStart1,
            BelowZeroStart2,
            BelowZeroStart3,
            BelowZeroStart4,
            BelowZeroStart5,
            BelowZeroStart6,
            BelowZeroStart7,
            BelowZeroStart8,
          ]}
          showMainImageAtLeft
          bodyText={`
          تیم جدید رو با حقوق تشکیل دادیم. و باید از صفر تا صد آموزش هارو به تیم جدید می دادم. فصل پاییز و زمستان بود، سفرها کم شده بود و از نظر مالی در وضعیت خوبی نبودیم. با خودم می گفتم اگه برای پرداخت حقوق کارمندا با مشکل مواجه شدم نهایتش اینه که لپ تاپ و گوشیم رو می فروشم و به همین خاطر فقط به اندازه قیمت گوشی و لپ تاپم نیرو استخدام کردم. در این زمان ها بود که پیشنهادی برای خریدن سایت تبریز که مدت ها برای بالا آوردنش زحمت کشیده بودم دریافت کردم. اوایل قصد فروشش رو نداشتم چون تقریبا کل درآمد من از شهر تبریز بود و با فروشش علنا درامد ماهانه ام رو به صفر میرسوندم و وضعیت خیلی خطرناکی میشد. با خودم گفتم محتاط نباش ریسک کن و نهایتا ریسکش رو پذیرفتم. پولی که بابت فروش این سایت به دستم می رسید، تا حدی دغدغه های مالی من رو برای حداقل 2 ماه کم تر می کرد و باور داشتم با این مبلغ و جذب نیروهای بیشتر می تونیم درآمدمون رو از لیدوما بیشتر کنیم.
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="شروع درآمدزایی از سایر شهرها با تیم جدید"
          images={[
            IncomeStart0,
            IncomeStart1,
            IncomeStart2,
            IncomeStart3,
            IncomeStart4,
            IncomeStart5,
          ]}
          bodyText={`
          ماه اول بدون درآمد گذشت. اما کم کم، درآمد از تیم جدید شروع شد. در کنار همه کارهایی که انجام می دادیم، روی دیجیتال مارکتینگ شهرهای جدید هم کار می کردیم. تماس ها زیاد می شد و تامین کننده نداشتیم. به زبان ساده تر، مسافر داشتیم ولی میزبان کم بود. تیم گرم رشد بود، به اندازه حداقل نیازهامون فروش داشتیم و تمام برنامه هامون رو جوری می چیدیم که به اندازه تقاضا، فروش داشته باشیم. در هر شهری که مسافرهامون زیاد می شد، به طور موقت، شماره تماس هارو از سایت برمی داشتیم تا تیم فقط درگیر فروش و یک شهر نباشه و تمرکز بیشتر روی رشد باشه و تامین کننده به همه سایت ها اضافه کنیم و وقتی تعداد تامین کننده به حد قابل قبولی می رسید، فروش رو شروع می کردیم. بعد از دو ماه فعالیت های لیدوما از هر نظری، به چند برابر از زمان شروعش رسید. و این یک رشد فضایی برای ما بود.
        `}
        />
      </div>

      <Divider className="my-24 md:!border-b-transparent" height="12px" bg="white" />

      <div className="CustomContainer">
        <Section
          title="لیدوما لانچ شد در حالی که:"
          images={[LidomaLaunch0, LidomaLaunch1, LidomaLaunch2, LidomaLaunch3, LidomaLaunch4]}
          bodyText={`
          1- بیش از 12 نفر درمجموعه لیدوما آماده فعالیت تخصصی بودند. (آمادگی از نظر تیم) 
          2- وبسایت لیدوماتریپ با زبان برنامه نویسی قوی پایتون و یک سیستم فوق العاده قوی «ERP» از اسفند 97 شروع به رزرو آنلاین کرد. (آمادگی از نظر زیرساخت هدفمند طراحی شده با تکنولوژی فوق العاده قوی Python ERP)  
          3- هنگام شروع به کار، لیدوما در بیش از 20 شهر کشوردر صفحه یک گوگل بود و روزانه بیش از 300 درخواست رزرو اقامتگاه داشتیم (آمادگی از نظر تقاضا). 
          4- موقع شروع به کارلیدوما، بیش از 800 اقامتگاه آماده همکاری داشتیم (آمادگی از نظر تامین کننده) 
        `}
        />
      </div>

      <div className="CustomContainer">
        <ContactMiladAmiri wrapperClassname="mt-[96px] " />
      </div>
    </div>
  );
}

export default MiladAmiri;
