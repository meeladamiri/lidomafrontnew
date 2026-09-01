import { useRef, useState } from "react";
import Image from "next/image";
import PageTitle from "components/General/PageTitle";
import Divider from "components/General/Divider";
import { Button } from "components/General/core/Button";
import apiBuilder from "@/api/apiBuilder";

/**
 * پروفایل کاربری — the things a person still needs to do, done here.
 *
 * This used to be three black bars reading "تصویر پروفایل خود را بروزرسانی
 * کنید" next to a «ویرایش» button that navigated to /profile. Three prompts,
 * three trips to another page, and — for the national card — a page with no
 * working upload at the end of it, because no endpoint existed to upload to.
 *
 * Now each one is finished where it is asked for. A photo is a file picker and
 * a preview; a شبا is a text field; nothing leaves the dashboard.
 *
 * ## Why the tasks look like tasks and not like errors
 *
 * The old cards were solid black, which on a dashboard reads as something
 * having gone wrong. Nothing has gone wrong — a person simply has not got to
 * it yet. They are neutral cards with one clear action, and each disappears
 * the moment it is done, so the section empties itself and then hides.
 */

interface Props {
  hasAvatar: boolean;
  hasShaba: boolean;
  hasNationalCard: boolean;
  /** Hosts are asked for a شبا and a national card; guests are not. */
  isHost: boolean;
  avatarUrl?: string;
  onDone: () => void;
}

type TaskKey = "avatar" | "nationalCard" | "shaba";

const MAX_BYTES = 5 * 1024 * 1024;

export default function ProfileCompletion({
  hasAvatar,
  hasShaba,
  hasNationalCard,
  isHost,
  avatarUrl,
  onDone,
}: Props) {
  const [busy, setBusy] = useState<TaskKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Set<TaskKey>>(new Set());
  const [shaba, setShaba] = useState("");
  const [preview, setPreview] = useState<Record<string, string>>({});

  const avatarInput = useRef<HTMLInputElement>(null);
  const cardInput = useRef<HTMLInputElement>(null);

  // A guest has no payout account and no listing to verify, so asking them for
  // a شبا or a national card is asking for documents we have no use for.
  const tasks: TaskKey[] = [
    ...(!hasAvatar && !done.has("avatar") ? (["avatar"] as TaskKey[]) : []),
    ...(isHost && !hasNationalCard && !done.has("nationalCard")
      ? (["nationalCard"] as TaskKey[])
      : []),
    ...(isHost && !hasShaba && !done.has("shaba") ? (["shaba"] as TaskKey[]) : []),
  ];

  if (tasks.length === 0) return null;

  async function uploadImage(key: "avatar" | "nationalCard", file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("فقط فایل تصویری قابل بارگذاری است");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("حجم تصویر باید کمتر از ۵ مگابایت باشد");
      return;
    }

    // Shown immediately, before the upload finishes: on a slow connection the
    // alternative is pressing a button and watching nothing happen.
    const localUrl = URL.createObjectURL(file);
    setPreview((p) => ({ ...p, [key]: localUrl }));
    setBusy(key);

    try {
      const form = new FormData();
      form.append(key === "avatar" ? "avatar" : "nationalCard", file);

      const resp = await apiBuilder
        .setUrl(key === "avatar" ? "/api/users/me/avatar" : "/api/users/me/national-card")
        .setCallMethod("POST")
        .setBody(form)
        .call();

      if (resp?.status !== "success") throw new Error(resp?.message || "بارگذاری انجام نشد");

      setDone((d) => new Set(d).add(key));
      onDone();
    } catch (e) {
      setPreview((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
      setError(e instanceof Error ? e.message : "بارگذاری انجام نشد");
    } finally {
      setBusy(null);
    }
  }

  async function saveShaba() {
    const value = shaba.replace(/\s/g, "").replace(/^IR/i, "");
    if (!/^\d{24}$/.test(value)) {
      setError("شماره شبا باید ۲۴ رقم باشد (بدون IR)");
      return;
    }
    setBusy("shaba");
    setError(null);
    try {
      const resp = await apiBuilder
        .setUrl("/api/users/me/bank-account")
        .setCallMethod("PUT")
        .setParams({ shabaNumber: `IR${value}` })
        .call();
      if (resp?.status !== "success") throw new Error(resp?.message || "ذخیره نشد");
      setDone((d) => new Set(d).add("shaba"));
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره نشد");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="py-16">
        <PageTitle
          title="تکمیل پروفایل"
          icon={<i className="icon-Profile text-24" />}
          containerClassname="mb-16"
        />

        <div className="flex flex-col gap-y-12">
          {tasks.includes("avatar") && (
            <div className="rounded-12 border-1 border-solid border-gray-CACFD3 p-12 flex items-center gap-x-12">
              <button
                type="button"
                onClick={() => avatarInput.current?.click()}
                className="relative w-56 h-56 rounded-full overflow-hidden bg-gray-F4F5F6 shrink-0 flex items-center justify-center"
                aria-label="انتخاب تصویر پروفایل"
              >
                {preview.avatar || avatarUrl ? (
                  <Image
                    src={preview.avatar || avatarUrl || ""}
                    alt=""
                    fill
                    sizes="56px"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <i className="icon-Photo-Upload text-24 text-gray-959FA7" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-14 leading-24 text-black font-m">تصویر پروفایل</p>
                <p className="text-12 leading-20 text-gray-959FA7">
                  مهمان‌ها شما را با این عکس می‌شناسند
                </p>
              </div>

              <Button
                onClick={() => avatarInput.current?.click()}
                disabled={busy === "avatar"}
                className="!w-auto !px-16 shrink-0"
              >
                {busy === "avatar" ? "در حال بارگذاری…" : "انتخاب عکس"}
              </Button>

              <input
                ref={avatarInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  // Cleared so choosing the same file twice fires onChange again.
                  e.target.value = "";
                  if (f) uploadImage("avatar", f);
                }}
              />
            </div>
          )}

          {tasks.includes("nationalCard") && (
            <div className="rounded-12 border-1 border-solid border-gray-CACFD3 p-12 flex items-center gap-x-12">
              <button
                type="button"
                onClick={() => cardInput.current?.click()}
                className="relative w-56 h-40 rounded-8 overflow-hidden bg-gray-F4F5F6 shrink-0 flex items-center justify-center"
                aria-label="انتخاب تصویر کارت ملی"
              >
                {preview.nationalCard ? (
                  <Image
                    src={preview.nationalCard}
                    alt=""
                    fill
                    sizes="56px"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <i className="icon-Photo text-22 text-gray-959FA7" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-14 leading-24 text-black font-m">تصویر کارت ملی</p>
                <p className="text-12 leading-20 text-gray-959FA7">
                  برای احراز هویت میزبان لازم است و فقط کارشناس آن را می‌بیند
                </p>
              </div>

              <Button
                onClick={() => cardInput.current?.click()}
                disabled={busy === "nationalCard"}
                className="!w-auto !px-16 shrink-0"
              >
                {busy === "nationalCard" ? "در حال بارگذاری…" : "بارگذاری"}
              </Button>

              <input
                ref={cardInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) uploadImage("nationalCard", f);
                }}
              />
            </div>
          )}

          {tasks.includes("shaba") && (
            <div className="rounded-12 border-1 border-solid border-gray-CACFD3 p-12">
              <div className="flex items-center gap-x-12 mb-10">
                <span className="w-40 h-40 rounded-full bg-gray-F4F5F6 flex items-center justify-center shrink-0">
                  <i className="icon-Cash text-22 text-gray-959FA7" />
                </span>
                <div className="min-w-0">
                  <p className="text-14 leading-24 text-black font-m">شماره شبا</p>
                  <p className="text-12 leading-20 text-gray-959FA7">
                    درآمد رزروها به این حساب واریز می‌شود
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-x-8">
                <div className="flex-1 flex items-center rounded-10 border-1 border-solid border-gray-CACFD3 px-12 h-48">
                  <span className="text-14 text-gray-959FA7 font-r shrink-0 ml-6">IR</span>
                  <input
                    value={shaba}
                    onChange={(e) => setShaba(e.target.value)}
                    inputMode="numeric"
                    placeholder="۲۴ رقم"
                    dir="ltr"
                    className="w-full outline-none text-14 text-black"
                  />
                </div>
                <Button
                  onClick={saveShaba}
                  disabled={busy === "shaba" || !shaba.trim()}
                  className="!w-auto !px-20 shrink-0"
                >
                  {busy === "shaba" ? "…" : "ذخیره"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {!!error && <p className="mt-10 text-13 leading-22 text-error-light">{error}</p>}
      </div>

      <Divider />
    </>
  );
}
