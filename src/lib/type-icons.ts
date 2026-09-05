import {
  Code2,
  File,
  FileText,
  Image as ImageIcon,
  Link2,
  Sparkles,
  Terminal,
  type LucideIcon,
} from "lucide-react";

export const TYPE_ICONS: Record<string, LucideIcon> = {
  code: Code2,
  sparkles: Sparkles,
  terminal: Terminal,
  "file-text": FileText,
  file: File,
  image: ImageIcon,
  link: Link2,
};

export const TYPE_ICON_COLORS: Record<string, string> = {
  blue: "text-blue-500",
  purple: "text-purple-500",
  orange: "text-orange-500",
  yellow: "text-yellow-500",
  gray: "text-gray-500",
  pink: "text-pink-500",
  green: "text-green-500",
};

export const TYPE_BORDER_COLORS: Record<string, string> = {
  blue: "border-l-blue-500",
  purple: "border-l-purple-500",
  orange: "border-l-orange-500",
  yellow: "border-l-yellow-500",
  gray: "border-l-border",
  pink: "border-l-pink-500",
  green: "border-l-green-500",
};

export const TYPE_ICON_BG_COLORS: Record<string, string> = {
  blue: "bg-blue-500/10",
  purple: "bg-purple-500/10",
  orange: "bg-orange-500/10",
  yellow: "bg-yellow-500/10",
  gray: "bg-muted",
  pink: "bg-pink-500/10",
  green: "bg-green-500/10",
};
