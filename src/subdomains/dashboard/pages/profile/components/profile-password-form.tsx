import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { Lock } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { TFunction } from 'i18next';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfilePasswordFormProps {
  form: UseFormReturn<PasswordFormData>;
  onSubmit: (data: PasswordFormData) => void | Promise<void>;
  onCancel: () => void;
  t: TFunction;
}

export default function ProfilePasswordForm({
  form,
  onSubmit,
  onCancel,
  t,
}: ProfilePasswordFormProps) {
  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">{t('profile.form.passwordLabel')}</Label>
        <PasswordInput
          type="password"
          leftIcon={<Lock className="w-4 h-4" />}
          name="currentPassword"
          control={form.control}
          placeholder={t('profile.form.passwordPlaceholder')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">{t('profile.form.newPassword')}</Label>
        <PasswordInput
          type="password"
          leftIcon={<Lock className="w-4 h-4" />}
          name="newPassword"
          control={form.control}
          placeholder={t('profile.form.newPasswordPlaceholder')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('profile.form.confirmPass')}</Label>
        <PasswordInput
          type="password"
          leftIcon={<Lock className="w-4 h-4" />}
          name="confirmPassword"
          control={form.control}
          placeholder={t('profile.form.confirmPassPlaceholder')}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          {t('default.cancel')}
        </Button>
        <Button type="submit" className="flex-1">
          <Lock className="w-4 h-4 mr-2" />
          {t('profile.changePass')}
        </Button>
      </div>
    </Form>
  );
}
