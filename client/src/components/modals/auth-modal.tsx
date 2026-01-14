import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const title = mode === "login" ? t('authModal.welcomeBack') : t('authModal.createAccount');
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") {
      const emailOk = /.+@.+\..+/.test(email);
      if (!name.trim() || !emailOk || password.length < 6) {
        toast({
          title: t('authModal.validation.invalidDetails'),
          description: !name.trim()
            ? t('authModal.validation.nameRequired')
            : !emailOk
            ? t('authModal.validation.emailInvalid')
            : t('authModal.validation.passwordMin'),
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      setName("");
      setEmail("");
      setPassword("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed z-[61] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-xl rounded-2xl border bg-card p-6 shadow-xl focus:outline-none">
          <Dialog.Title className="font-serif text-3xl text-center mb-6">{title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {t('authModal.description')}
          </Dialog.Description>
          <form className="space-y-4" onSubmit={onSubmit}>
            {mode === "register" && (
              <div>
                <label className="block text-sm mb-2">{t('authModal.fullName')}</label>
                <Input placeholder={t('authModal.fullNamePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
              </div>
            )}
            <div>
              <label className="block text-sm mb-2">{t('authModal.email')}</label>
              <Input type="email" placeholder={t('authModal.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm mb-2">{t('authModal.password')}</label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} disabled={loading} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center justify-center">
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  {mode === "login" ? t('authModal.loggingIn') : t('authModal.creatingAccount')}
                </span>
              ) : (
                mode === "login" ? t('authModal.login') : t('authModal.register')
              )}
            </Button>
          </form>

          <div className="text-center text-muted-foreground mt-6">
            {mode === "login" ? (
              <button className="underline" onClick={() => setMode("register")}>{t('authModal.noAccount')}</button>
            ) : (
              <button className="underline" onClick={() => setMode("login")}>{t('authModal.hasAccount')}</button>
            )}
          </div>

          <Dialog.Close asChild>
            <button aria-label={t('authModal.close')} className="absolute right-3 top-3 rounded-full p-2 hover:bg-muted">✕</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
