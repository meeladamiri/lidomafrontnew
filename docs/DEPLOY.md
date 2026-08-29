# دیپلوی روی لیارا

## دو اپ، دو نام

```
lidomatrip   platform: next   ← فرانت
lidoma       platform: node   ← بک‌اند
```

`lidomatrip.liara.run` استیجینگ است. **`lidomatrip.com` عمداً هنوز نسخه‌ی قدیمی را سرو می‌کند** و تا تصمیم صریح، دست‌نخورده می‌ماند.

با `liara app list` می‌شود فهرست را دید، و با `liara env list --app <name>` مقدار متغیرها را — که برای عیب‌یابی بی‌نظیر است (پایین را ببینید).

## دستور دیپلوی

```bash
cd front && npm run deploy
```

نه `liara deploy` مستقیم. `npm run deploy` اول `npm run verify` را می‌زند (`tsc --noEmit` + `next lint`، حدود ۸۷ ثانیه) و فقط اگر تمیز بود دیپلوی می‌کند.

**چرا این مهم است:** بیلد لیارا دیگر تایپ‌چک و lint نمی‌کند (`next.config.js` → `typescript.ignoreBuildErrors` و `eslint.ignoreDuringBuilds`). آن بررسی‌ها حذف نشدند، جابه‌جا شدند — چون روی کانتینر بیلد بخشی از سقف بیست‌دقیقه‌ای را می‌خوردند بدون اینکه چیزی پیدا کنند که لوکال پیدا نشده باشد. اگر `liara deploy` را مستقیم بزنید، آن شبکه‌ی ایمنی را دور زده‌اید.

---

## چهار مشکلی که خوردیم و راه‌حلشان

### ۱. `prisma generate` در pipeline نبود (بک‌اند)

```
TS2307: Cannot find module '@/generated/prisma/client'
```

لوکال کار می‌کرد چون `src/generated/` روی دیسک بود؛ روی چک‌اوت تازه که gitignore شده، نبود. همه‌ی `TS7006`ها هم پیامد همین بودند.

مشکل دومی هم داشت که هنوز بهش نرسیده بودیم: خروجی سفارشی Prisma باعث می‌شد بیلد **موفق** هم خروجی غیرقابل‌اجرا بدهد، چون `tsc-alias` مسیر `@/generated/…` را بازنویسی نمی‌کرد و `dist/lib/prisma.js` همان require خام را نگه می‌داشت.

**حل:** خروجی سفارشی حذف شد، ۳۵ فایل به `@prisma/client` استاندارد منتقل شدند، و `build` حالا با `prisma generate` شروع می‌شود.

### ۲. `sharp` از GitHub دانلود می‌کرد

```
sharp: Downloading https://github.com/lovell/sharp-libvips/releases/...
sharp: Installation error: Request timed out
```

سرورهای بیلد لیارا به GitHub نمی‌رسند.

**حل:** `front/.npmrc` میزبان دانلود را به آینه تغییر می‌دهد. نام متغیرها از سورس خود sharp درآمده، نه از حافظه:

```
sharp_libvips_binary_host=https://npmmirror.com/mirrors/sharp-libvips
sharp_binary_host=https://npmmirror.com/mirrors/sharp
```

اگر آینه هم روزی از کار افتاد، راه بادوام‌تر ارتقای sharp به `0.33+` است — از آن نسخه باینری‌ها وابستگی اختیاری معمولی npm‌اند و اصلاً سراغ GitHub نمی‌روند.

### ۳. بیلد به سقف بیست دقیقه خورد

اول فکر کردم آپلود مقصر است و `.liaraignore` نوشتم. **اشتباه بود** — CLI خودش `node_modules`، `.next` و `.git` را از پیش نادیده می‌گیرد (`lib/utils/create-archive.js`). تنها چیز واقعی که فایل من اضافه کرد `.next-perf` با ۴۲۷ مگ بود.

گلوگاه خودِ کامپایل بود. **حل:** انتقال lint و typecheck به `npm run verify` (بالا).

### ۴. `.liaraignore` جای `.gitignore` را می‌گیرد، نه اینکه به آن اضافه شود

CLI **یا** `.liaraignore` را می‌خواند **یا** `.gitignore` را — هرگز هر دو را. `.gitignore` از قبل `.env` را داشت؛ فایل جدید نداشت، پس `.env` برای اولین بار آپلود شد و `BACKEND_API_URL=http://localhost:4000` را با خودش برد:

```
Failed to proxy http://localhost:4000/api/search/residences ECONNREFUSED
```

**قاعده:** هر الگویی که در `.gitignore` هست و باید در آپلود هم نادیده گرفته شود، باید صریحاً در `.liaraignore` تکرار شود.

---

## متغیرهای محیطی: گیومه نگذارید

مقدار متغیر در پنل **عیناً** همان چیزی است که تایپ می‌شود. در فایل `.env` گیومه‌ها را dotenv برمی‌دارد؛ در پنل نه.

یک ساعت روی همین رفت. `DATABASE_URL` با گیومه ذخیره شده بود:

```
error: Error validating datasource `db`: the URL must start with the protocol `postgresql://`
```

و بار بعد که گیومه‌ها برداشته شد، `postgresql:` هم با آن‌ها رفت و مقدار به `//root:…` تبدیل شد.

**راه تشخیص سریع:** از همین‌جا می‌شود شکل مقدار را دید بدون اینکه رمز چاپ شود:

```bash
liara env list --app lidoma
```

طول رشته و چند بایت اولش، جای همه‌ی حدس‌ها را می‌گیرد.

**متغیرهایی که گیومه در آن‌ها بی‌صدا خراب می‌کند:** `JWT_ACCESS_SECRET` و `JWT_REFRESH_SECRET` (رشته‌ی متفاوت → همه از حساب بیرون می‌افتند)، `CORS_ORIGINS`، `APP_URL`.

## متغیرهایی که باید ست باشند

| اپ | متغیر | مقدار |
|---|---|---|
| `lidoma` | `DATABASE_URL` | `postgresql://root:…@lidoma-db:5432/postgres` |
| `lidoma` | `REDIS_URL` | `redis://:…@lidomaredis:6379/0` |
| `lidomatrip` | `BACKEND_API_URL` | `http://lidoma:3000` |

سرویس‌های خصوصی با نام اپ/دیتابیس صدا زده می‌شوند، نه با آدرس عمومی.

## چک بعد از دیپلوی

```bash
curl -s https://lidoma.liara.run/health
```

`{"status":"ok","cache":{"enabled":true,"state":"ready"}}` — اگر `state` چیزی جز `ready` بود، `REDIS_URL` نرسیده. اگر `/health` سالم بود ولی هر اندپوینت دیتابیسی ۵۰۰ داد، مشکل `DATABASE_URL` است نه شبکه.
