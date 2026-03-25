import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function createIcon(path: ReactNode) {
  return function Icon(props: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        {...props}
      >
        {path}
      </svg>
    );
  };
}

export const DashboardIcon = createIcon(
  <>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="5" rx="1.5" />
    <rect x="13" y="10" width="8" height="11" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
  </>,
);

export const InventoryIcon = createIcon(
  <>
    <path d="M3 7.5 12 3l9 4.5-9 4.5L3 7.5Z" />
    <path d="M3 7.5V16.5L12 21l9-4.5V7.5" />
    <path d="M12 12v9" />
  </>,
);

export const ComponentIcon = createIcon(
  <>
    <rect x="3" y="4" width="7" height="7" rx="1.5" />
    <rect x="14" y="4" width="7" height="7" rx="1.5" />
    <rect x="8.5" y="13" width="7" height="7" rx="1.5" />
    <path d="M10 8h4" />
    <path d="M12 11v2" />
  </>,
);

export const CategoryIcon = createIcon(
  <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l2 2h5.5A2.5 2.5 0 0 1 20 9.5v8A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-10Z" />,
);

export const PricingIcon = createIcon(
  <>
    <path d="M12 2v20" />
    <path d="M17 6.5c0-1.93-2.24-3.5-5-3.5S7 4.57 7 6.5 9.24 10 12 10s5 1.57 5 3.5S14.76 17 12 17s-5-1.57-5-3.5" />
  </>,
);

export const OrdersIcon = createIcon(
  <>
    <path d="M8 6h12" />
    <path d="M8 12h12" />
    <path d="M8 18h12" />
    <path d="M4 6h.01" />
    <path d="M4 12h.01" />
    <path d="M4 18h.01" />
  </>,
);

export const InboundIcon = createIcon(
  <>
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M4 19h16" />
  </>,
);

export const CustomersIcon = createIcon(
  <>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 19a6 6 0 0 1 12 0" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M15 19a5 5 0 0 1 6 0" />
  </>,
);

export const ChevronDownIcon = createIcon(<path d="M6 9l6 6 6-6" />);
export const ChevronUpIcon = createIcon(<path d="m6 15 6-6 6 6" />);

export const MenuIcon = createIcon(
  <>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </>,
);

export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>,
);

export const BellIcon = createIcon(
  <>
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.7 1.7 0 0 0 3.4 0" />
  </>,
);

export const LogoutIcon = createIcon(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </>,
);

export function WaterDropIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2c-.3 0-.6.12-.8.35-1.7 1.94-6.2 7.35-6.2 11.15A7 7 0 0019 13.5c0-3.8-4.5-9.21-6.2-11.15A1 1 0 0012 2zm0 19a5 5 0 01-5-5c0-2.24 2.44-5.88 5-8.8 2.56 2.92 5 6.56 5 8.8a5 5 0 01-5 5z" />
    </svg>
  );
}
