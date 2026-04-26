<div align="center">

# 💊 OPD — Prescribing Error Tracker
### ระบบเก็บข้อมูล Prescribing Error · ห้องจ่ายยาผู้ป่วยนอก

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-PWA-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white)
![Backend](https://img.shields.io/badge/backend-Google%20Apps%20Script-34a853?style=for-the-badge&logo=google&logoColor=white)
![Storage](https://img.shields.io/badge/storage-Google%20Sheets-0f9d58?style=for-the-badge&logo=googlesheets&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-f59e0b?style=for-the-badge)

> ระบบบันทึกและวิเคราะห์ข้อผิดพลาดทางยา (Prescribing Error)
> สำหรับ **โรงพยาบาลอุตรดิตถ์** · ฝ่ายเภสัชกรรม

</div>

---

## 🌟 ภาพรวมระบบ

```
┌─────────────────────────────────────────────────────────┐
│                    OPD PE Tracker                       │
│                                                         │
│  📝 บันทึก HN  ──►  🔍 ตรวจจับซ้ำ  ──►  ☁️ Google Sheets │
│                                                         │
│  📊 รายงาน   ◄──  📈 กราฟ & ชาร์ต  ◄──  🗃️ LocalStorage  │
└─────────────────────────────────────────────────────────┘
```

ระบบนี้ช่วยให้เภสัชกรบันทึกและติดตามข้อผิดพลาดทางใบสั่งยา (PE) ได้อย่างรวดเร็ว พร้อมแดชบอร์ดวิเคราะห์ข้อมูลแบบ Real-time

---

## ✨ ฟีเจอร์หลัก

| หมวด | ฟีเจอร์ | รายละเอียด |
|------|---------|------------|
| 📝 **บันทึก** | รับ HN ผู้ป่วย | พิมพ์ หรือสแกนบาร์โค้ด |
| 📷 **สแกน** | Barcode Scanner | ใช้กล้องสแกน Code 128 / Code 39 |
| 🏥 **คลินิก** | จัดการคลินิก | เพิ่ม / ค้นหาคลินิกแบบ Dynamic |
| 🔍 **ซ้ำ** | ตรวจจับข้อมูลซ้ำ | ป้องกันบันทึก HN + Error ซ้ำในวันเดียวกัน |
| 📊 **รายงาน** | กราฟ 4 แบบ | รายวัน · สัดส่วนประเภท · คลินิก · ช่วงเวลา |
| 🗓️ **ค่าเริ่มต้น** | เดือนปัจจุบัน | โหลดและแสดงผลเฉพาะเดือนนี้อัตโนมัติ |
| 📥 **Export** | Excel (.xlsx) | ส่งออกข้อมูลที่กรองแล้ว |
| ☁️ **Sync** | Google Sheets | บันทึกข้อมูลจริงบน Cloud |
| 📱 **PWA** | ติดตั้งได้ | ใช้งานได้แบบ Offline + ติดตั้งบนมือถือ |

---

## 🗂️ โครงสร้างไฟล์

```
pev1/
├── 📄 index.html          ← แอปหลัก (UI + Logic ทั้งหมด)
├── ⚙️  code.gs             ← Google Apps Script (Backend API)
├── 📦 manifest.json       ← PWA Manifest
├── 🔧 sw.js               ← Service Worker (Offline Support)
├── 🖼️  favicon.svg / .ico  ← ไอคอนเว็บไซต์
└── 📁 icons/              ← ไอคอน PWA หลายขนาด
```

---

## 🛠️ เทคโนโลยีที่ใช้

<div align="center">

| Layer | Technology |
|-------|-----------|
| 🎨 **Frontend** | HTML5 · Tailwind CSS · Vanilla JavaScript |
| 📊 **Charts** | Chart.js + DataLabels Plugin + 3D Pie |
| 📷 **Scanner** | QuaggaJS (Barcode) |
| 🔔 **Alert** | SweetAlert2 |
| ⚙️ **Backend** | Google Apps Script |
| 🗃️ **Database** | Google Sheets |
| 💾 **Cache** | Browser LocalStorage |
| 📱 **PWA** | Service Worker + Web Manifest |

</div>

---

## 🚀 วิธีติดตั้ง

### 📋 ขั้นตอนที่ 1 — เตรียม Google Sheet

1. สร้าง Google Spreadsheet ใหม่
2. สร้าง 2 ชีต: **`Data`** และ **`Clinics`**
3. ชีต `Data` — หัวตาราง (แถว 1):

   | A | B | C | D | E | F | G |
   |---|---|---|---|---|---|---|
   | id | hn | errorType | clinic | timestamp | date | time |

4. ชีต `Clinics` — ใส่ชื่อคลินิกในคอลัมน์ A (1 คลินิกต่อแถว)

> 💡 Script จะสร้างชีทให้อัตโนมัติถ้าไม่มี ไม่ต้องสร้างเองก็ได้

---

### ⚙️ ขั้นตอนที่ 2 — ติดตั้ง Google Apps Script

1. เปิด Google Sheet → **Extensions → Apps Script**
2. วางโค้ดจากไฟล์ `code.gs` ลงใน Editor
3. แก้ไข `SHEET_ID` ให้ตรงกับ ID ของ Sheet คุณ:

```javascript
// code.gs บรรทัดที่ 8
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
```

4. กด **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. คัดลอก **Web app URL**

---

### 🔗 ขั้นตอนที่ 3 — เชื่อมต่อ Frontend

แก้ไข `index.html` บรรทัดที่ 374:

```javascript
const scriptURL = 'YOUR_WEB_APP_URL_HERE';
```

---

### 🌐 ขั้นตอนที่ 4 — Deploy เว็บ

Deploy ผ่าน **GitHub Pages**, **Netlify**, หรือ **Cloudflare Pages** ได้เลย — ไม่ต้องการ Server

---

## 📊 ประเภท Error ที่รองรับ

```
🔴  จำนวนยาไม่ถึงนัด   →  ยาไม่พอสำหรับช่วงนัดครั้งถัดไป
🟡  เกินวันนัด         →  สั่งยาเกินกว่าวันนัดของผู้ป่วย
🟠  สั่งยาวิธีใช้ off  →  วิธีใช้ยาในใบสั่งไม่ถูกต้อง
```

---

## 📈 กราฟและรายงาน

```
📈  กราฟเส้น (Line Chart)
    └─ จำนวน Error รายวัน พร้อม Data Labels

🥧  กราฟวงกลม 3D (Pie Chart)
    └─ สัดส่วนแต่ละประเภท Error

📊  กราฟแท่งนอน (Bar Chart)
    └─ จำนวน Error แยกตามคลินิก (Top 11 + อื่นๆ)

⏰  กราฟช่วงเวลา (Time Slot Chart)
    └─ 07:00–09:59  ·  10:00–11:59  ·  12:00–13:59  ·  14:00–16:30
```

---

## ⚡ การโหลดข้อมูล (Performance)

```
เปิดแอป
   │
   ▼
โหลดเฉพาะเดือนปัจจุบัน  ← เร็วกว่าโหลดทั้งหมด!
   │
   ▼
หน้ารายงาน → แสดงเดือนปัจจุบันเป็น Default
   │
   ▼
เลือกวันนอกช่วงที่โหลด → Refetch อัตโนมัติ
```

> ✅ โหลดข้อมูลเฉพาะเดือนปัจจุบันก่อน ทำให้เปิดแอปเร็วขึ้นอย่างเห็นได้ชัด
> ✅ ข้อมูลคลินิกโหลดพร้อมกันในครั้งเดียว
> ✅ กด **Refresh** เพื่ออัปเดตข้อมูลล่าสุดได้ตลอดเวลา

---

## 🔒 ความปลอดภัย

- ✅ ตรวจจับข้อมูลซ้ำก่อนบันทึกทุกครั้ง (ทั้ง Client & Server)
- ✅ ข้อมูลจัดเก็บบน Google Sheets ของโรงพยาบาล
- ✅ ไม่มีข้อมูลผู้ป่วยถูกส่งออกไปนอกระบบ

---

## 📱 ติดตั้งบนมือถือ (PWA)

| ระบบปฏิบัติการ | วิธีติดตั้ง |
|---------------|------------|
| 🤖 **Android** | Chrome → เมนู ⋮ → **"Add to Home screen"** |
| 🍎 **iOS** | Safari → Share → **"Add to Home Screen"** |

แอปจะทำงานแบบ Standalone เหมือน Native App และรองรับการใช้งาน Offline

---

## 📸 หน้าจอหลัก

```
┌─────────────────────────┐    ┌─────────────────────────┐
│   📝 บันทึกข้อมูล        │    │   📊 รายงาน              │
│                         │    │                         │
│  HN: [____________] 📷  │    │  🔍 กรองข้อมูล           │
│                         │    │  วันที่: [____] - [____] │
│  [💾 บันทึกข้อมูล]       │    │  ประเภท: [ทั้งหมด ▾]    │
│                         │    │  คลินิก: [ทั้งหมด ▾]    │
│  📋 รายการล่าสุด         │    │                         │
│  ─────────────────────  │    │  📊 65  📅 12  📈 8.3   │
│  HN 12345  อายุรกรรม    │    │                         │
│  HN 67890  ศัลยกรรม     │    │  [กราฟแสดงที่นี่]       │
└─────────────────────────┘    └─────────────────────────┘
```

---

<div align="center">

พัฒนาโดย ทีมเภสัชกรรม · **โรงพยาบาลอุตรดิตถ์**

🏥 ห้องจ่ายยาผู้ป่วยนอก (OPD Pharmacy)

---

*Made with ❤️ for safer medication dispensing*

</div>
