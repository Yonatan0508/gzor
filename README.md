# גזור והזז

אפליקציית אנדרואיד לגזירת אובייקטים מתמונות: מקישים על אובייקט וה-AI (Google MediaPipe Interactive Segmenter, רץ על המכשיר) מזהה את הגבולות שלו, או מקיפים ידנית. אחר כך מזיזים, מגדילים, מקטינים, מסובבים, משכפלים ושומרים.

## הורדה לטלפון
כל דחיפה ל-`main` בונה APK חדש ב-GitHub Actions ומפרסמת אותו ב-Releases.
קישור קבוע לגרסה האחרונה: `https://github.com/Yonatan0508/gzor/releases/latest/download/gzor.apk`

## מבנה
- `src/index.html` – כל האפליקציה (ממשק, חיתוך, AI, שמירה)
- `scripts/build-www.mjs` – בונה את `www/` ומעתיק את MediaPipe
- `scripts/get-model.sh` – מוריד את מודל ה-AI (magic_touch, ~6MB)
- `android/` – פרויקט Capacitor לאנדרואיד

## בנייה מקומית (Android Studio)
```
npm ci
npm run model
npm run sync
npx cap open android
```

## Google Play
ה-APK כאן חתום במפתח בדיקה (`android/app/gzor-debug.keystore`) כדי שעדכונים יותקנו אחד על השני. לחנות צריך מפתח העלאה פרטי משלכם ו-`./gradlew bundleRelease`.
