# دليل الإعداد - باك إند IEEE

## المتطلبات
- Node.js (الإصدار 14 أو أحدث)
- MongoDB (يمكنك استخدام MongoDB Atlas أو قاعدة بيانات محلية)
- npm أو yarn

## خطوات الإعداد

### 1. تثبيت المكتبات
```bash
npm install
```

### 2. إعداد ملف البيئة (.env)
أنشئ ملف `.env` في المجلد الرئيسي وأضف التالي:

```env
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**ملاحظة:** ستحصل على رابط قاعدة البيانات MongoDB من المستخدم، ضعه في `MONGODB_URI`

### 3. إنشاء مستخدم Admin
بعد الاتصال بقاعدة البيانات، قم بإنشاء مستخدم admin:

```bash
npm run create-admin
```

أو مع بيانات مخصصة:
```bash
node scripts/createAdmin.js admin@ieee.com admin123 "Admin Name"
```

### 4. تشغيل السيرفر

**وضع التطوير:**
```bash
npm run dev
```

**وضع الإنتاج:**
```bash
npm start
```

## المميزات المتوفرة

### ✅ نظام الأحداث (Events)
- إضافة حدث جديد من الداشبورد
- تعديل حدث موجود
- حذف حدث
- عرض الأحداث القادمة (Upcoming)
- عرض الأحداث السابقة (Past Events)

### ✅ نظام الحجز (Event Booking)
نموذج الحجز يتطلب:
- الاسم الكامل
- رقم الهاتف
- البريد الإلكتروني
- الرقم القومي
- السنة الدراسية
- الفرقة الدراسية
- تتبع حالة الدفع (pending, paid, cancelled)

### ✅ نظام المصادقة
- تسجيل مستخدم جديد
- تسجيل الدخول
- التحقق من البريد الإلكتروني (OTP)
- إعادة إرسال OTP
- حماية Routes بالـ JWT Token

### ✅ نظام الصلاحيات
- **Admin**: صلاحيات كاملة (إنشاء، تعديل، حذف)
- **Editor**: يمكن إنشاء وتعديل الأحداث
- **User**: يمكن عرض الأحداث وحجزها فقط

## API Endpoints

### الأحداث (Events)
- `GET /events` - عرض جميع الأحداث (عام)
- `GET /events?type=upcoming` - الأحداث القادمة
- `GET /events?type=past` - الأحداث السابقة
- `GET /events/:id` - عرض حدث محدد
- `POST /events` - إنشاء حدث (Admin/Editor فقط)
- `PATCH /events/:id` - تعديل حدث (Admin/Editor فقط)
- `DELETE /events/:id` - حذف حدث (Admin فقط)

### الحجوزات (Bookings)
- `POST /bookings` - حجز حدث (عام)
- `GET /bookings` - عرض جميع الحجوزات (Admin/Editor فقط)
- `GET /bookings/:id` - عرض حجز محدد
- `PATCH /bookings/:id/payment` - تحديث حالة الدفع
- `DELETE /bookings/:id` - حذف حجز (Admin فقط)

### الداشبورد (Dashboard)
- `GET /dashboard/events` - عرض جميع الأحداث
- `POST /dashboard/createEvent` - إنشاء حدث
- `PATCH /dashboard/updateEvent/:id` - تعديل حدث
- `DELETE /dashboard/deleteEvent/:id` - حذف حدث
- `GET /dashboard/bookings` - عرض جميع الحجوزات
- `GET /dashboard/bookings/:eventId` - عرض حجوزات حدث محدد

### المستخدمين (Users)
- `POST /users/signup` - تسجيل مستخدم جديد
- `POST /users/login` - تسجيل الدخول
- `POST /users/verify` - التحقق من OTP
- `POST /users/resend-otp` - إعادة إرسال OTP
- `POST /users/currentUser` - الحصول على المستخدم الحالي
- `GET /users/events` - عرض الأحداث (للمستخدمين)

## هيكل قاعدة البيانات

### Event Schema
```javascript
{
  title: String,
  mainTitle: String,
  description: String,
  date: String,
  eventDate: Date,
  locationEvent: String,
  image: String,
  link: String,
  isUpcoming: Boolean,
  isActive: Boolean,
  maxParticipants: Number,
  registrationFee: Number,
  createdBy: ObjectId
}
```

### EventBooking Schema
```javascript
{
  eventId: ObjectId,
  name: String,
  phone: String,
  email: String,
  nationalId: String,
  academicYear: String,
  academicDivision: String,
  paymentStatus: String, // pending, paid, cancelled
  paymentAmount: Number,
  paymentMethod: String,
  paymentReference: String,
  paymentDate: Date,
  isConfirmed: Boolean
}
```

### User Schema
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: String, // user, admin, editor
  isVerified: Boolean,
  otp: String,
  otpExpires: Date
}
```

## ملاحظات مهمة

1. **قاعدة البيانات**: بعد الحصول على رابط MongoDB، ضعه في ملف `.env` في `MONGODB_URI`

2. **CORS**: تم إعداد CORS للسماح للفرونت إند بالاتصال. تأكد من تحديث `FRONTEND_URL` في `.env`

3. **الأمان**: 
   - جميع كلمات المرور مشفرة باستخدام bcrypt
   - JWT Tokens تستخدم للمصادقة
   - التحقق من البيانات باستخدام express-validator

4. **منع التكرار**: النظام يمنع حجز نفس الشخص لنفس الحدث مرتين

5. **الحد الأقصى للمشاركين**: يمكنك تحديد عدد أقصى للمشاركين في كل حدث

## الدعم

إذا واجهت أي مشاكل، تأكد من:
- أن MongoDB متصل ويعمل
- أن جميع المتغيرات في `.env` صحيحة
- أن المنافذ غير مستخدمة
- أن المكتبات مثبتة بشكل صحيح

