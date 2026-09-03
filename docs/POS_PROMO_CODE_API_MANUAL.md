# คู่มือการเชื่อมต่อระบบโค้ดส่วนลดหน้าร้าน (In-Store POS Promo Code API Manual)

คู่มือฉบับนี้จัดทำขึ้นสำหรับทีมพัฒนาระบบชำระเงินหน้าร้าน (POS / Counter System) เพื่อใช้สำหรับเชื่อมต่อ ตรวจสอบสิทธิ์ และตัดยอด **Promo Code** แบบ Real-time ร่วมกับระบบส่วนกลางของ That's Laundry Shop (TLS)

---

## 1. ข้อมูลภาพรวม (Overview & Base URL)

ระบบจะใช้บริการ REST API ผ่าน HTTPS โดยมีระบบหลังบ้านเป็น **Single Source of Truth** ในการคำนวณส่วนลด ตรวจสอบวันหมดอายุ และควบคุมโควตาการใช้งาน ป้องกันการใช้โค้ดซ้ำซ้อนหรือเกินสิทธิ์

| สภาพแวดล้อม (Environment) | Base URL |
|---|---|
| **Local Development** | `http://localhost:3000` |
| **Production Server** | `https://thatlaundryshop.com` *(หรือโดเมน Production ที่เปิดให้บริการ)* |

---

## 2. การยืนยันตัวตน (Authentication)

ทุก Request จากโปรแกรมหน้าร้านจะต้องแนบ Secret Key ผ่าน HTTP Header อย่างใดอย่างหนึ่งดังต่อไปนี้:

```http
x-tls-pos-key: <YOUR_POS_API_SECRET>
```
*หรือ*
```http
Authorization: Bearer <YOUR_POS_API_SECRET>
```

> **ข้อกำหนดความปลอดภัย:**
> * สำหรับช่วงพัฒนา (Local Test) ให้ใช้ Key: `tls_pos_secret_key_dev_2026`
> * บนระบบจริง (Production) ระบบจะออก Secret Key เฉพาะสำหรับสาขา/เครื่อง ห้ามนำ Key ไป Hardcode ในฝั่ง Frontend ที่ผู้ใช้งานทั่วไปแกะดูได้
> * หากไม่ส่ง Key หรือส่ง Key ไม่ถูกต้อง ระบบจะตอบกลับด้วย `401 Unauthorized` ทันที

---

## 3. ผังการทำงาน (Workflow)

```
[ แคชเชียร์สแกน/พิมพ์โค้ด ] 
       │
       ▼
1. POST /api/pos/promo/check ────────► ตรวจสอบสิทธิ์ + คำนวณส่วนลด & ยอดสุทธิ
       │                               (เช็ค: มีโค้ดไหม, เปิดใช้งานอยู่ไหม, อยู่ในช่วงวันไหม, 
       │                                ยอดถึงขั้นต่ำไหม, สิทธิ์เต็มหรือยัง)
       ▼
[ ลูกค้าชำระเงินสำเร็จ ]
       │
       ▼
2. POST /api/pos/promo/redeem ───────► บันทึกตัดยอดใช้งานจริง (usedCount + 1 แบบ Atomic)
                                       พร้อมแนบเลขที่ใบเสร็จ (receiptNo)
────────────────────────────────────────────────────────────────────────────────
(กรณีพิเศษ)
[ ลูกค้ายกเลิกบิล / คืนเงิน ]
       │
       ▼
3. POST /api/pos/promo/void ─────────► คืนสิทธิ์การใช้งาน (usedCount - 1)
```

---

## 4. รายละเอียด Endpoint (API Reference)

---

### Endpoint 1: ตรวจสอบสิทธิ์และคำนวณส่วนลด (`/check`)

เรียกใช้เมื่อแคชเชียร์กรอกรหัสโปรโมชั่นและระบุยอดบิลผ้า เพื่อให้ระบบคำนวณส่วนลดที่ถูกต้องก่อนรับชำระเงิน

* **Method:** `POST`
* **Path:** `/api/pos/promo/check`
* **Headers:**
  ```http
  Content-Type: application/json
  x-tls-pos-key: tls_pos_secret_key_dev_2026
  ```

#### Request Body
```json
{
  "code": "EXPRESS20",
  "orderTotal": 600.00
}
```

| ฟิลด์ | ชนิดข้อมูล | บังคับ | คำอธิบาย |
|---|---|:---:|---|
| `code` | string | ✅ | รหัสโปรโมชั่น (ไม่คำนึงถึงตัวพิมพ์เล็ก/ใหญ่ ระบบแปลงเป็น UPPERCASE ให้อัตโนมัติ) |
| `orderTotal` | number | ⚪ | ยอดรวมของบิลก่อนหักส่วนลด (THB) ใช้สำหรับตรวจสอบยอดขั้นต่ำและคำนวณยอดลด |

#### Response: สำเร็จ (200 OK)

> **หมายเหตุ**: ตัวอย่างนี้ใช้โค้ด `EXPRESS20` (ลด 20%) บนยอด 600 THB โดยมี `maxDiscount: 100` THB — ดังนั้น 20% × 600 = 120 บาท แต่ถูก Cap ที่ 100 บาท

```json
{
  "valid": true,
  "code": "EXPRESS20",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "discountTarget": "ALL",
  "maxDiscount": 100,
  "minOrderValue": 0,
  "orderTotal": 600,
  "discountAmount": 100,
  "netPayable": 500,
  "description": "20% discount on same-day express turnaround",
  "message": "Promo code is valid and applied."
}
```

ตัวอย่างเพิ่มเติม: โค้ดลด 20% บนยอด 400 THB โดยไม่มี `maxDiscount` cap:
```json
{
  "valid": true,
  "code": "SUMMER20",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "discountTarget": "ALL",
  "maxDiscount": null,
  "minOrderValue": 0,
  "orderTotal": 400,
  "discountAmount": 80,
  "netPayable": 320,
  "message": "Promo code is valid and applied."
}
```

ตัวอย่างเพิ่มเติม: โค้ด `FREEDELIVERY` (ฟรีค่ารับส่ง 100% — **Delivery Only**):
```json
{
  "valid": true,
  "code": "FREEDELIVERY",
  "discountType": "PERCENTAGE",
  "discountValue": 100,
  "discountTarget": "DELIVERY",
  "maxDiscount": null,
  "minOrderValue": 1299,
  "orderTotal": 1500,
  "discountAmount": 1500,
  "netPayable": 0,
  "description": "Free pickup and delivery on orders over 1299 THB",
  "message": "Promo code is valid and applied."
}
```

> ⚠️ **สำคัญ**: เมื่อ `discountTarget` เป็น `"DELIVERY"` — ค่า `discountAmount` และ `netPayable` ที่ API คืนมาจะยังคำนวณจาก `orderTotal` ตามปกติ (เพราะ API ไม่รู้ว่าค่ารับส่งของบิลนี้คือเท่าไหร่) **โปรแกรม POS ต้องจัดการ Logic การคำนวณค่ารับส่งด้วยตัวเอง** — ดูรายละเอียดที่ Section 8

#### Response: ไม่ผ่านเงื่อนไข (400 Bad Request / 404 Not Found)
* **กรณีโค้ดไม่มีในระบบ (404):**
  ```json
  { "valid": false, "error": "Promo code not found." }
  ```
* **กรณีโค้ดถูกปิดใช้งานชั่วคราวโดย Admin (400):**
  ```json
  { "valid": false, "error": "This promo code is currently disabled." }
  ```
* **กรณียอดไม่ถึงขั้นต่ำ (400):**
  ```json
  {
    "valid": false,
    "error": "Order total (250 THB) is below the minimum required order value of 300 THB.",
    "minOrderValue": 300,
    "orderTotal": 250
  }
  ```
* **กรณีโค้ดยังไม่ถึงกำหนดเริ่ม (400):**
  ```json
  {
    "valid": false,
    "error": "This promo code will become active on Sep 10, 2026.",
    "startDate": "2026-09-10T00:00:00.000Z"
  }
  ```
* **กรณีโค้ดหมดอายุแล้ว (400):**
  ```json
  {
    "valid": false,
    "error": "This promo code expired on Aug 31, 2026.",
    "endDate": "2026-08-31T23:59:59.000Z"
  }
  ```
* **กรณีสิทธิ์ใช้งานเต็มแล้ว (400):**
  ```json
  { "valid": false, "error": "This promo code has reached its maximum redemption limit." }
  ```

---

### Endpoint 2: บันทึกตัดยอดใช้งานจริง (`/redeem`)

เรียกใช้เมื่อลูกค้าชำระเงินเสร็จสิ้นและออกใบเสร็จแล้วเท่านั้น เพื่อทำการหักโควตาในระบบ ป้องกันการนำโค้ดไปใช้ซ้ำ

* **Method:** `POST`
* **Path:** `/api/pos/promo/redeem`
* **Headers:**
  ```http
  Content-Type: application/json
  x-tls-pos-key: tls_pos_secret_key_dev_2026
  ```

#### Request Body
```json
{
  "code": "EXPRESS20",
  "receiptNo": "INV-20260903-0088",
  "orderTotal": 600.00,
  "discountAmount": 100.00
}
```

| ฟิลด์ | ชนิดข้อมูล | บังคับ | คำอธิบาย |
|---|---|:---:|---|
| `code` | string | ✅ | รหัสโปรโมชั่นที่ต้องการตัดสิทธิ์ |
| `receiptNo` | string | ⚪ | เลขที่ใบเสร็จ หรือ Order ID ของหน้าร้าน (แนะนำให้ส่งเพื่อใช้ Reconcile) |
| `orderTotal` | number | ⚪ | ยอดรวมของบิล |
| `discountAmount` | number | ⚪ | ยอดส่วนลดที่ได้รับ |

#### Response: สำเร็จ (200 OK)
```json
{
  "success": true,
  "code": "EXPRESS20",
  "receiptNo": "INV-20260903-0088",
  "usedCount": 46,
  "usageLimit": 100,
  "remainingUses": 54,
  "message": "Promo code redeemed successfully."
}
```

> **หมายเหตุ**: `remainingUses` จะเป็น `null` ถ้าโค้ดนั้นตั้งค่าเป็น Unlimited (ไม่มี `usageLimit`)

#### Response: ไม่สำเร็จ (400 / 401 / 404 / 500)
* **กรณีโค้ดไม่มีในระบบ (404):**
  ```json
  { "success": false, "error": "Promo code not found." }
  ```
* **กรณีโค้ดถูกปิดใช้งานชั่วคราว (400):**
  ```json
  { "success": false, "error": "This promo code is currently disabled." }
  ```
* **กรณียังไม่ถึงวันเริ่มต้น (400):**
  ```json
  { "success": false, "error": "This promo code is not active yet." }
  ```
* **กรณีหมดอายุแล้ว (400):**
  ```json
  { "success": false, "error": "This promo code has expired." }
  ```
* **กรณีสิทธิ์ใช้งานเต็มแล้ว — รวมถึง Race Condition ที่เพิ่งถูก Redeem โดย Endpoint อื่น (400):**
  ```json
  { "success": false, "error": "This promo code has reached its maximum redemption limit." }
  ```
* **กรณี API Key ไม่ถูกต้อง (401):**
  ```json
  { "success": false, "error": "Unauthorized: Invalid or missing POS API Key." }
  ```

---

### Endpoint 3: คืนสิทธิ์การใช้งาน (`/void`)

เรียกใช้เมื่อมีการยกเลิกบิล (Void Bill) หรือลูกค้าคืนเงิน เพื่อคืนโควตาโค้ดกลับเข้าสู่ระบบ

* **Method:** `POST`
* **Path:** `/api/pos/promo/void`
* **Headers:**
  ```http
  Content-Type: application/json
  x-tls-pos-key: tls_pos_secret_key_dev_2026
  ```

#### Request Body
```json
{
  "code": "EXPRESS20",
  "receiptNo": "INV-20260903-0088",
  "reason": "Customer cancelled order"
}
```

| ฟิลด์ | ชนิดข้อมูล | บังคับ | คำอธิบาย |
|---|---|:---:|---|
| `code` | string | ✅ | รหัสโปรโมชั่นที่ต้องการคืนสิทธิ์ |
| `receiptNo` | string | ⚪ | เลขที่ใบเสร็จที่ต้องการยกเลิก (ใช้สำหรับ Audit Log กระทบยอด) |
| `reason` | string | ⚪ | เหตุผลในการยกเลิก (บันทึกเข้า Audit Log เพื่อการตรวจสอบ) |

#### Response: สำเร็จ (200 OK)
```json
{
  "success": true,
  "code": "EXPRESS20",
  "receiptNo": "INV-20260903-0088",
  "usedCount": 45,
  "usageLimit": 100,
  "message": "Promo code redemption voided successfully."
}
```
*(ระบบมี Floor Protection: `usedCount` จะไม่ลดต่ำกว่า 0 แม้จะมีการกดยกเลิกซ้ำ หรือกด Void เมื่อค่าเป็น 0 อยู่แล้ว)*

#### Response: ไม่สำเร็จ (400 / 401 / 404 / 500)
* **กรณีโค้ดไม่มีในระบบ (404):**
  ```json
  { "success": false, "error": "Promo code not found." }
  ```
* **กรณี API Key ไม่ถูกต้อง (401):**
  ```json
  { "success": false, "error": "Unauthorized: Invalid or missing POS API Key." }
  ```

---

## 5. ตัวอย่างโค้ดสำหรับนำไปใช้งาน (Code Examples)

### ตัวอย่าง 1: cURL (ทดสอบผ่าน Terminal)

```bash
# 1. เช็คสิทธิ์และยอดส่วนลด
curl -X POST "http://localhost:3000/api/pos/promo/check" \
  -H "Content-Type: application/json" \
  -H "x-tls-pos-key: tls_pos_secret_key_dev_2026" \
  -d '{"code": "EXPRESS20", "orderTotal": 500}'

# 2. ตัดยอดใช้งาน
curl -X POST "http://localhost:3000/api/pos/promo/redeem" \
  -H "Content-Type: application/json" \
  -H "x-tls-pos-key: tls_pos_secret_key_dev_2026" \
  -d '{"code": "EXPRESS20", "receiptNo": "INV-001", "orderTotal": 500, "discountAmount": 100}'

# 3. คืนสิทธิ์เมื่อยกเลิกบิล
curl -X POST "http://localhost:3000/api/pos/promo/void" \
  -H "Content-Type: application/json" \
  -H "x-tls-pos-key: tls_pos_secret_key_dev_2026" \
  -d '{"code": "EXPRESS20", "receiptNo": "INV-001"}'
```

---

### ตัวอย่าง 2: JavaScript / Node.js / Electron (fetch)

```javascript
const POS_BASE_URL = "http://localhost:3000";
const POS_API_KEY = "tls_pos_secret_key_dev_2026";

// ฟังก์ชันเช็คโปรโมชั่นก่อนจ่ายเงิน
async function checkPromoCode(code, orderTotal) {
  try {
    const res = await fetch(`${POS_BASE_URL}/api/pos/promo/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tls-pos-key": POS_API_KEY
      },
      body: JSON.stringify({ code, orderTotal })
    });

    const data = await res.json();
    if (res.ok && data.valid) {
      console.log(`ลดได้: ${data.discountAmount} บาท, ยอดจ่ายสุทธิ: ${data.netPayable} บาท`);
      return data;
    } else {
      alert(`ไม่สามารถใช้โค้ดได้: ${data.error}`);
      return null;
    }
  } catch (err) {
    console.error("Network error:", err);
    alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ตรวจสอบโปรโมชั่นได้");
  }
}

// ฟังก์ชันตัดยอดเมื่อชำระเงินสำเร็จ
async function redeemPromoCode(code, receiptNo, orderTotal, discountAmount) {
  const res = await fetch(`${POS_BASE_URL}/api/pos/promo/redeem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tls-pos-key": POS_API_KEY
    },
    body: JSON.stringify({ code, receiptNo, orderTotal, discountAmount })
  });
  return await res.json();
}
```

---

### ตัวอย่าง 3: C# (.NET Framework / WinForms / WPF POS)

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class PosPromoClient
{
    private static readonly HttpClient client = new HttpClient();
    private const string BaseUrl = "http://localhost:3000";
    private const string ApiKey = "tls_pos_secret_key_dev_2026";

    public static async Task CheckPromoAsync(string code, decimal orderTotal)
    {
        var payload = new { code = code, orderTotal = orderTotal };
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        var request = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/api/pos/promo/check");
        request.Headers.Add("x-tls-pos-key", ApiKey);
        request.Content = content;

        var response = await client.SendAsync(request);
        var responseString = await response.Content.ReadAsStringAsync();
        Console.WriteLine(responseString);
    }
}
```

---

## 6. ตารางรหัสสถานะ (HTTP Status & Error Codes)

| HTTP Status | ความหมาย | สิ่งที่โปรแกรม POS ควรปฏิบัติ |
|:---:|---|---|
| **200 OK** | ทำรายการสำเร็จ | นำค่า `discountAmount` และ `netPayable` ไปแสดงบนหน้าจอแคชเชียร์ |
| **400 Bad Request** | เงื่อนไขไม่ผ่าน (เช่น โค้ดหมดอายุ, สิทธิ์เต็ม, ยอดไม่ถึง) | แสดงกล่องข้อความเตือนให้แคชเชียร์ทราบตามฟิลด์ `error` |
| **401 Unauthorized** | API Key ไม่ถูกต้องหรือไม่ได้แนบมา | ตรวจสอบไฟล์ Config ของโปรแกรมหน้าร้าน |
| **404 Not Found** | ไม่พบรหัสโปรโมชั่นในระบบ | แจ้งเตือนว่ารหัสส่วนลดไม่ถูกต้อง |
| **500 Server Error** | เซิร์ฟเวอร์ขัดข้องชั่วคราว | มีปุ่มให้แคชเชียร์กด Retry หรือทำ Manual Override หากจำเป็น |

---

## 7. คำถามที่พบบ่อยและข้อแนะนำ (Best Practices & FAQ)

1. **กรณีเน็ตหน้าร้านหลุดชั่วคราว (Offline Handling):**
   * หากโปรแกรม POS ไม่สามารถยิง Request ไปที่ API ได้ (Network Timeout) แนะนำให้ระบบ POS มีฟังก์ชันสิทธิ์ผู้จัดการร้าน (Supervisor Override) เพื่อให้ใส่ส่วนลดแบบระบุยอดเองได้ เพื่อไม่ให้ลูกค้าต้องรอนาน
2. **การป้องกัน Race Condition:**
   * Endpoint `/redeem` ฝั่งเซิร์ฟเวอร์ถูกเขียนด้วย Database Atomic Transaction (`prisma.$transaction`) ทำให้มั่นใจได้ว่าแม้จะมีหลายสาขายิงตัดยอดโค้ดจำกัดสิทธิ์พร้อมกัน โควตาจะไม่มีวันติดลบหรือเกินจำนวนที่ตั้งไว้แน่นอน
3. **การตรวจสอบยอดกระทบยอด (Reconciliation):**
   * ทุกครั้งที่มีการ `/redeem` ระบบจะบันทึก Log เลขที่ใบเสร็จ (`receiptNo`) และ IP ลง Cloud Logging ทำให้ผู้ตรวจสอบบัญชีสามารถดึงข้อมูลเทียบยอดขายกับโปรโมชั่นที่ใช้จริงได้อย่างแม่นยำ

---

## 8. การจัดการโค้ดประเภท Delivery Only (`discountTarget: "DELIVERY"`)

> อัปเดตเพิ่มเติม: **v2 — 3 Sep 2026**

### 8.1 ฟิลด์ใหม่ `discountTarget`

ตั้งแต่ version นี้เป็นต้นไป Response จาก `/api/pos/promo/check` จะมีฟิลด์ใหม่:

| ฟิลด์ | ชนิดข้อมูล | ค่าที่เป็นไปได้ | คำอธิบาย |
|---|---|---|---|
| `discountTarget` | string | `"ALL"` หรือ `"DELIVERY"` | ระบุว่าส่วนลดนี้คิดจากอะไร |

| ค่า | ความหมาย | ตัวอย่างโค้ด |
|---|---|---|
| `"ALL"` | ส่วนลดคิดจากยอดรวมทั้งบิล (ค่าซักรีด + ค่ารับส่ง) | `TLSWELCOME15`, `EXPRESS20` |
| `"DELIVERY"` | ส่วนลดคิดเฉพาะค่ารับส่ง/จัดส่งเท่านั้น | `FREEDELIVERY` |

---

### 8.2 Logic ที่โปรแกรม POS ต้องจัดการ

```
รับ Response จาก /check แล้ว อ่านค่า discountTarget

discountTarget === "ALL"
  ├─ ใช้ค่า discountAmount และ netPayable จาก Response ได้เลย ✅
  └─ หักจากยอดรวมของบิล (ตามปกติ)

discountTarget === "DELIVERY"
  ├─ ห้ามใช้ค่า discountAmount / netPayable จาก Response ❌
  ├─ ให้อ่านค่า discountType และ discountValue แล้วคำนวณเองจาก deliveryFee ของบิล
  │    - ถ้า discountType = "PERCENTAGE":
  │        deliveryDiscount = (deliveryFee × discountValue) / 100
  │    - ถ้า discountType = "FIXED":
  │        deliveryDiscount = min(discountValue, deliveryFee)
  └─ netPayable = (laundryTotal + deliveryFee) - deliveryDiscount
```

---

### 8.3 ตัวอย่างการคำนวณ (Delivery Only)

**โค้ด `FREEDELIVERY` — ฟรีค่ารับส่ง 100% (ยอดขั้นต่ำ 1,299 THB)**

| รายการ | ยอด (THB) |
|---|---|
| ค่าซักรีด | 1,500 |
| ค่ารับส่ง | 150 |
| **ยอดรวมก่อนลด** | **1,650** |
| ส่วนลดค่ารับส่ง (100%) | -150 |
| **ยอดสุทธิที่ลูกค้าจ่าย** | **1,500** |

```javascript
// ตัวอย่าง Logic บน POS (JavaScript)
async function applyPromo(code, laundryTotal, deliveryFee) {
  const orderTotal = laundryTotal + deliveryFee;
  const res = await fetch("/api/pos/promo/check", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-tls-pos-key": POS_API_KEY },
    body: JSON.stringify({ code, orderTotal })
  });
  const data = await res.json();
  if (!data.valid) throw new Error(data.error);

  let discountAmount = 0;

  if (data.discountTarget === "DELIVERY") {
    // คำนวณส่วนลดจากค่ารับส่งเท่านั้น
    if (data.discountType === "PERCENTAGE") {
      discountAmount = (deliveryFee * data.discountValue) / 100;
    } else {
      discountAmount = Math.min(data.discountValue, deliveryFee);
    }
    console.log(`[Delivery Only] ส่วนลดค่ารับส่ง: ${discountAmount} บาท`);
  } else {
    // ใช้ค่าจาก API ได้เลย (ALL)
    discountAmount = data.discountAmount;
  }

  const netPayable = Math.max(0, orderTotal - discountAmount);
  return { discountAmount, netPayable };
}
```

---

### 8.4 การแสดงผลบนหน้าจอแคชเชียร์และใบเสร็จ

เพื่อความโปร่งใส แนะนำให้แสดงรายการส่วนลดแยกบรรทัดให้ชัดเจน:

```
บริการซักรีด (Wash & Iron 5kg)    1,500.00 THB
ค่ารับส่ง                             150.00 THB
────────────────────────────────────────────────
ยอดรวม                             1,650.00 THB
ส่วนลดค่าจัดส่ง (FREEDELIVERY)      -150.00 THB
────────────────────────────────────────────────
ยอดสุทธิ                           1,500.00 THB
```

---

### 8.5 การ Redeem โค้ดประเภท Delivery Only

เมื่อลูกค้าชำระเงินเสร็จสิ้น ให้ยิง `/redeem` โดยส่ง `discountAmount` ที่คำนวณจากค่ารับส่งจริง (ไม่ใช่จากยอดรวม):

```json
{
  "code": "FREEDELIVERY",
  "receiptNo": "INV-20260903-0099",
  "orderTotal": 1650.00,
  "discountAmount": 150.00
}
```

> **หมายเหตุ**: `discountAmount` ที่ส่งไปใน `/redeem` เป็นแค่ข้อมูลสำหรับ Audit Log เท่านั้น ไม่มีผลต่อการตัดสิทธิ์ — ระบบตัดสิทธิ์โดยการเพิ่ม `usedCount + 1` ทุกครั้งโดยไม่คำนึงถึงยอด


