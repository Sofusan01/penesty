<div align="center">

<img src="https://readme-typing-svg.herokuapp.com?font=Outfit&weight=600&size=30&pause=1000&color=0EA5E9&center=true&vCenter=true&width=600&lines=Pentest+Estimator+Web+Application;ระบบประเมินราคาและระยะเวลา+Pentest;Secure+%7C+Modern+%7C+Efficient" alt="Typing SVG" />

<br>

<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
<img src="https://img.shields.io/badge/EJS-E34F26?style=for-the-badge&logo=html5&logoColor=white" />

<br>
<br>

**เว็บแอปพลิเคชันสำหรับประเมินความพยายาม (Effort) และระยะเวลาในการทำ Penetration Testing**  
ออกแบบมาเพื่อช่วยคำนวณ Man-days ตามมาตรฐาน โดยพิจารณาจากจำนวนฟังก์ชัน, ประเภทแอปพลิเคชัน และวิธีการทดสอบ (Blackbox / Graybox / Whitebox)

[ฟีเจอร์เด่น](#ฟีเจอร์เด่น) • [การติดตั้ง](#การติดตั้ง) • [การใช้งาน](#การใช้งาน) • [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)

---
</div>

## ✨ ฟีเจอร์เด่น (Features)

*   🚀 **ระบบคำนวณอัตโนมัติ (Estimation Engine):** คำนวณวันทำงาน (Man-days) แม่นยำตามสูตรมาตรฐาน
*   📊 **แดชบอร์ดผู้ใช้ (Dashboard):** ดูประวัติการประเมินย้อนหลัง และสถานะงาน
*   🛡️ **ระบบรักษาความปลอดภัย (Security):** ระบบล็อกอิน/สมัครสมาชิกที่ปลอดภัยด้วย Session และ Token
*   👑 **แผงควบคุมผู้ดูแล (Admin Panel):** จัดการค่า Config ของระบบและดูภาพรวม User ทั้งหมด
*   💬 **ระบบข้อเสนอแนะ (Feedback):** ผู้ใช้สามารถส่ง Feedback พร้อมแนบรูปภาพประกอบได้
*   🎨 **ดีไซน์ทันสมัย (Modern UI):** รองรับ **Dark Mode** และ Responsive ใช้งานได้ทุกอุปกรณ์

---

## 🛠️ การติดตั้ง (Installation)

เพื่อให้โปรเจกต์นี้รันบนเครื่องของคุณได้ ทำตามขั้นตอนง่ายๆ ดังนี้:

### 1. 📥 ดาวน์โหลดโปรเจกต์ (Clone)
```bash
git clone https://github.com/Dunkphanpron/Pentest-Estimator.git
cd Pentest-Estimator
```

### 2. 📦 ติดตั้ง Dependencies
ติดตั้ง Library ที่จำเป็นทั้งหมดด้วยคำสั่ง:
```bash
npm install
```

### 3. 🗄️ สร้างฐานข้อมูล (Initialize Database)
คำสั่งนี้จะสร้างไฟล์ฐานข้อมูล SQLite (`data/database.sqlite`) ให้พร้อมใช้งาน:
```bash
node scripts/init_db.js
```

### 4. 👤 สร้าง Admin (แนะนำ)
รันคำสั่งนี้เพื่อสร้าง User **Admin** เริ่มต้นสำหรับการทดสอบระบบ:
```bash
node scripts/seed_user.js
```
*(ระบบจะแสดง Username/Password ให้เห็นใน Terminal หลังจากรันเสร็จ)*

---

## 🚀 การใช้งาน (Usage)

### 1. เปิดเซิร์ฟเวอร์ (Start Server)
```bash
npm start
```
หรือรันแบบพื้นฐาน:
```bash
node server.js
```

### 2. เข้าใช้งานผ่านเว็บ
เปิดเบราว์เซอร์ (Chrome, Edge, Firefox) แล้วไปที่:
> **http://localhost:3000**

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

| ไฟล์ / โฟลเดอร์ | รายละเอียด |
| :--- | :--- |
| `server.js` | จุดเริ่มต้นของเซิร์ฟเวอร์ (Entry Point) |
| `app.js` | การตั้งค่า Express App และ Middleware ทั้งหมด |
| `controllers/` | โลจิกการทำงานหลัก (Controller Logic) |
| `models/` | การจัดการฐานข้อมูล SQLite (Database Models) |
| `routes/` | เส้นทาง API และหน้าเว็บ (Routes) |
| `views/` | หน้าเว็บ Frontend (EJS Templates) |
| `public/` | ไฟล์ Static (CSS, JS, Images, Uploads) |
| `scripts/` | สคริปต์ช่วยจัดการระบบ (System Scripts) |
| `data/` | ที่เก็บไฟล์ฐานข้อมูล (`database.sqlite`) |

---

<div align="center">
  พัฒนาด้วยความใส่ใจ 💖 | Pentest Estimator
</div>
