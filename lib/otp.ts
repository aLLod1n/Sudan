/**
 * One-time-code delivery (SMS / WhatsApp). Pick the provider with OTP_PROVIDER.
 *
 * To add a real provider: implement OtpSender (one `send` call to its HTTP
 * API), register it in `providers` below, set OTP_PROVIDER in .env.
 */
export interface OtpSender {
  send(phone: string, code: string, locale: "ar" | "en"): Promise<void>;
}

/** Development: prints the code in the server terminal. */
const consoleSender: OtpSender = {
  async send(phone, code) {
    console.log(`\n[OTP] ${phone} → ${code}\n`);
  },
};

// Example shape for a real provider (kept as a guide; not registered):
//
// const twilioSender: OtpSender = {
//   async send(phone, code, locale) {
//     const body = locale === "ar" ? `رمز الدخول إلى دارنا: ${code}` : `Your Darna code: ${code}`;
//     await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`, {
//       method: "POST",
//       headers: { Authorization: `Basic ${btoa(`${SID}:${TOKEN}`)}` },
//       body: new URLSearchParams({ To: phone, From: FROM, Body: body }),
//     });
//   },
// };

const providers: Record<string, OtpSender> = {
  console: consoleSender,
};

export function getOtpSender(): OtpSender {
  const name = process.env.OTP_PROVIDER ?? "console";
  const sender = providers[name];
  if (!sender) throw new Error(`Unknown OTP_PROVIDER "${name}"`);
  if (name === "console" && process.env.NODE_ENV === "production") {
    console.warn("[OTP] OTP_PROVIDER=console in production: codes are only logged, not sent.");
  }
  return sender;
}
