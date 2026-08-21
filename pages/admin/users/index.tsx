import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch, apiFetchPaginated } from "@/api/Admin/adminApi";

interface UserRow {
  id: number;
  phone: string;
  name: string | null;
  isHost: boolean;
  role: "USER" | "ADMIN";
  verificationStatus: string;
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  const query = new URLSearchParams({ page: String(page), pageSize: "20", ...(q ? { q } : {}) });
  const { data, isLoading, mutate } = useSWR(`/api/admin/users?${query.toString()}`, (path: string) =>
    apiFetchPaginated<UserRow>(path)
  );

  async function toggleHost(user: UserRow) {
    await apiFetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isHost: !user.isHost }),
    });
    mutate();
  }

  async function verifyUser(user: UserRow) {
    await apiFetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ verificationStatus: "CONFIRMED" }),
    });
    mutate();
  }

  return (
    <AdminLayout>
      <h1>کاربران</h1>
      <div className="toolbar">
        <input
          placeholder="جستجو با نام، شماره یا ایمیل..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 300 }}
        />
      </div>

      <div className="card">
        {isLoading && <p>در حال بارگذاری...</p>}
        {data && (
          <table>
            <thead>
              <tr>
                <th>نام</th>
                <th>موبایل</th>
                <th>میزبان؟</th>
                <th>نقش</th>
                <th>احراز هویت</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((u) => (
                <tr key={u.id}>
                  <td>{u.name ?? "-"}</td>
                  <td>{u.phone}</td>
                  <td>
                    <span className={`badge ${u.isHost ? "green" : "gray"}`}>{u.isHost ? "بله" : "خیر"}</span>
                  </td>
                  <td>{u.role === "ADMIN" ? "ادمین" : "کاربر"}</td>
                  <td>
                    <span className={`badge ${u.verificationStatus === "CONFIRMED" ? "green" : "yellow"}`}>
                      {u.verificationStatus === "CONFIRMED"
                        ? "تایید شده"
                        : u.verificationStatus === "CHECKING"
                          ? "در حال بررسی"
                          : "تایید نشده"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <Link className="btn secondary" href={`/admin/users/${u.id}`}>
                      مشاهده
                    </Link>
                    <button className="btn secondary" onClick={() => toggleHost(u)}>
                      {u.isHost ? "لغو میزبانی" : "میزبان کردن"}
                    </button>
                    {u.verificationStatus !== "CONFIRMED" && (
                      <button className="btn secondary" onClick={() => verifyUser(u)}>
                        تایید هویت
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && (
          <div className="pagination">
            <button className="btn secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              قبلی
            </button>
            <span style={{ alignSelf: "center" }}>
              صفحه {page} از {data.meta.pageCount}
            </span>
            <button
              className="btn secondary"
              disabled={page >= data.meta.pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              بعدی
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
