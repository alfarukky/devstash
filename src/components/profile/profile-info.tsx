import { UserAvatar } from "@/components/shared/user-avatar";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileInfoProps {
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
  hasPassword: boolean;
}

const JOINED_FORMAT = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export function ProfileInfo({ name, email, image, createdAt, hasPassword }: ProfileInfoProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <UserAvatar name={name} image={image} className="size-16 text-lg" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-semibold">{name}</h2>
          <p className="truncate text-sm text-muted-foreground">{email}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Joined {JOINED_FORMAT.format(createdAt)} · {hasPassword ? "Email & password" : "GitHub"}{" "}
            sign-in
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
