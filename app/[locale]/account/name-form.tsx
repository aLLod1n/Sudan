"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import { nameSchema, type AuthErrorKey } from "@/lib/validators/auth";
import { saveName } from "@/server/actions/auth";

const schema = z.object({ name: nameSchema });

export function NameForm({ defaultName }: { defaultName: string }) {
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const { refresh } = useAuth();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultName },
  });
  const error = form.formState.errors.name?.message;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(({ name }) =>
        startTransition(async () => {
          setSaved(false);
          const res = await saveName(name);
          if (!res.ok) return form.setError("name", { message: res.error });
          setSaved(true);
          await refresh();
          router.refresh();
        }),
      )}
      className="flex flex-col gap-1.5"
    >
      <label htmlFor="account-name" className="text-sm font-medium">
        {t("nameLabel")}
      </label>
      <div className="flex gap-2">
        <Input
          id="account-name"
          autoComplete="name"
          placeholder={t("namePlaceholder")}
          aria-invalid={!!error}
          aria-describedby={error ? "account-name-error" : undefined}
          {...form.register("name", { onChange: () => setSaved(false) })}
        />
        <Button type="submit" disabled={pending} className="shrink-0">
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : saved && <Check aria-hidden />}
          {tCommon("save")}
        </Button>
      </div>
      {error && (
        <p id="account-name-error" role="alert" className="text-sm text-destructive">
          {t(`errors.${error as AuthErrorKey}`)}
        </p>
      )}
    </form>
  );
}
