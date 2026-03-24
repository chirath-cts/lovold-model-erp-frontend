import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { sidebarNavStructure } from "@/shared/constants/navigation";

const drawerWidth = 256;

const cn = (
  ...classes: Array<string | false | null | undefined>
): string => classes.filter(Boolean).join(" ");

type IconProps = { className?: string };

function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ChevronUpIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 15l-6-6-6 6" />
    </svg>
  );
}

function WaterDropIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2c-.3 0-.6.12-.8.35-1.7 1.94-6.2 7.35-6.2 11.15A7 7 0 0019 13.5c0-3.8-4.5-9.21-6.2-11.15A1 1 0 0012 2zm0 19a5 5 0 01-5-5c0-2.24 2.44-5.88 5-8.8 2.56 2.92 5 6.56 5 8.8a5 5 0 01-5 5z" />
    </svg>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  const activeGroupId = useMemo(() => {
    const activeGroup = sidebarNavStructure.find(
      (item) =>
        item.type === "group" &&
        item.children.some((child) =>
          location.pathname === child.path ||
          location.pathname.startsWith(`${child.path}/`),
        ),
    );
    return activeGroup?.id ?? null;
  }, [location.pathname]);

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleGroupToggle = (groupId: string) => {
    setOpenGroupId((current) => (current === groupId ? null : groupId));
  };

  const isGroupOpen = (groupId: string) =>
    openGroupId === groupId || activeGroupId === groupId;

  return (
    <div className="flex h-full flex-col bg-[#e8f6fe] text-[#111d23]">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#003a4d] text-white">
          <WaterDropIcon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-lg font-bold leading-none text-[#003a4d]">
            PengVinERP
          </div>
          <div className="text-[10px] font-medium tracking-[0.05em] text-[#8a8a8a]">
            Enterprise Portal
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 pb-6" aria-label="Primary">
        {sidebarNavStructure.map((item) => {
          if (item.type === "link") {
            const Icon = item.icon;
            const isActive = isPathActive(item.path);

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold leading-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003a4d]",
                  isActive
                    ? "bg-[#003a4d] text-white shadow-sm"
                    : "text-[#40484c] hover:bg-[#003a4d] hover:text-white",
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center text-current">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          }

          const GroupIcon = item.icon;
          const groupIsActive = item.children.some((child) =>
            isPathActive(child.path),
          );
          const isOpen = isGroupOpen(item.id);

          return (
            <div key={item.id} className="space-y-1">
              <button
                type="button"
                onClick={() => handleGroupToggle(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold leading-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003a4d]",
                  groupIsActive || isOpen
                    ? "bg-[#003a4d] text-white shadow-sm"
                    : "text-[#40484c] hover:bg-[#003a4d] hover:text-white",
                )}
                aria-expanded={isOpen}
                aria-controls={`${item.id}-group`}
              >
                {GroupIcon ? (
                  <GroupIcon className="h-5 w-5 shrink-0" />
                ) : (
                  <span className="h-5 w-5" />
                )}

                <span className="flex-1 truncate">{item.label}</span>
                {isOpen ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </button>

              {isOpen && (
                <div
                  id={`${item.id}-group`}
                  className="space-y-1 pl-2"
                  role="group"
                  aria-label={item.label}
                >
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = isPathActive(child.path);

                    return (
                      <NavLink
                        key={child.id}
                        to={child.path}
                        onClick={onNavigate}
                        className={cn(
                          "ml-2 flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold leading-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003a4d]",
                          isChildActive
                            ? "bg-[#003a4d] text-white shadow-sm"
                            : "text-[#40484c] hover:bg-[#003a4d] hover:text-white",
                        )}
                      >
                        <span className="flex h-4 w-4 items-center justify-center text-current">
                          <ChildIcon className="h-4 w-4" />
                        </span>
                        <span className="truncate">{child.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-[#e8f6fe] text-[#111d23] shadow-sm transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:shadow-none",
          "border-r border-[#d7e5ed]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        style={{ width: drawerWidth }}
        aria-label="Sidebar navigation"
      >
        <SidebarContent onNavigate={onClose} />
      </aside>
    </>
  );
}
