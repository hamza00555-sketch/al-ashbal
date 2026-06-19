// Barrel export for the الأشبال core UI component library.

// ui primitives
export { Button } from "./ui/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./ui/Button";
export { Card } from "./ui/Card";
export type { CardProps, CardVariant } from "./ui/Card";
export { Badge } from "./ui/Badge";
export type { BadgeProps, BadgeTone } from "./ui/Badge";
export { Avatar } from "./ui/Avatar";
export type { AvatarProps, AvatarSize } from "./ui/Avatar";
export { AssetImage } from "./ui/AssetImage";
export { AppIcon } from "./ui/AppIcon";
export { AppAssetIcon } from "./ui/AppAssetIcon";
export type { AppAssetIconProps, AssetIconSize, AssetIconVariant } from "./ui/AppAssetIcon";
export { AppIllustration } from "./ui/AppIllustration";
export { CardOverlayMotif } from "./ui/CardOverlayMotif";
export type { OverlayMotif } from "./ui/CardOverlayMotif";
export { BadgeMedal } from "./ui/BadgeMedal";
export { SectionTitle } from "./ui/SectionTitle";
export type { SectionTitleProps } from "./ui/SectionTitle";
export { Modal } from "./ui/Modal";
export type { ModalProps } from "./ui/Modal";
export { Drawer } from "./ui/Drawer";
export type { DrawerProps } from "./ui/Drawer";
export { RecitationPreview } from "./ui/RecitationPreview";
export { RecordingPlayer } from "./ui/RecordingPlayer";

// notifications
export { NotificationBell } from "./notifications/NotificationBell";
export { NotificationList } from "./notifications/NotificationList";

// progress
export { ProgressBar } from "./progress/ProgressBar";
export type { ProgressBarProps, ProgressTone } from "./progress/ProgressBar";
export { ProgressRing } from "./progress/ProgressRing";
export type { ProgressRingProps, ProgressRingTone } from "./progress/ProgressRing";

// cards
export { StatCard } from "./cards/StatCard";
export type { StatCardProps, StatTone } from "./cards/StatCard";

// layout & shell
export { PageHeader } from "./layout/PageHeader";
export type { PageHeaderProps } from "./layout/PageHeader";
export { AppShell } from "./layout/AppShell";
export type { AppShellProps, AppBackgroundKey } from "./layout/AppShell";
export { MobileNav } from "./layout/MobileNav";
export type { MobileNavProps } from "./layout/MobileNav";
export { AppBottomNav } from "./layout/AppBottomNav";
export type { BottomNavItem } from "./layout/AppBottomNav";
export { DesktopSidebar } from "./layout/DesktopSidebar";
export type { DesktopSidebarProps } from "./layout/DesktopSidebar";
export { DemoExperienceSwitcher } from "./layout/DemoExperienceSwitcher";
export { SettingsLink } from "./layout/SettingsLink";
export { RoleSwitcher } from "./layout/RoleSwitcher";
export type { RoleSwitcherProps, RoleOption } from "./layout/RoleSwitcher";
export type { NavItem } from "./layout/types";

// auth (demo profile/role shell — not real auth)
export { DemoProfilePanel } from "./auth/DemoProfilePanel";
