# Oftalmologiya — web o‘quv qo‘llanma

DOCX manbasidagi materiallarni saqlagan, statik va responsive o‘quv sahifasi. Loyiha HTML5, CSS3 va JavaScript ES6 asosida tuzilgan; tashqi kutubxona yoki backend talab qilinmaydi.

## Manba tahlili va qamrov

- Manba: `Oftalmologiya 2-mavzu.docx_Parsing.uz.docx`.
- Hujjatning asosiy matnida 599 ta bo‘sh bo‘lmagan paragraf, 1 ta jadval (6 qator), 59 ta noyob rasm va 59 ta rasm joylashuvi aniqlandi. Sahifa manifestida jami 664 ta paragraf/rasm bloki saqlangan.
- Rasmlar asl JPEG/PNG fayllardan olindi; hech biri tashlab ketilmadi. Matnda uchragan rasm raqamlari va izohlar o‘z joyida saqlandi.
- Ro‘yxat raqamlari/belgilari, paragraflar, formulalar (jumladan `D=1/F yoki F=1/D`), jadval kataklaridagi matn va manbadagi atamalar saqlandi.
- Word hujjatida paragraf sarlavha stillari belgilanmagan. Mundarija ko‘rinib turgan sarlavha satrlaridan tuzildi; matn sarlavha uslubida ko‘rsatilishi uning mazmunini o‘zgartirmaydi.
- Jadval, matn, captionlar va rasm bloklari hujjatdagi tartibda chiqarildi. Originalda test bo‘limi aniqlanmagani sababli yangi savollar kiritilmadi.
- Footnote/endnote XML bo‘limlari tekshirildi; ularda matnli izohlar yo‘q.

`content.json` — manba bloklari va tarkib inventarizatsiyasi. `assets/images/` ichida manbadagi barcha 59 tasvir bor.

## Ishga tushirish

Sayt statik hostlarda, jumladan GitHub Pages’da ishlaydi. `index.html` va yonidagi loyiha fayllarini hostga joylang. `content.json` brauzer `fetch` orqali yuklagani uchun `file://` bilan ochish o‘rniga lokal HTTP server yoki GitHub Pages’dan foydalaning.

Service Worker sahifa birinchi marta onlayn ochilganda asosiy fayllar va barcha rasmlarni keshlaydi. Shundan so‘ng navigatsiya, qidiruv, rasmlar, progress, bookmark va rang rejimi offline ishlaydi. Service Worker HTTPS yoki `localhost` manzilida ishlaydi.

## Хэрэглэгчийн боломжууд

- Qidiruv matndagi mosliklarni ajratib ko‘rsatadi va birinchi natijaga olib o‘tadi. `Ctrl/Cmd + K` qidiruv maydonini ochadi.
- Rasm bosilganda kattalashtirilgan lightbox ochiladi.
- Light/dark mode, o‘qilgan bo‘limlar va saqlangan bo‘lim `localStorage`da saqlanadi.
- Kichik ekranlarda chap menyu hamburger ko‘rinishiga o‘tadi; jadvallar gorizontal aylantiriladi.

## Бүтэц

```text
index.html
content.json
service-worker.js
css/style.css
css/responsive.css
js/app.js
js/navigation.js
js/search.js
assets/icons/eye.svg
assets/images/                 # DOCX-оос гаргасан 59 зураг
```
