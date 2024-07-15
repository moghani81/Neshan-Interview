import type { SVGProps } from "react";

const Menu = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.5 6C20.5 6.27614 20.2761 6.5 20 6.5H4C3.72386 6.5 3.5 6.27614 3.5 6C3.5 5.72386 3.72386 5.5 4 5.5H20C20.2761 5.5 20.5 5.72386 20.5 6ZM20.5 12C20.5 12.2761 20.2761 12.5 20 12.5H10C9.72386 12.5 9.5 12.2761 9.5 12C9.5 11.7239 9.72386 11.5 10 11.5H20C20.2761 11.5 20.5 11.7239 20.5 12ZM20 18.5C20.2761 18.5 20.5 18.2761 20.5 18C20.5 17.7239 20.2761 17.5 20 17.5H4C3.72386 17.5 3.5 17.7239 3.5 18C3.5 18.2761 3.72386 18.5 4 18.5H20Z"
      fill="currentColor"
    />
  </svg>
);

const Close = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M19 5.00006L5.00006 19M5 5L18.9999 18.9999"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </svg>
);

export const Icons = {
  Menu,
  Close,
};
