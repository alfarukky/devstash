import {
  Code,
  File,
  Image,
  Link,
  Sparkles,
  StickyNote,
  Terminal,
  type LucideIcon,
} from "lucide-react";

/**
 * ItemType records from the database store `icon` as a literal lucide-react
 * component name (e.g. "Code", "StickyNote") and `color` as a hex value.
 */
const DB_TYPE_ICONS: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};

export function getDbTypeIcon(iconName: string | null): LucideIcon {
  if (iconName && iconName in DB_TYPE_ICONS) {
    return DB_TYPE_ICONS[iconName];
  }
  return File;
}
