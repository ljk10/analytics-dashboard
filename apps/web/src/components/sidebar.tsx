"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Briefcase,
  Users,
  Settings,
  LayoutGrid,
  MessageSquare,
} from "lucide-react";

function Logo() {
  return (
    <div className="flex items-center gap-2 px-4 py-6">
      <div className="p-2 bg-primary rounded-lg">
        <Home className="w-5 h-5 text-primary-foreground" />
      </div>
      <span className="font-semibold text-lg text-foreground">Buchhaltung</span>
    </div>
  );
}

function NavItem({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 text-sm font-medium
        rounded-md transition-colors
        ${isActive
          ? "bg-primary text-primary-foreground" // Active: Blue bg, white text
          : "text-gray-700 hover:bg-secondary" // Inactive: Dark text, light gray hover
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  return (
    // Sidebar with white background, dark text, and a border
    <aside className="w-64 h-screen bg-card text-card-foreground flex flex-col fixed border-r border-border">
      <Logo />
      <nav className="flex-1 px-4 space-y-2">
        <NavItem href="/" label="Dashboard" icon={LayoutGrid} />
        <NavItem href="/chat" label="Chat with Data" icon={MessageSquare} />
        <NavItem href="/invoice" label="Invoice" icon={FileText} />
        <NavItem href="/other-files" label="Other files" icon={Briefcase} />
        <NavItem href="/departments" label="Departments" icon={Users} />
        <NavItem href="/users" label="Users" icon={Users} />
        <NavItem href="/settings" label="Settings" icon={Settings} />
      </nav>
      <div className="px-4 py-6">
        <div className="flex items-center gap-3 p-3 rounded-md bg-secondary text-secondary-foreground"> {/* Light gray card */}
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <span className="font-medium">Flowbit AI</span>
        </div>
      </div>
    </aside>
  );
}