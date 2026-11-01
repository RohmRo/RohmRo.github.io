# سایت Roham Prog

همه فایل‌ها را در ریشه مخزن `rohmro.github.io` (جایگزین فایل‌های قبلی) آپلود کن.

- `index.html` صفحه اصلی (سئو، پرسش و پاسخ، تماس)
- `tutorials.html` همه ۱۰۰ آموزش + فهرست لینک‌ها
- `learn/*.html` صفحه ثابت هر آموزش (برای گوگل)
- `admin.html` پنل مدیریت (noindex) — برای افزودن آموزش
- `assets/` اسکریپت‌ها، استایل‌ها، `learn-data.js` (آموزش‌های اصلی)
- `worker/worker.js` پروکسی اختیاری مدل زبانی (Cloudflare)
- `tools/build-pages.mjs` بازسازی صفحات آموزش و sitemap (`node tools/build-pages.mjs`)

## پنل ادمین
آدرس: `https://rohmro.github.io/admin.html` — رمز را وارد کن. آموزش را بنویس، «ذخیره»، سپس «انتشار» (نیاز به توکن GitHub با دسترسی Contents: Read and write برای همین مخزن).
نکته: رمز فقط یک قفل راحتی است (سایت استاتیک است)؛ امنیت واقعی انتشار، توکن GitHub است.

## هوش مصنوعی
- حالت سریع: محلی، بدون اینترنت.
- «✨ هوش پیشرفته»: با Puter.js (حساب رایگان خود کاربر) یا با `AI_ENDPOINT` (Cloudflare Worker) در بالای `assets/chat.js`.

## بعد از انتشار
1. در Google Search Console سایت را اضافه و `https://rohmro.github.io/sitemap.xml` را ثبت کن.
2. کلمات کلیدی meta را گوگل نادیده می‌گیرد؛ رتبه از محتوا، صفحات آموزش و بک‌لینک می‌آید.
