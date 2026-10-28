# SOA App - أبناء الفوضى

- `index.html` / `style.css` / `app.js` (React) / `tailwind-config.js`
- `firebase.js` : Firebase Auth + Firestore (البيانات والحسابات مشتركة بين الجميع)
- `firestore.rules` : قواعد الأمان (انسخها إلى Firebase Console > Firestore > Rules ثم Publish)
- `logo.jpeg` : الشعار

## تغيير الشعار
بدّل `logo.jpeg` بصورتك. الشعار يُقصّ تلقائياً على منطقة معيّنة من الصورة، فإن اختلفت الصورة عدّل الأرقام
`LOGO_CROP` في أعلى `app.js` (x, y, w, h بالبكسل، ثم iw, ih = أبعاد الصورة الكاملة).
أفضل نتيجة: صورة خلفيتها سوداء، لأن الشعار يذوب في خلفية الموقع.

## الإعداد (مرة واحدة)
1. Authentication > Sign-in method > Email/Password > Enable
2. Firestore Database > Create database
3. Firestore > Rules > الصق `firestore.rules` > Publish
4. Authentication > Settings > Authorized domains > أضف دومين Vercel

## النشر
git add . && git commit -m "update" && git push   (Vercel ينشر تلقائياً)

## الحركات (Motion)
- الدخول: خيط ضوء ← حلقات ← الشعار يظهر بتدرّج ← «SOA» حرفاً حرفاً ← الأبواب تنفتح. زر «تخطي» يتجاوزها.
- بعد الأبواب: الصفحات تدخل بتدرّج، الأرقام تعدّ تصاعدياً، شريط التنقل يتوهّج، الأزرار الذهبية تلمع، الصف المعدَّل يتلوّن بالذهب.
- كل الحركات تُوقَف تلقائياً لمن فعّل «تقليل الحركة» في جهازه (prefers-reduced-motion).
- ملف الحركات في آخر `style.css` (قسم «Premium motion»)، ومدّة السبلاش في `Splash` داخل `app.js` (المصفوفة `T`).
