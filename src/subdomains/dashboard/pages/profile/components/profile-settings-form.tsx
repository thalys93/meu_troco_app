import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Form } from '@/components/ui/form';
import { Save, Bell, Mail } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { TFunction } from 'i18next';

interface SettingsFormData {
  emailNotifications: boolean;
  pushNotifications: boolean;
  monthlyReports: boolean;
}

interface ProfileSettingsFormProps {
  form: UseFormReturn<SettingsFormData>;
  onSubmit: (data: SettingsFormData) => void | Promise<void>;
  onCancel: () => void;
  t: TFunction;
}

export default function ProfileSettingsForm({
  form,
  onSubmit,
  onCancel,
  t,
}: ProfileSettingsFormProps) {
  const { watch } = form;
  const emailNotifications = watch('emailNotifications');
  const pushNotifications = watch('pushNotifications');
  const monthlyReports = watch('monthlyReports');

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="emailNotifications" className="text-base font-semibold cursor-pointer">
                {t('profile.settings.emailNotifications')}
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('profile.settings.emailNotificationsDescription')}
            </p>
          </div>
          <Switch
            id="emailNotifications"
            checked={emailNotifications}
            onCheckedChange={(checked) => form.setValue('emailNotifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="pushNotifications" className="text-base font-semibold cursor-pointer">
                {t('profile.settings.pushNotifications')}
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('profile.settings.pushNotificationsDescription')}
            </p>
          </div>
          <Switch
            id="pushNotifications"
            checked={pushNotifications}
            onCheckedChange={(checked) => form.setValue('pushNotifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="monthlyReports" className="text-base font-semibold cursor-pointer">
                {t('profile.settings.monthlyReports')}
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('profile.settings.monthlyReportsDescription')}
            </p>
          </div>
          <Switch
            id="monthlyReports"
            checked={monthlyReports}
            onCheckedChange={(checked) => form.setValue('monthlyReports', checked)}
          />
        </div>
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
          <Save className="w-4 h-4 mr-2" />
          {t('profile.settings.saveSettings')}
        </Button>
      </div>
    </Form>
  );
}
