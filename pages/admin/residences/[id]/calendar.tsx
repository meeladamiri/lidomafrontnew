import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import CalendarTab from "@/components/Admin/Residence/CalendarTab";
import { Skeleton } from "@/components/Admin/ui";
import { apiFetch } from "@/api/Admin/adminApi";

/**
 * تقویم و نرخ for one listing, at its own URL.
 *
 * The calendar's home is the «تقویم اقامتگاه» tab on the listing page; this
 * route stays because links to it exist, and renders the same component rather
 * than a second copy that would drift from it.
 *
 * The URL carries the کد اقامتگاه, like every other panel residence URL, so it
 * has to resolve that to the internal id before the calendar can ask for
 * anything — the two are different numbers on every migrated listing and
 * collide on 1,640 of them.
 */
interface Resolved {
  id: number;
  publicId: number;
  name: string;
}

export default function ResidenceCalendarPage() {
  const router = useRouter();
  const code = Number(router.query.id);

  const { data } = useSWR<Resolved>(
    Number.isFinite(code) ? `/api/admin/residences/${code}` : null,
    (path: string) => apiFetch<Resolved>(path)
  );

  return (
    <AdminLayout
      title="تقویم و نرخ"
      breadcrumb={
        <>
          <Link href="/admin">داشبورد</Link> / <Link href="/admin/residences">اقامتگاه‌ها</Link>
          {" / "}
          <Link href={`/admin/residences/${code}`}>{data?.name ?? "اقامتگاه"}</Link>
        </>
      }
    >
      {data ? <CalendarTab residenceId={data.id} /> : <Skeleton className="h-[420px]" />}
    </AdminLayout>
  );
}
