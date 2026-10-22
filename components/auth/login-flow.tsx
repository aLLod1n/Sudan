"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/layout/logo";
import { formatPhone } from "@/lib/phone";
import { codeSchema, nameSchema, phoneSchema, type AuthErrorKey } from "@/lib/validators/auth";
import { requestOtp, saveName, verifyOtp } from "@/server/actions/auth";

type Step = { name: "phone" } | { name: "code"; phone: string; resendAt: number } | { name: "name" };

/** Phone -> 6-digit code -> (first login only) name. Used by the popup and /login. */
export function LoginFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>({ name: "phone" });

  if (step.name === "phone") {
    return <PhoneStep onSent={(phone, resendAfter) => setStep({ name: "code", phone, resendAt: Date.now() + resendAfter * 1000 })} />;
  }
  if (step.name === "code") {
    return (
      <CodeStep
        phone={step.phone}
        resendAt={step.resendAt}
        onBack={() => setStep({ name: "phone" })}
        onResent={(resendAfter) => setStep({ ...step, resendAt: Date.now() + resendAfter * 1000 })}
        onVerified={(needsName) => (needsName ? setStep({ name: "name" }) : onDone())}
      />
    );
  }
  return <NameStep onDone={onDone} />;
}

function Header({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  const t = useTranslations("Auth");
  return (
    <div className="mb-6 flex flex-col items-center gap-3 text-center">
      {onBack ? (
        <Button type="button" variant="ghost" size="icon" className="self-start" aria-label={t("back")} onClick={onBack}>
          <ArrowLeft className="rtl:-scale-x-100" aria-hidden />
        </Button>
      ) : (
        <Logo name="" className="[&>span]:hidden [&>svg]:size-12" />
      )}
      <h2 id="login-title" className="text-heading-sm font-semibold tracking-display md:text-[26px]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-foggy" dir="auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  const t = useTranslations("Auth.errors");
  if (!error) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {t(error as AuthErrorKey)}
    </p>
  );
}

function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" variant="brand" size="lg" className="w-full text-base" disabled={pending}>
      {pending && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </Button>
  );
}

// ---------------------------------------------------------------------------

const phoneForm = z.object({ phone: phoneSchema });

function PhoneStep({ onSent }: { onSent: (phone: string, resendAfter: number) => void }) {
  const t = useTranslations("Auth");
  const locale = useLocale() as "ar" | "en";
  const [pending, startTransition] = useTransition();
  const form = useForm<z.input<typeof phoneForm>, unknown, z.output<typeof phoneForm>>({
    resolver: zodResolver(phoneForm),
    defaultValues: { phone: "" },
  });
  const error = form.formState.errors.phone?.message;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(({ phone }) =>
        startTransition(async () => {
          const res = await requestOtp({ phone, locale });
          if (res.ok) onSent(res.phone, res.resendAfter);
          else form.setError("phone", { message: res.error });
        }),
      )}
      className="flex flex-col gap-4"
    >
      <Header title={t("title")} subtitle={t("welcome")} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-phone" className="text-sm font-medium">
          {t("phoneLabel")}
        </label>
        {/* Numbers are always written left-to-right, even in Arabic. */}
        <div dir="ltr" className="flex h-14 items-center rounded-lg border border-input bg-white focus-within:border-hof focus-within:ring-2 focus-within:ring-hof/15 has-[[aria-invalid=true]]:border-destructive">
          <span className="ps-4 pe-2 text-base text-foggy">+249</span>
          <Input
            id="login-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            autoFocus
            placeholder={t("phonePlaceholder")}
            aria-invalid={!!error}
            aria-describedby={error ? "login-phone-error" : "login-phone-hint"}
            className="h-full border-0 bg-transparent ps-0 text-base focus-visible:ring-0 md:text-base"
            {...form.register("phone")}
          />
        </div>
        <ErrorText id="login-phone-error" error={error} />
        {!error && (
          <p id="login-phone-hint" className="text-xs text-foggy">
            {t("phoneHint")}
          </p>
        )}
      </div>
      <SubmitButton pending={pending}>{t("continue")}</SubmitButton>
      <p className="text-center text-xs text-foggy">{t("terms")}</p>
    </form>
  );
}

// ---------------------------------------------------------------------------

const codeForm = z.object({ code: codeSchema });

function CodeStep({
  phone,
  resendAt,
  onBack,
  onResent,
  onVerified,
}: {
  phone: string;
  resendAt: number;
  onBack: () => void;
  onResent: (resendAfter: number) => void;
  onVerified: (needsName: boolean) => void;
}) {
  const t = useTranslations("Auth");
  const locale = useLocale() as "ar" | "en";
  const [pending, startTransition] = useTransition();
  const [now, setNow] = useState(() => Date.now());
  const form = useForm<z.input<typeof codeForm>, unknown, z.output<typeof codeForm>>({
    resolver: zodResolver(codeForm),
    defaultValues: { code: "" },
  });
  const error = form.formState.errors.code?.message;
  const secondsLeft = Math.max(0, Math.ceil((resendAt - now) / 1000));

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const submit = form.handleSubmit(({ code }) =>
    startTransition(async () => {
      const res = await verifyOtp({ phone, code });
      if (res.ok) onVerified(res.needsName);
      else form.setError("code", { message: res.error });
    }),
  );

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <Header title={t("codeTitle")} subtitle={t("codeSent", { phone: formatPhone(phone) })} onBack={onBack} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-code" className="text-sm font-medium">
          {t("codeLabel")}
        </label>
        <Input
          id="login-code"
          dir="ltr"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          placeholder="••••••"
          aria-invalid={!!error}
          aria-describedby={error ? "login-code-error" : undefined}
          className="h-14 text-center text-2xl font-semibold tracking-[0.5em] md:text-2xl"
          {...form.register("code", {
            // Submit automatically once 6 digits are typed or pasted (SMS autofill).
            onChange: (e) => {
              if (e.target.value.replace(/\D/g, "").length === 6) void submit();
            },
          })}
        />
        <ErrorText id="login-code-error" error={error} />
      </div>
      <SubmitButton pending={pending}>{t("verify")}</SubmitButton>
      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="underline underline-offset-4">
          {t("changeNumber")}
        </button>
        {secondsLeft > 0 ? (
          <span className="text-foggy">{t("resendIn", { seconds: secondsLeft })}</span>
        ) : (
          <button
            type="button"
            className="font-medium underline underline-offset-4"
            onClick={() =>
              startTransition(async () => {
                const res = await requestOtp({ phone, locale });
                if (res.ok) {
                  form.clearErrors();
                  onResent(res.resendAfter);
                } else form.setError("code", { message: res.error });
              })
            }
          >
            {t("resend")}
          </button>
        )}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------

const nameForm = z.object({ name: nameSchema });

function NameStep({ onDone }: { onDone: () => void }) {
  const t = useTranslations("Auth");
  const [pending, startTransition] = useTransition();
  const form = useForm<z.input<typeof nameForm>, unknown, z.output<typeof nameForm>>({
    resolver: zodResolver(nameForm),
    defaultValues: { name: "" },
  });
  const error = form.formState.errors.name?.message;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(({ name }) =>
        startTransition(async () => {
          const res = await saveName(name);
          if (res.ok) onDone();
          else form.setError("name", { message: res.error });
        }),
      )}
      className="flex flex-col gap-4"
    >
      <Header title={t("nameTitle")} subtitle={t("nameHint")} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-name" className="text-sm font-medium">
          {t("nameLabel")}
        </label>
        <Input
          id="login-name"
          autoComplete="name"
          autoFocus
          placeholder={t("namePlaceholder")}
          aria-invalid={!!error}
          aria-describedby={error ? "login-name-error" : undefined}
          className="h-14"
          {...form.register("name")}
        />
        <ErrorText id="login-name-error" error={error} />
      </div>
      <SubmitButton pending={pending}>{t("finish")}</SubmitButton>
      <button type="button" onClick={onDone} className="text-sm text-foggy underline underline-offset-4">
        {t("skip")}
      </button>
    </form>
  );
}
