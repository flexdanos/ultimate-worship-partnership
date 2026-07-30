export const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/admin/users", label: "Users", icon: "👤" },
  { href: "/admin/partners", label: "Partners", icon: "👥" },
  { href: "/admin/pledges", label: "Pledges", icon: "🧾" },
  {
    href: "/admin/testimonies-moderation",
    label: "Testimonies",
    icon: "💬",
  },
  { href: "/admin/gallery", label: "Gallery", icon: "🖼️" },
  { href: "/admin/reports", label: "Reports", icon: "📊" },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  return (
    pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href))
  );
}
