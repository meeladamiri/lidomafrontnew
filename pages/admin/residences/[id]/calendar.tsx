import Link from "next/link";
import { useRouter } from "next/router";
import AdminLayout from "@/components/Admin/Layout";
import CalendarTab from "@/components/Admin/Residence/CalendarTab";

/**
 * تقویم و نرخ for one listing, at its own URL.
 *
 * The calendar's home is now the «تقویم اقامتگاه» tab on the listing page —
 * this route stays because links to it exist, and renders the same component
 * rather than a second copy that would drift from it.
 */
export default function ResidenceCalendarPage() {
  const router = useRouter();
  const id = Number(router.query.id);

  return (
    <AdminLayout
      title="تقویم و نرخ"
      breadcrumb={
        <>
          <Link href="/admin">داشبورد</Link> / <Link href="/admin/residences">اقامتگاه‌ها</Link>
          {" / "}
          <Link href={`/admin/residences/${id}`}>اقامتگاه</Link>
        </>
      }
    >
      {Number.isFinite(id) && <CalendarTab residenceId={id} />}
    </AdminLayout>
  );
}
