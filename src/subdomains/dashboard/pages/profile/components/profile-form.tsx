import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import ImageDropzone from '@/components/Dropzone';
import { UseFormReturn } from 'react-hook-form';
import { TFunction } from 'i18next';

interface ProfileFormData {
  name: string;
  email: string;
}

interface ProfileFormProps {
  form: UseFormReturn<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => void | Promise<void>;
  onCancel: () => void;
  file: File | null;
  setFile: (file: File | null) => void;
  onSaveAvatar: (file: File) => void | Promise<void>;
  isLoading: boolean;
  initialAvatar?: string;
  t: TFunction;
}

export default function ProfileForm({
  form,
  onSubmit,
  onCancel,
  file,
  setFile,
  onSaveAvatar,
  isLoading,
  initialAvatar,
  t,
}: ProfileFormProps) {
  return (
    <>
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <ImageDropzone
            setFile={setFile}
            initialImage={initialAvatar}
          />
        </div>
      </div>
      <Form form={form} onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">{t('signIn.nameLabel')}</Label>
          <Input
            leftIcon={<User className="w-4 h-4" />}
            type="text"
            name="name"
            placeholder={t('profile.form.namePlaceholder')}
            control={form.control}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t('login.emailInput')}</Label>
          <Input
            leftIcon={<Mail className="w-4 h-4" />}
            type="email"
            name="email"
            control={form.control}
            placeholder={t('login.emailPlaceholder')}
            disabled
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
            <Save className="w-4 h-4 mr-2" />
            {t('profile.form.saveInfo')}
          </Button>
        </div>
      </Form>
      {file && (
        <Button
          className="w-full mt-4"
          onClick={() => onSaveAvatar(file)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {t('profile.avatar')}
        </Button>
      )}
    </>
  );
}
