#!/usr/bin/env bash
# تنزيل كل أصول الواجهة (شفافة) إلى public/assets بالأسماء التي يتوقعها التطبيق.
# شغّله محليًا من جذر المشروع:  bash scripts/download-assets.sh
# (روابط Higgsfield مؤقتة — نزّلها قريبًا.)
set -euo pipefail
cd "$(dirname "$0")/.."
B="https://d8j0ntlcm91z4.cloudfront.net/user_3E1uwg09F9UoCSTlAoXJKL9reW5"

dl () { # dl <dest-path> <url>
  echo "→ $1"
  curl -fSL --retry 3 -o "$1" "$2"
}

mkdir -p public/assets/{avatars,badges,icons,illustrations}

# ---- icons ----
dl public/assets/icons/icon_home.png          "$B/hf_20260616_142543_0121eade-f780-4771-9070-e0300ee26b27.png"
dl public/assets/icons/icon_lessons.png       "$B/hf_20260616_142916_2853d276-1f19-48e4-8816-bc84b340b7ea.png"
dl public/assets/icons/icon_tasks.png         "$B/hf_20260616_142918_beda0ae8-7d29-4d92-a1c2-350b1d177ae6.png"
dl public/assets/icons/icon_progress.png      "$B/hf_20260616_142919_3ff20ca8-96c0-4e31-a51f-e1b9f72cbe68.png"
dl public/assets/icons/icon_wishes.png        "$B/hf_20260616_142922_99997b13-3605-41ee-9408-8e65761fc6e4.png"
dl public/assets/icons/icon_preparation.png   "$B/hf_20260616_142924_ed4ce013-bc9e-4a56-a6e2-cc6acc9ca5c2.png"
dl public/assets/icons/icon_attendance.png    "$B/hf_20260616_142928_9c5a5fb4-02b1-4eb8-9b57-50e0d63f7d9d.png"
dl public/assets/icons/icon_children.png      "$B/hf_20260616_142929_f000c401-6f21-4322-906d-a0a244d7d7a0.png"
dl public/assets/icons/icon_review.png        "$B/hf_20260616_142933_7042d586-23e9-4357-bbee-59466b05cb46.png"
dl public/assets/icons/icon_activity.png      "$B/hf_20260616_142937_4d8a3aa7-7c83-4bac-ac6c-e3e6fec93964.png"
dl public/assets/icons/icon_demo_tools.png    "$B/hf_20260616_142938_e2cc39d9-cdcd-4a26-8b20-1c1ff8d4e17d.png"
dl public/assets/icons/icon_notifications.png "$B/hf_20260616_142941_45ee51ea-8192-4a87-b4f7-2e08955bd401.png"
dl public/assets/icons/icon_points.png        "$B/hf_20260616_142944_528964f8-c862-448a-b821-d664b385c69d.png"
dl public/assets/icons/icon_record_audio.png  "$B/hf_20260616_142946_7b114e4b-8750-4d53-a03e-8cc8e7000fbf.png"
dl public/assets/icons/icon_record_video.png  "$B/hf_20260616_142948_e6e7412c-e681-4fa0-a94b-dba26b837f63.png"

# ---- badges ----
dl public/assets/badges/badge_recitation.png    "$B/hf_20260616_142950_2f5c08f0-420a-42cd-954f-d86e2a986ec3.png"
dl public/assets/badges/badge_good_behavior.png "$B/hf_20260616_142951_4e659fc4-f7a5-4c07-a7dd-c2bf527c6e1a.png"
dl public/assets/badges/badge_attendance.png    "$B/hf_20260616_143047_ea82ec9e-68b0-4665-8e9a-2263cc267ee8.png"
dl public/assets/badges/badge_progress.png      "$B/hf_20260616_143049_804bdca1-97be-4c38-9c4f-8561e46169af.png"
dl public/assets/badges/badge_participation.png "$B/hf_20260616_142957_102cfb9f-2546-4e04-b278-605db17fa6ca.png"

# ---- avatars ----
dl public/assets/avatars/avatar_child_boy_01.png      "$B/hf_20260616_143000_082bf57a-6e9e-4c55-b36e-9fa753958456.png"
dl public/assets/avatars/avatar_child_girl_01.png     "$B/hf_20260616_143050_e0176da7-0064-4c84-ac5b-8d873581ef21.png"
dl public/assets/avatars/avatar_teacher_male_01.png   "$B/hf_20260616_143012_d8f9018f-9556-4d08-b811-18f5054ec4f4.png"
dl public/assets/avatars/avatar_teacher_female_01.png "$B/hf_20260616_143052_8f4e276b-7d38-4482-914f-29e73e605119.png"
dl public/assets/avatars/avatar_parent_father_01.png  "$B/hf_20260616_143015_6365047a-65c7-4b7f-8e64-5a3b6269ce98.png"
dl public/assets/avatars/avatar_parent_mother_01.png  "$B/hf_20260616_143055_284933a8-47de-46e9-9130-9fea59f3fc2a.png"

# ---- illustrations ----
dl public/assets/illustrations/illustration_parent_approval.png "$B/hf_20260616_143018_864f1a24-3a04-4a6e-bf05-916480994179.png"
dl public/assets/illustrations/illustration_no_tasks.png        "$B/hf_20260616_143057_54ac1946-3285-47fa-a710-ac7e5734b824.png"
dl public/assets/illustrations/illustration_waiting_review.png  "$B/hf_20260616_143021_a0e5d818-db54-4dd4-9694-eb1493af2519.png"
dl public/assets/illustrations/illustration_success.png         "$B/hf_20260616_143059_07da6415-dc48-48f3-b1a6-66297ad43141.png"

echo "✅ تم تنزيل 30 أصلًا إلى public/assets/"
