# Auth / Profiles Phase 2 Scope

> وثيقة scope فقط لأول تنفيذ backend لاحقًا. لا كود، لا backend، لا auth، لا
> packages، لا migrations الآن. تستند إلى قرارات v1 في
> `docs/PRODUCTION_DATA_MODEL_SCHEMA.md` و`docs/BACKEND_AUTH_DATA_MODEL_DECISION.md`.

التاريخ: 2026-06-18 · الحالة: **scope معتمد — لم يُنفّذ بعد**

---

## Goal

أول تنفيذ backend **صغير ومعزول** لاحقًا، هدفه فقط:

- **auth shell** (هيكل مصادقة).
- **profiles**.
- **roles**.
- **بدون** ترحيل materials / lessons / assignments / submissions / points بعد.

---

## In Scope

- اختيار **Supabase** كاتجاه مرشّح، لكن **التنفيذ لاحقًا فقط**.
- **profiles للمعلم وولي الأمر** (الطفل = child profile فقط، بلا auth user — قرار v1 #1).
- حقل **role** على الـ profile.
- **demo-safe auth switch** أو **auth shell** حسب ما يناسب التنفيذ لاحقًا (لا يكسر الـ demo).
- تجهيز **types للـ profile** (مصدر نوع موحّد يطابق أسماء أعمدة الـ schema).
- **الحفاظ على demo/localStorage** لباقي التطبيق.
- **عدم نقل Learning Materials** بعد.

---

## Out of Scope

- لا materials backend.
- لا lessons backend.
- لا assignments backend.
- لا submissions backend.
- لا media storage.
- لا notifications.
- لا child independent login.
- لا parent onboarding كامل.
- لا RLS policies تنفيذية في هذه المرحلة.
- لا migration للبيانات.

---

## Phase 2 Acceptance Criteria (عند التنفيذ لاحقًا)

عند تنفيذ Phase 2 لاحقًا يجب أن:

- **لا يكسر demo mode**.
- **لا يكسر** تجربة المعلم والطفل وولي الأمر.
- **لا ينقل** البيانات من localStorage بعد.
- يسمح بوجود **profile/role فقط**.
- يكون **قابلًا للرجوع بسهولة** (revertible).

---

## Risks

- **البدء بـ backend كامل** سيكسر المشروع.
- **نقل المواد/التسجيلات مبكرًا** سيزيد التعقيد.
- **إعدادات المستخدمين قبل profiles** ستسبب إعادة عمل.

---

## Recommended Next Implementation

`Auth-Profiles-Phase2-Implementation-01`

> **لا تنفّذه الآن.** هذه الوثيقة scope/تجهيز فقط؛ التنفيذ يبدأ بطلب صريح لاحق.

---

_وثيقة scope توثيقية فقط — لا كود/UI/CSS/packages/migrations._
