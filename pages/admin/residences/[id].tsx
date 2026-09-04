import { useState  , useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import dynamic from "next/dynamic";
import AdminLayout from "@/components/Admin/Layout";
import ResidenceImagesModal from "@/components/Admin/Residence/ImagesModal";
import StateChangeModal from "@/components/Admin/Residence/StateChangeModal";
import CalendarTab from "@/components/Admin/Residence/CalendarTab";
import LocationTab from "@/components/Admin/Residence/LocationTab";
import StatsTab from "@/components/Admin/Residence/StatsTab";
import ReviewsTab from "@/components/Admin/Residence/ReviewsTab";
import DocumentsTab from "@/components/Admin/Residence/DocumentsTab";
import { apiFetch } from "@/api/Admin/adminApi";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  Select,
  Skeleton,
  Stars,
  Toggle,
  adminImageUrl,
  faDate,
  faMoney,
  faId,
  faNum,
} from "@/components/Admin/ui";
import CapacityTab from "@/components/Admin/Residence/CapacityTab";
import AmenitiesTab from "@/components/Admin/Residence/AmenitiesTab";
import PricingTab from "@/components/Admin/Residence/PricingTab";
import RulesTab from "@/components/Admin/Residence/RulesTab";
import ReservationsTab from "@/components/Admin/Residence/ReservationsTab";
import RankCard from "@/components/Admin/Residence/RankCard";
import ClassificationCard from "@/components/Admin/Residence/ClassificationCard";
import SuspensionCard from "@/components/Admin/Residence/SuspensionCard";
import DefectsCard from "@/components/Admin/Residence/DefectsCard";
import PendingChangesCard from "@/components/Admin/Residence/PendingChangesCard";
import ChangeHostModal from "@/components/Admin/Residence/ChangeHostModal";

// leaflet touches window on import
const LocationPicker = dynamic(() => import("@/components/Admin/LocationPicker"), { ssr: false });

interface ResidenceDetail {
  id: number;
  publicId: number;
  reference: string | null;
  name: string;
  name2: string | null;
  hostSuggestedName: string | null;
  description: string | null;
  type: "SUIT" | "BOOMGARDI" | "HOTEL";
  state: string;
  published: boolean;
  deactivatedAt: string | null;
  deactivationNote: string | null;
  suspendedAt: string | null;
  suspensionInternalNote: string | null;
  suspensionReason: string | null;
  pendingChanges: Record<string, any> | null;
  pendingChangesSubmittedAt: string | null;
  defects: {
    id: number;
    section:
      | "DETAILS"
      | "SPECS"
      | "LOCATION"
      | "CAPACITY"
      | "AMENITIES"
      | "PRICING"
      | "GALLERY"
      | "DOCUMENTS"
      | "RULES"
      | "OTHER";
    severity: "MANDATORY" | "SUGGESTED";
    description: string;
    createdAt: string;
    reviewRequestedAt: string | null;
    resolvedAt: string | null;
  }[];
  importance: number;
  averageRating: number;
  reviewsCount: number;
  region: string | null;
  rentType: string | null;
  neighborhood: string | null;
  address: string | null;
  invoiceAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  floor: string | null;
  foundationArea: number | null;
  totalArea: number | null;
  capacity: number | null;
  maxCapacity: number | null;
  weekPrice: number | null;
  weekendPrice: number | null;
  peakPrice: number | null;
  createdAt: string;
  updatedAt: string;
  reservationsCount: number;
  location: { id: number; name: string; parent: { name: string } | null } | null;
  host: {
    id: number;
    name: string | null;
    phone: string;
    avatarUrl: string | null;
    verificationStatus: string;
    isSpecialHost: boolean;
    residencesCount: number;
  } | null;
  images: { id: number; url: string; isMain: boolean; title: string | null; alt: string | null; sortOrder: number }[];
  distances: { id: number; placeName: string; distance: string | null; eta: string | null }[];
  extraLocations: { id: number; location: { id: number; name: string } }[];
  rooms: {
    id: number;
    name: string;
    singleBed: number;
    doubleBed: number;
    traditionalBed: number;
    description: string | null;
  }[];
  amenities: {
    amenity: { id: number; name: string; category: string | null };
    extraFeatures: { value?: string; extra?: Record<string, string> } | null;
  }[];
  rules: { rule: { id: number; name: string }; value: unknown }[];
  otherAmenities: string | null;
  extraGuestsPrice: number | null;
  extraGuestsPeakPrice: number | null;
  weeklyDiscount: number | null;
  monthlyDiscount: number | null;
  checkinFrom: string | null;
  checkinTo: string | null;
  checkout: string | null;
  minReservableDays: number | null;
  rulesDesc: string | null;
  hostRulesText?: string;
  hostRuleNotes?: Record<string, string>;
  cancellationPolicy: string | null;
  extraRules: Record<string, unknown> | null;
}

const TYPE_LABEL: Record<string, string> = {
  SUIT: "ویلا و سوئیت",
  BOOMGARDI: "بوم‌گردی",
  HOTEL: "هتل",
};

const STATE: Record<string, { label: string; tone: "green" | "yellow" | "red" | "gray" }> = {
  PUBLISHED: { label: "فعال", tone: "green" },
  PENDING: { label: "در انتظار تایید", tone: "yellow" },
  DRAFT: { label: "پیش‌نویس", tone: "gray" },
  REJECTED: { label: "رد شده", tone: "red" },
  DEACTIVATED: { label: "غیرفعال", tone: "red" },
  DELETED: { label: "حذف شده", tone: "gray" },
};

const TABS = [
  { key: "basic", label: "اطلاعات پایه" },
  { key: "location", label: "موقعیت مکانی" },
  { key: "capacity", label: "ظرفیت" },
  { key: "amenities", label: "امکانات" },
  { key: "rules", label: "قوانین و مقررات" },
  { key: "pricing", label: "نرخ اقامتگاه" },
  { key: "reservations", label: "رزروها" },
  { key: "calendar", label: "تقویم اقامتگاه" },
  { key: "stats", label: "آمار اقامتگاه" },
  { key: "reviews", label: "نظرات" },
  { key: "documents", label: "مدرک مالکیت" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-x-8 py-10 border-b border-gray-F0F0F0 last:border-0">
      <span className="text-13 leading-20 text-gray-6C6A7D shrink-0">{label} :</span>
      {/* free-text values (description, address) keep their line breaks */}
      <span className="text-13 leading-20 text-black break-words whitespace-pre-line">
        {value || "—"}
      </span>
    </div>
  );
}

export default function AdminResidenceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [showEdit, setShowEdit] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [showHost, setShowHost] = useState(false);
  // Which state the modal is about to move this listing to; null = closed.
  // Every state change goes through it, because every one of them needs a note.
  const [pendingState, setPendingState] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("basic");

  // The URL carries the کد اقامتگاه. Only this one request accepts it; the
  // server resolves it and hands back the internal id, which everything below
  // uses. The two numbers collide on 1,640 listings, so a write addressed by
  // the wrong one would edit a different residence.
  const { data, isLoading, mutate, error } = useSWR<ResidenceDetail>(
    id ? `/api/admin/residences/${id}` : null,
    (path: string) => apiFetch<ResidenceDetail>(path)
  );

  // Old panel bookmarks hold the internal id. The server answers those with
  // the code they should have used, so the page corrects its own address
  // rather than showing a dead end.
  useEffect(() => {
    const canonical = (error as { details?: { canonicalId?: number } } | undefined)?.details
      ?.canonicalId;
    if (canonical) router.replace(`/admin/residences/${canonical}`);
  }, [error, router]);

  async function patch(body: Record<string, unknown>) {
    if (!data) return;
    await apiFetch(`/api/admin/residences/${data.id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    mutate();
  }

  const mainImage = data?.images.find((i) => i.isMain) ?? data?.images[0];

  return (
    <AdminLayout
      title={data?.name ?? "جزئیات اقامتگاه"}
      breadcrumb={
        <>
          <Link href="/admin">داشبورد</Link> / <Link href="/admin/residences">اقامتگاه‌ها</Link>
          {!!data && <> / کد اقامتگاه {faId(data.publicId)}</>}
        </>
      }
      toolbar={
        <Card className="px-8 py-6 flex items-center gap-x-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={`px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap transition ${
                tab === t.key
                  ? "bg-primary-main text-white"
                  : "text-gray-6C6A7D hover:bg-gray-F0F0F0"
              }`}
            >
              {t.label}
            </button>
          ))}
        </Card>
      }
    >
      {isLoading && (
        <div className="flex flex-col gap-16">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[120px]" />
        </div>
      )}

      {data && tab === "capacity" && (
        <CapacityTab
          residenceId={data.id}
          capacity={data.capacity}
          maxCapacity={data.maxCapacity}
          rooms={data.rooms}
          onSaved={mutate}
        />
      )}

      {data && tab === "amenities" && (
        <AmenitiesTab
          residenceId={data.id}
          amenities={data.amenities}
          otherAmenities={data.otherAmenities}
          onSaved={mutate}
        />
      )}

      {data && tab === "pricing" && (
        <PricingTab
          residenceId={data.id}
          pricing={{
            weekPrice: data.weekPrice,
            weekendPrice: data.weekendPrice,
            peakPrice: data.peakPrice,
            extraGuestsPrice: data.extraGuestsPrice,
            extraGuestsPeakPrice: data.extraGuestsPeakPrice,
            weeklyDiscount: data.weeklyDiscount,
            monthlyDiscount: data.monthlyDiscount,
          }}
          onSaved={mutate}
        />
      )}

      {data && tab === "rules" && (
        <RulesTab
          residenceId={data.id}
          rules={data.rules}
          values={{
            checkinFrom: data.checkinFrom,
            checkinTo: data.checkinTo,
            checkout: data.checkout,
            minReservableDays: data.minReservableDays,
            capacity: data.capacity,
            rulesDesc: data.rulesDesc,
            hostRulesText: data.hostRulesText,
            cancellationPolicy: data.cancellationPolicy,
            extraRules: data.extraRules,
          }}
          onSaved={mutate}
        />
      )}

      {data && tab === "reservations" && <ReservationsTab residenceId={data.id} />}

      {data && tab === "calendar" && <CalendarTab residenceId={data.id} />}

      {data && tab === "location" && (
        <LocationTab residenceId={data.id} residence={data} onSaved={mutate} />
      )}

      {data && tab === "stats" && <StatsTab residenceId={data.id} />}

      {data && tab === "reviews" && <ReviewsTab residenceId={data.id} />}

      {data && tab === "documents" && <DocumentsTab residenceId={data.id} />}

      {data && tab === "basic" && (
        <div className="flex gap-x-16 items-start">
          {/* action rail */}
          <Card className="p-12 w-[200px] shrink-0 flex flex-col gap-y-8 sticky top-[76px]">
            <Button onClick={() => setShowEdit(true)}>
              <i className="icon-Edit text-16" /> ویرایش یکجا اطلاعات
            </Button>
            <a
              href={`/rentals/${data.publicId}`}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <Button variant="secondary" className="w-full">
                <i className="icon-See text-16" /> مشاهده در فرانت
              </Button>
            </a>
            <Button
              variant={data.state === "PUBLISHED" ? "danger" : "primary"}
              onClick={() => setPendingState(data.state === "PUBLISHED" ? "DEACTIVATED" : "PUBLISHED")}
            >
              <i className="icon-Power text-16" />
              {data.state === "PUBLISHED" ? "غیرفعال کردن" : "فعال کردن"}
            </Button>
            <Button variant="secondary" onClick={() => setPendingState("DELETED")}>
              <i className="icon-Delete text-16" /> حذف اقامتگاه
            </Button>
          </Card>

          <div className="flex-1 min-w-0 flex flex-col gap-y-16">
            {/* gallery */}
            <Card className="p-16">
              {data.images.length === 0 ? (
                <EmptyState text="تصویری بارگذاری نشده" />
              ) : (
                <div className="flex gap-x-8 overflow-x-auto pb-8">
                  {data.images.map((img) => (
                    <div key={img.id} className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={adminImageUrl(img.url, 640)}
                        alt={img.title ?? data.name}
                        className="h-[130px] w-[200px] object-cover rounded-10"
                        loading="lazy"
                      />
                      {img.isMain && (
                        <span className="absolute top-8 right-8 bg-white/95 rounded-8 px-8 py-2 text-11 font-m">
                          تصویر اصلی
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-x-8 mt-12">
                <Button onClick={() => setShowImages(true)}>
                  <i className="icon-Edit text-16" /> مشاهده و ویرایش تصاویر
                </Button>
                <Button variant="secondary" onClick={() => setShowImages(true)}>
                  <i className="icon-Upload text-16" /> بارگذاری تصویر جدید
                </Button>
              </div>
            </Card>

            {data.state === "DEACTIVATED" && (
              <Card className="px-16 py-14 border-r-4 border-r-[#E11D48] bg-[#FEF2F2]">
                <div className="flex items-start gap-x-10">
                  <i className="icon-WarningFill text-18 text-[#E11D48] mt-2 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-14 leading-24 font-b text-black">
                      این اقامتگاه غیرفعال است
                      {!!data.deactivatedAt && (
                        <span className="font-r text-gray-6C6A7D"> — از {faDate(data.deactivatedAt)}</span>
                      )}
                    </p>
                    {!!data.deactivationNote && (
                      <p className="mt-4 text-13 leading-22 text-black">{data.deactivationNote}</p>
                    )}
                    <p className="mt-6 text-12 leading-20 text-gray-6C6A7D">
                      صفحه‌ی اقامتگاه در سایت باز است و همه‌ی اطلاعاتش دیده می‌شود، ولی از نتایج
                      جستجو حذف شده و باکس رزروش بسته است.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* status strip */}
            <Card className="px-16 py-12 flex items-center gap-x-16 flex-wrap gap-y-10 text-13">
              <span className="text-gray-6C6A7D">
                کد اقامتگاه : <span className="text-black font-m">{faId(data.publicId)}</span>
              </span>
              <span className="w-px h-16 bg-gray-E5E5E6" />
              <Stars value={data.averageRating} count={data.reviewsCount} />
              <span className="w-px h-16 bg-gray-E5E5E6" />
              <span className="text-gray-6C6A7D">
                اهمیت : <span className="text-black font-m">{faId(data.importance)}</span>
              </span>
              <span className="w-px h-16 bg-gray-E5E5E6" />
              <Badge tone={STATE[data.state]?.tone ?? "gray"}>
                {STATE[data.state]?.label ?? data.state}
              </Badge>
              <label className="flex items-center gap-x-8 text-gray-6C6A7D">
                <Toggle
                  checked={data.published}
                  onChange={(v) => setPendingState(v ? "PUBLISHED" : "DEACTIVATED")}
                />
                منتشر شده
              </label>
              <Badge tone="purple">{TYPE_LABEL[data.type]}</Badge>
              <span className="w-px h-16 bg-gray-E5E5E6" />
              <span className="text-gray-6C6A7D">تاریخ ایجاد : {faDate(data.createdAt)}</span>
              <span className="text-gray-6C6A7D">آخرین بروزرسانی : {faDate(data.updatedAt)}</span>
            </Card>

            {/* host strip */}
            {!!data.host && (
              <Card className="px-16 py-12 flex items-center gap-x-16 flex-wrap gap-y-10 text-13">
                <Badge tone="purple">میزبان</Badge>
                <Link
                  href={`/admin/users/${data.host.id}`}
                  className="flex items-center gap-x-8 text-primary-dark font-m"
                >
                  <span className="w-28 h-28 rounded-full bg-gray-F0F0F0 flex items-center justify-center text-11 overflow-hidden">
                    {data.host.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={adminImageUrl(data.host.avatarUrl, 96)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (data.host.name?.[0] ?? "؟")
                    )}
                  </span>
                  {data.host.name ?? "بدون نام"}
                </Link>
                <span className="text-gray-6C6A7D">{data.host.phone}</span>
                <span className="w-px h-16 bg-gray-E5E5E6" />
                <span className="text-gray-6C6A7D">
                  وضعیت همکاری :{" "}
                  <Badge tone={data.host.verificationStatus === "CONFIRMED" ? "green" : "yellow"}>
                    {data.host.verificationStatus === "CONFIRMED" ? "تأیید همکاری" : "در انتظار تایید"}
                  </Badge>
                </span>
                {data.host.isSpecialHost && <Badge tone="blue">میزبان ویژه</Badge>}
                <Badge tone="gray">{faNum(data.host.residencesCount)} اقامتگاه</Badge>
                <Button
                  variant="secondary"
                  className="mr-auto"
                  onClick={() => setShowHost(true)}
                >
                  <i className="icon-Refresh text-16" /> تغییر میزبان
                </Button>
              </Card>
            )}

            {!!data.pendingChanges && Object.keys(data.pendingChanges).length > 0 && (
              <PendingChangesCard
                residenceId={data.id}
                residence={data}
                pendingChanges={data.pendingChanges}
                submittedAt={data.pendingChangesSubmittedAt}
                onSaved={() => mutate()}
              />
            )}

            <SuspensionCard
              residenceId={data.id}
              suspendedAt={data.suspendedAt}
              suspensionReason={data.suspensionReason}
              onSaved={() => mutate()}
            />

            <DefectsCard residenceId={data.id} defects={data.defects} onSaved={() => mutate()} />

            <ClassificationCard residenceId={data.id} onSaved={mutate} />

            <RankCard residenceId={data.id} onSaved={mutate} />

            {/* specs */}
            <Card className="p-20">
              <h3 className="text-16 leading-24 font-m text-black mb-12">مشخصات اقامتگاه</h3>
              <div className="grid md:grid-cols-2 gap-x-32">
                <div>
                  <Row label="نام در صفحه اقامتگاه" value={data.name} />
                  <Row label="نام پیشنهادی میزبان" value={data.hostSuggestedName} />
                  <Row
                    label="نام در صفحات لیست"
                    value={[data.location?.parent?.name, data.location?.name].filter(Boolean).join(" / ")}
                  />
                  <Row label="نوع ملک" value={TYPE_LABEL[data.type]} />
                </div>
                <div>
                  <Row
                    label="دیگر شهرهای اقامتگاه"
                    value={
                      data.extraLocations.length
                        ? data.extraLocations.map((c) => c.location.name).join(" / ")
                        : "هیچ کدام"
                    }
                  />
                  <Row
                    label="مساحت کل زمین"
                    value={data.totalArea ? `${faNum(data.totalArea)} متر` : null}
                  />
                  <Row
                    label="مساحت زیربنای اقامتگاه"
                    value={data.foundationArea ? `${faNum(data.foundationArea)} متر` : null}
                  />
                  <Row label="طبقه" value={data.floor} />
                  <Row
                    label="ظرفیت"
                    value={
                      data.capacity
                        ? `${faNum(data.capacity)} نفر (حداکثر ${faNum(data.maxCapacity)})`
                        : null
                    }
                  />
                  <Row label="قیمت هفته" value={faMoney(data.weekPrice)} />
                </div>
              </div>
              <Row label="درباره اقامتگاه" value={data.description} />
              <div className="mt-12">
                <Button variant="secondary" onClick={() => setShowEdit(true)}>
                  <i className="icon-Edit text-16" /> ویرایش اطلاعات
                </Button>
              </div>
            </Card>

            {/* rooms — beds and the host's own description of each. Entered on
                the capacity tab and, until now, visible nowhere else: the page
                showed a total capacity and nothing about what makes it up. */}
            <Card className="p-20">
              <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8 mb-12">
                <h3 className="text-16 leading-24 font-m text-black">
                  اتاق‌ها
                  <span className="text-13 font-r text-gray-6C6A7D">
                    {" "}
                    — {faNum(data.rooms.length)} اتاق
                  </span>
                </h3>
                <Button variant="secondary" onClick={() => setTab("capacity")}>
                  <i className="icon-Edit text-16" /> ویرایش ظرفیت و اتاق‌ها
                </Button>
              </div>

              {data.rooms.length === 0 ? (
                <EmptyState text="اتاقی ثبت نشده" />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {data.rooms.map((r) => {
                    const beds = [
                      r.doubleBed ? `${faNum(r.doubleBed)} تخت دونفره` : null,
                      r.singleBed ? `${faNum(r.singleBed)} تخت یک‌نفره` : null,
                      r.traditionalBed ? `${faNum(r.traditionalBed)} رخت‌خواب سنتی` : null,
                    ].filter(Boolean);

                    return (
                      <div key={r.id} className="rounded-12 border border-gray-E5E5E6 p-12">
                        <p className="text-13 leading-20 font-m text-black mb-4">{r.name}</p>
                        <p className="text-11 leading-18 text-gray-9B9BAA">
                          {beds.length ? beds.join(" · ") : "تختی ثبت نشده"}
                        </p>
                        {r.description && (
                          <p className="mt-8 text-12 leading-20 text-gray-6C6A7D whitespace-pre-line break-words">
                            {r.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* address */}
            <Card className="p-20">
              <h3 className="text-16 leading-24 font-m text-black mb-12">آدرس</h3>
              <Row label="استان" value={data.location?.parent?.name} />
              <Row label="شهر" value={data.location?.name} />
              <Row label="محله" value={data.neighborhood} />
              <Row label="آدرس در فرانت" value={data.address} />
              <Row label="آدرس در فاکتور" value={data.invoiceAddress} />

              {/* Pin is editable in place — click or drag saves immediately. */}
              <div className="mt-12">
                <LocationPicker
                  lat={data.latitude}
                  lng={data.longitude}
                  onChange={(lat, lng) => patch({ latitude: lat, longitude: lng })}
                />
                <div className="flex items-center justify-between mt-8 text-12 text-gray-6C6A7D">
                  <span>
                    {data.latitude != null && data.longitude != null
                      ? `${data.latitude.toFixed(6)} , ${data.longitude.toFixed(6)}`
                      : "موقعیتی ثبت نشده"}
                  </span>
                  {data.latitude != null && data.longitude != null && (
                    <a
                      href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-dark font-m"
                    >
                      باز کردن در گوگل مپ ↗
                    </a>
                  )}
                </div>
              </div>

              {data.distances.length > 0 && (
                <div className="mt-16">
                  <h4 className="text-14 leading-22 font-m text-black mb-8">
                    فاصله تا جاذبه‌های گردشگری {data.location?.name}
                  </h4>
                  <ul className="flex flex-col gap-y-6">
                    {data.distances.map((d) => (
                      <li key={d.id} className="text-13 leading-20 text-gray-6C6A7D">
                        {d.distance ?? "—"} <span className="mx-6">←</span> تا {d.placeName}
                        {!!d.eta && <span className="text-gray-9B9BAA"> ({d.eta})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-12">
                <Button variant="secondary" onClick={() => setShowAddress(true)}>
                  <i className="icon-Edit text-16" /> ویرایش آدرس
                </Button>
              </div>
            </Card>

            {/* amenities & rules summary */}
            <section className="grid lg:grid-cols-2 gap-16">
              <Card className="p-20">
                <h3 className="text-16 leading-24 font-m text-black mb-12">
                  امکانات ({faNum(data.amenities.length)})
                </h3>
                {data.amenities.length === 0 ? (
                  <EmptyState text="امکاناتی ثبت نشده" />
                ) : (
                  <div className="flex flex-wrap gap-6">
                    {data.amenities.map((a) => (
                      <Badge key={a.amenity.id} tone="gray">
                        {a.amenity.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
              <Card className="p-20">
                <h3 className="text-16 leading-24 font-m text-black mb-12">
                  قوانین ({faNum(data.rules.length)})
                </h3>
                {data.rules.length === 0 ? (
                  <EmptyState text="قانونی ثبت نشده" />
                ) : (
                  <ul className="flex flex-col gap-y-6">
                    {data.rules.map((r) => (
                      <li
                        key={r.rule.id}
                        className="flex items-center justify-between text-13 leading-20"
                      >
                        <span className="text-gray-6C6A7D">{r.rule.name}</span>
                        <span className="text-black font-m">{String(r.value ?? "—")}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </section>
          </div>
        </div>
      )}

      {data && (
        <>
          <EditSpecsModal
            open={showEdit}
            residence={data}
            onClose={() => setShowEdit(false)}
            onSaved={() => {
              setShowEdit(false);
              mutate();
            }}
          />
          <EditAddressModal
            open={showAddress}
            residence={data}
            onClose={() => setShowAddress(false)}
            onSaved={() => {
              setShowAddress(false);
              mutate();
            }}
          />
          <ChangeHostModal
            open={showHost}
            onClose={() => setShowHost(false)}
            residenceId={data.id}
            currentHostId={data.host?.id ?? null}
            onSaved={mutate}
          />
          <ResidenceImagesModal
            open={showImages}
            onClose={() => setShowImages(false)}
            residenceId={data.id}
            images={data.images}
            onChanged={mutate}
          />
          <StateChangeModal
            open={pendingState !== null}
            onClose={() => setPendingState(null)}
            ids={[data.id]}
            state={pendingState ?? "DEACTIVATED"}
            currentState={data.state}
            onSaved={mutate}
          />
        </>
      )}
    </AdminLayout>
  );
}

function EditSpecsModal({
  open,
  residence,
  onClose,
  onSaved,
}: {
  open: boolean;
  residence: ResidenceDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: residence.name,
    hostSuggestedName: residence.hostSuggestedName ?? "",
    description: residence.description ?? "",
    type: residence.type,
    region: residence.region ?? "",
    rentType: residence.rentType ?? "",
    floor: residence.floor ?? "",
    totalArea: residence.totalArea ?? "",
    foundationArea: residence.foundationArea ?? "",
    importance: residence.importance ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residence.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          hostSuggestedName: form.hostSuggestedName || undefined,
          description: form.description || undefined,
          type: form.type,
          floor: form.floor || undefined,
          totalArea: form.totalArea === "" ? undefined : Number(form.totalArea),
          foundationArea: form.foundationArea === "" ? undefined : Number(form.foundationArea),
          importance: Number(form.importance) || 0,
        }),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="ویرایش اطلاعات اقامتگاه" width="max-w-[680px]">
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-12">
        <Field label="نام در صفحه اقامتگاه">
          <Input value={form.name} onChange={set("name")} required />
        </Field>
        <Field label="نام پیشنهادی میزبان">
          <Input value={form.hostSuggestedName} onChange={set("hostSuggestedName")} />
        </Field>
        <Field label="نوع ملک">
          <Select value={form.type} onChange={set("type")} className="w-full">
            <option value="SUIT">ویلا و سوئیت</option>
            <option value="BOOMGARDI">بوم‌گردی</option>
            <option value="HOTEL">هتل</option>
          </Select>
        </Field>
        <Field label="اهمیت اقامتگاه (رتبه در جستجو)">
          <Input value={form.importance} onChange={set("importance")} inputMode="numeric" />
        </Field>
        <Field label="مساحت کل زمین (متر)">
          <Input value={form.totalArea} onChange={set("totalArea")} inputMode="numeric" />
        </Field>
        <Field label="مساحت زیربنا (متر)">
          <Input value={form.foundationArea} onChange={set("foundationArea")} inputMode="numeric" />
        </Field>
        <Field label="طبقه">
          <Input value={form.floor} onChange={set("floor")} />
        </Field>
        <Field label="درباره اقامتگاه" className="md:col-span-2">
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={4}
            className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition"
          />
        </Field>

        {!!error && <p className="md:col-span-2 text-13 text-[#C62828]">{error}</p>}

        <div className="md:col-span-2 flex items-center gap-x-10 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditAddressModal({
  open,
  residence,
  onClose,
  onSaved,
}: {
  open: boolean;
  residence: ResidenceDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  // The catalogue behind the city select — CITY rows only, with the province
  // in the label so «رشت» in two provinces is still tellable apart.
  const { data: locations } = useSWR<{ id: number; name: string; type: string; parentId: number | null }[]>(
    open ? "/api/admin/locations" : null,
    (path: string) => apiFetch<{ id: number; name: string; type: string; parentId: number | null }[]>(path)
  );
  const cities = (locations ?? [])
    .filter((l) => l.type === "CITY")
    .map((l) => ({
      ...l,
      parentName: (locations ?? []).find((p2) => p2.id === l.parentId)?.name ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "fa"));

  const [form, setForm] = useState({
    cityId: residence.location?.id ? String(residence.location.id) : "",
    neighborhood: residence.neighborhood ?? "",
    address: residence.address ?? "",
    invoiceAddress: residence.invoiceAddress ?? "",
    latitude: residence.latitude ?? "",
    longitude: residence.longitude ?? "",
  });
  const [distances, setDistances] = useState(
    residence.distances.map((d) => ({
      placeName: d.placeName,
      distance: d.distance ?? "",
      eta: d.eta ?? "",
    }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residence.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          // The schema calls it cityId; the backend maps it onto location_id
          // — see `updateSpecs`, which carries the same note.
          cityId: form.cityId ? Number(form.cityId) : undefined,
          neighborhood: form.neighborhood || undefined,
          address: form.address || undefined,
          invoiceAddress: form.invoiceAddress || undefined,
          latitude: form.latitude === "" ? undefined : Number(form.latitude),
          longitude: form.longitude === "" ? undefined : Number(form.longitude),
        }),
      });
      await apiFetch(`/api/admin/residences/${residence.id}/distances`, {
        method: "PUT",
        body: JSON.stringify({
          distances: distances
            .filter((d) => d.placeName.trim())
            .map((d) => ({
              placeName: d.placeName,
              distance: d.distance || undefined,
              eta: d.eta || undefined,
            })),
        }),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="ویرایش آدرس" width="max-w-[680px]">
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-12">
        {/* The city comes from the locations catalogue in settings, and it was
            the one address field the panel could not change — a listing filed
            under the wrong city had to be fixed in the database. */}
        <Field label="شهر">
          <Select value={form.cityId} onChange={set("cityId")} className="w-full">
            <option value="">— انتخاب شهر —</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentName ? `${c.name} — ${c.parentName}` : c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="محله">
          <Input value={form.neighborhood} onChange={set("neighborhood")} />
        </Field>
        <Field label="آدرس در فرانت">
          <Input value={form.address} onChange={set("address")} />
        </Field>
        <Field label="آدرس در فاکتور" className="md:col-span-2">
          <Input value={form.invoiceAddress} onChange={set("invoiceAddress")} />
        </Field>
        <Field label="عرض جغرافیایی">
          <Input value={form.latitude} onChange={set("latitude")} inputMode="decimal" />
        </Field>
        <Field label="طول جغرافیایی">
          <Input value={form.longitude} onChange={set("longitude")} inputMode="decimal" />
        </Field>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <span className="text-12 leading-18 text-gray-6C6A7D font-m">
              فاصله تا جاذبه‌های گردشگری
            </span>
            <button
              type="button"
              onClick={() => setDistances((d) => [...d, { placeName: "", distance: "", eta: "" }])}
              className="text-12 font-m text-primary-dark"
            >
              + افزودن
            </button>
          </div>
          <div className="flex flex-col gap-y-8 max-h-[220px] overflow-y-auto">
            {distances.map((d, i) => (
              <div key={i} className="flex items-center gap-x-8">
                <Input
                  value={d.placeName}
                  placeholder="نام جاذبه"
                  onChange={(e) =>
                    setDistances((list) =>
                      list.map((x, xi) => (xi === i ? { ...x, placeName: e.target.value } : x))
                    )
                  }
                />
                <Input
                  value={d.distance}
                  placeholder="فاصله"
                  className="max-w-[130px]"
                  onChange={(e) =>
                    setDistances((list) =>
                      list.map((x, xi) => (xi === i ? { ...x, distance: e.target.value } : x))
                    )
                  }
                />
                <Input
                  value={d.eta}
                  placeholder="زمان"
                  className="max-w-[130px]"
                  onChange={(e) =>
                    setDistances((list) =>
                      list.map((x, xi) => (xi === i ? { ...x, eta: e.target.value } : x))
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => setDistances((list) => list.filter((_, xi) => xi !== i))}
                  className="w-28 h-28 shrink-0 rounded-8 text-[#E53935] hover:bg-[#FFEBEB]"
                  aria-label="حذف"
                >
                  <i className="icon-Delete text-16" />
                </button>
              </div>
            ))}
            {distances.length === 0 && (
              <p className="text-12 text-gray-9B9BAA">موردی ثبت نشده</p>
            )}
          </div>
        </div>

        {!!error && <p className="md:col-span-2 text-13 text-[#C62828]">{error}</p>}

        <div className="md:col-span-2 flex items-center gap-x-10 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
