import type { FC, SVGProps } from "react";
import { Icons } from "./icons";

export type AvailableIcons = keyof typeof Icons;

type IIcon = {
  name: AvailableIcons;
  size?: string;
} & SVGProps<SVGSVGElement>;

export const Icon: FC<IIcon> = ({ name, size = "1em", ...rest }) => {
  const sizes = { width: size, height: size };
  const IconName = Icons[name];
  return <IconName role="img" aria-label={name} {...sizes} {...rest} />;
};
