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
  src,
}: {
  name: string;
  hue: number;
  size?: keyof typeof sizes;
  src?: string;
}) {
  if (src) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ${sizes[size]}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} className="h-full w-full object-cover" />
      </span>
    );
  }

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
