import { useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BrainCircuit,
  Radar,
  MapPin,
  Users,
  BellRing,
  History,
  Lightbulb,
  User as UserIcon,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  FlaskConical,
  BarChart3,
  Siren,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useGuardian } from "@/hooks/useGuardian";
import { NotificationPanel } from "@/components/NotificationPanel";
import { AlertModal } from "@/components/AlertModal";
import { SOSButton } from "@/components/SOSButton";

const mainNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/monitoring", label: "Monitoring", icon: Radar },
  { to: "/digital-twin", label: "Digital Twin", icon: BrainCircuit },
  { to: "/location", label: "Location", icon: MapPin },
  { to: "/trusted-contacts", label: "Trusted Contacts", icon: Users },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/emergency-history", label: "Emergency History", icon: History },
  { to: "/notifications", label: "Notifications", icon: BellRing },
  { to: "/safety-tips", label: "Safety Tips", icon: Lightbulb },
  { to: "/demo", label: "Demo Mode", icon: FlaskConical },
] as const;

const accountNav = [
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const adminNav = [
  { to: "/admin", label: "Admin Overview", icon: Shield },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/emergencies", label: "Emergencies", icon: Siren },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
] as const;

const mobileNav = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/monitoring", label: "Monitor", icon: Radar },
  { to: "/location", label: "Map", icon: MapPin },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/profile", label: "Profile", icon: UserIcon },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const guardian = useGuardian();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isAdmin = user?.role === "ADMIN";
  const isContact = user?.role === "TRUSTED_CONTACT";

  const NavList = () => (
    <nav className="space-y-6">
      <div className="space-y-1">
        {mainNav.map((item) => (
          <NavItem key={item.to} {...item} active={pathname === item.to} onClick={() => setOpen(false)} />
        ))}
        {isContact ? (
          <NavItem
            to="/trusted-contact/dashboard"
            label="Contact Dashboard"
            icon={Shield}
            active={pathname === "/trusted-contact/dashboard"}
            onClick={() => setOpen(false)}
          />
        ) : null}
      </div>
      <div>
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Account
        </p>
        <div className="space-y-1">
          {accountNav.map((item) => (
            <NavItem key={item.to} {...item} active={pathname === item.to} onClick={() => setOpen(false)} />
          ))}
        </div>
      </div>
      {isAdmin ? (
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Admin
          </p>
          <div className="space-y-1">
            {adminNav.map((item) => (
              <NavItem key={item.to} {...item} active={pathname === item.to} onClick={() => setOpen(false)} />
            ))}
          </div>
        </div>
      ) : null}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <Brand />
        <div className="mt-6 flex-1 overflow-y-auto">
          <NavList />
        </div>
        <button
          onClick={() => {
            logout();
            void navigate({ to: "/login" });
          }}
          className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-background/80"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-sidebar-border bg-sidebar p-4">
            <div className="flex items-center justify-between">
              <Brand />
              <button aria-label="Close" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6">
              <NavList />
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center rounded-xl border border-border lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <p className="font-display text-sm font-semibold">Hi, {user?.name?.split(" ")[0]}</p>
              <p className="text-xs text-muted-foreground">
                {guardian.monitoring ? "Monitoring active" : "Monitoring paused"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationPanel />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 lg:pb-12">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        {mobileNav.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-col items-center gap-1 py-2 text-[10px]",
              pathname === to ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      <SOSButton variant="floating" onTrigger={() => guardian.triggerSos(false)} />

      <AlertModal
        alert={guardian.pendingAlert}
        countdown={guardian.countdown}
        timeout={guardian.settings?.alertTimeoutSeconds ?? 30}
        onSafe={() => void guardian.respondSafe()}
        onNeedHelp={() => void guardian.respondNeedHelp()}
      />
    </div>
  );
}

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Shield className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-display text-base font-bold leading-none">GuardianAI</span>
        <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
          Proactive safety
        </span>
      </span>
    </Link>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof Shield;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      to={to as "/dashboard"}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
