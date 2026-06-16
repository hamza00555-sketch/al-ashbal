#!/usr/bin/env bash
# ترتيب أصول الواجهة المنزّلة من Higgsfield إلى public/assets بالأسماء الصحيحة.
#
# الاستخدام (من جذر المشروع):
#   bash scripts/organize-assets.sh /path/to/downloads
# إن لم تمرّر مسارًا، يبحث في المجلد الحالي ثم ~/Downloads.
#
# يطابق كل ملف بمعرّفه الفريد داخل الاسم (hf_..._<id>-....png) وينسخه.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="${1:-}"
if [[ -z "$SRC" ]]; then
  if ls hf_*.png >/dev/null 2>&1; then SRC="."; else SRC="$HOME/Downloads"; fi
fi
echo "📂 مصدر الملفات: $SRC"

mkdir -p public/assets/{avatars,badges,icons,illustrations}

# id-fragment  →  المسار النهائي (بدون .png)
MAP="
0121eade icons/icon_home
2853d276 icons/icon_lessons
beda0ae8 icons/icon_tasks
3ff20ca8 icons/icon_progress
99997b13 icons/icon_wishes
ed4ce013 icons/icon_preparation
9c5a5fb4 icons/icon_attendance
f000c401 icons/icon_children
7042d586 icons/icon_review
4d8a3aa7 icons/icon_activity
e2cc39d9 icons/icon_demo_tools
45ee51ea icons/icon_notifications
528964f8 icons/icon_points
7b114e4b icons/icon_record_audio
e6e7412c icons/icon_record_video
2f5c08f0 badges/badge_recitation
4e659fc4 badges/badge_good_behavior
102cfb9f badges/badge_participation
ea82ec9e badges/badge_attendance
804bdca1 badges/badge_progress
082bf57a avatars/avatar_child_boy_01
e0176da7 avatars/avatar_child_girl_01
d8f9018f avatars/avatar_teacher_male_01
8f4e276b avatars/avatar_teacher_female_01
6365047a avatars/avatar_parent_father_01
284933a8 avatars/avatar_parent_mother_01
864f1a24 illustrations/illustration_parent_approval
a0e5d818 illustrations/illustration_waiting_review
54ac1946 illustrations/illustration_no_tasks
07da6415 illustrations/illustration_success
"

found=0; missing=0
while read -r id dest; do
  [[ -z "${id:-}" ]] && continue
  src_file=$(ls "$SRC"/*"$id"*.png 2>/dev/null | head -n1 || true)
  if [[ -n "$src_file" ]]; then
    cp "$src_file" "public/assets/${dest}.png"
    echo "✓ ${dest}.png"
    found=$((found+1))
  else
    echo "✗ مفقود: ${dest}  (لا ملف يحوي $id في $SRC)"
    missing=$((missing+1))
  fi
done <<< "$MAP"

echo "—"
echo "تم نسخ $found أصلًا · مفقود $missing (المطلوب 30)."
echo "ملاحظة: الخلفيات الستة (104xxx) ليست هنا — مكانها public/backgrounds/."
