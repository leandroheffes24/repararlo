import { initials } from "@/lib/utils";

const sizes = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-20 w-20 text-2xl",
  xl: "h-24 w-24 text-3xl",
};

export function Avatar({
  name,
  hue,
  size = "md",
}: {
  name: string;
  hue: number;
  size?: keyof typeof sizes;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white ${sizes[size]}`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${
          (hue + 35) % 360
        } 75% 45%))`,
      }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
