<div align="center">

<img src="https://readme-typing-svg.herokuapp.com?font=Outfit&weight=600&size=30&pause=1000&color=0EA5E9&center=true&vCenter=true&width=600&lines=Pentest+Estimator+Web+Application;ระบบประเมินราคาและระยะเวลา+Pentest;Secure+%7C+Modern+%7C+Efficient" alt="Typing SVG" />

<br>

<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
<img src="https://img.shields.io/badge/EJS-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
<img src="https://img.shields.io/badge/Security-Protected-blue?style=for-the-badge&logo=security&logoColor=white" />

<br>
<br>

**เว็บแอปพลิเคชันสำหรับประเมินความพยายาม (Effort) และระยะเวลาในการทำ Penetration Testing**  
ออกแบบมาเพื่อช่วยคำนวณ Man-days ตามมาตรฐาน โดยพิจารณาจากจำนวนฟังก์ชัน, ประเภทแอปพลิเคชัน และวิธีการทดสอบ (Blackbox / Graybox / Whitebox)

[ฟีเจอร์เด่น](#-ฟีเจอร์เด่น-features) • [เทคโนโลยีที่ใช้](#-เทคโนโลยีที่ใช้-tech-stack) • [การติดตั้ง](#-การติดตั้ง-installation) • [การตั้งค่า](#-การตั้งค่า-configuration) • [โครงสร้างโปรเจกต์](#-โครงสร้างโปรเจกต์-project-structure)

---
</div>

## ✨ ฟีเจอร์เด่น (Features)

*   🚀 **ระบบคำนวณอัตโนมัติ (Estimation Engine):** คำนวณวันทำงาน (Man-days) แม่นยำตามสูตรมาตรฐาน พร้อมปรับแต่งตัวแปรได้
*   📊 **แดชบอร์ดผู้ใช้ (Dashboard):** ดูประวัติการประเมินย้อนหลัง สถานะงาน และกราฟสรุปผล
*   🛡️ **ระบบรักษาความปลอดภัยระดับสูง (Security):** 
    *   ระบบล็อกอิน/สมัครสมาชิกที่ปลอดภัยด้วย **Session** และ **JWT** (JSON Web Token)
    *   ป้องกันการโจมตีทั่วไปด้วย **Helmet** (Secure Headers), **CSP** (Content Security Policy)
    *   ป้องกัน Brute Force ด้วย **Rate Limiting**
    *   ป้องกัน CSRF และ XSS
*   👑 **แผงควบคุมผู้ดูแล (Admin Panel):** จัดการค่า Config ของระบบ, จัดการ User และดูภาพรวมทั้งหมด
*   💬 **ระบบข้อเสนอแนะ (Feedback):** ผู้ใช้สามารถส่ง Feedback พร้อมแนบรูปภาพประกอบได้ (รองรับการอัปโหลดไฟล์)
*   🎨 **ดีไซน์ทันสมัย (Modern UI):** Interface สวยงาม รองรับ **Dark Mode** และ Responsive ใช้งานได้ทุกอุปกรณ์

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

*   **Backend:** Node.js, Express.js
*   **Database:** SQLite (Lightweight, No server required)
*   **Frontend:** EJS (Templating Engine), HTML5, CSS3, JavaScript
*   **Security Modules:** Helmet, CSURF, Express-Rate-Limit, Bcrypt.js, Passport.js

---

## 📥 การติดตั้ง (Installation)

เพื่อให้โปรเจกต์นี้รันบนเครื่องของคุณได้ ทำตามขั้นตอนง่ายๆ ดังนี้:

### 1. ดาวน์โหลดโปรเจกต์ (Clone)
```bash
git clone https://github.com/Sofusan01/penesty.git
cd penesty
```

### 2. ติดตั้ง Dependencies
ติดตั้ง Library ที่จำเป็นทั้งหมดด้วยคำสั่ง:
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ในโฟลเดอร์รากของโปรเจกต์ และกำหนดค่าดังนี้:
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_super_secret_key_change_this
JWT_SECRET=your_jwt_secret_key_change_this
```

### 4. เตรียมฐานข้อมูล (Initialize Database)
ระบบจะสร้างไฟล์ฐานข้อมูล SQLite (`data/database.sqlite`) ให้โดยอัตโนมัติเมื่อเริ่มรันครั้งแรก แต่คุณสามารถรันสคริปต์เพื่อรีเซ็ตหรือเตรียมข้อมูลเบื้องต้นได้:
```bash
node scripts/init_db.js
```

### 5. สร้าง Admin (แนะนำ)
รันคำสั่งนี้เพื่อสร้าง User **Admin** และ **User** ตัวอย่างสำหรับการทดสอบระบบ:
```bash
node scripts/seed_user.js
```
*(ระบบจะแสดง Username/Password ให้เห็นใน Terminal หลังจากรันเสร็จ)*

---

## 🚀 การใช้งาน (Usage)

### 1. เปิดเซิร์ฟเวอร์ (Start Server)
โหมด **Production** (แนะนำ):
```bash
npm start
```
หรือโหมด **Development** (สำหรับการพัฒนา):
```bash
npm run dev
```

### 2. เข้าใช้งานผ่านเว็บ
เปิดเบราว์เซอร์ (Chrome, Edge, Firefox) แล้วไปที่:
> **http://localhost:3000**

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

| ไฟล์ / โฟลเดอร์ | รายละเอียด |
| :--- | :--- |
| `server.js` | จุดเริ่มต้นของเซิร์ฟเวอร์ (Entry Point) และการตั้งค่า SSL |
| `app.js` | การตั้งค่า Express App, Middleware และ Security Configurations |
| `config/` | การตั้งค่าระบบต่าง ๆ (Database, Passport, Multer, Rate Limiters) |
| `controllers/` | โลจิกการทำงานหลัก (Controller Logic) เชื่อมต่อระหว่าง Model และ View |
| `models/` | การจัดการข้อมูลและคำสั่ง SQL (Database Models) |
| `routes/` | กำหนดเส้นทาง URL (API และ Page Routes) |
| `views/` | หน้าเว็บ Frontend (EJS Templates) |
| `public/` | ไฟล์ Static (CSS, JS, Images, Uploads) |
| `scripts/` | สคริปต์ช่วยจัดการระบบ (System Scripts) เช่น การ Seed Database |
| `data/` | ที่เก็บไฟล์ฐานข้อมูล (`database.sqlite`, `sessions.sqlite`) |

---

## 🔒 มาตรการความปลอดภัย (Security Implementation)

โปรเจกต์นี้ให้ความสำคัญกับความปลอดภัย (Security-First Design) โดยมีการนำมาตรการต่างๆ มาใช้:
*   **Secure Headers:** ใช้ HTTP Headers ที่ปลอดภัย (HSTS, X-Content-Type-Options, etc.)
*   **Input Validation:** ตรวจสอบข้อมูลนำเข้าทุกจุดเพื่อป้องกัน Injection Attacks
*   **Authentication:** ใช้ bcrypt ในการ Hash Password และใช้ Secure Session Cookies
*   **Rate Limiting:** จำกัดจำนวนการเรียกใช้งานเพื่อป้องกัน DDoS และ Brute Force

---

<div align="center">
  พัฒนาด้วยความใส่ใจ 💖 | Pentest Estimator
</div>
