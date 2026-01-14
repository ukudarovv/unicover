import { useState, useEffect } from 'react';
import { X, Save, Upload, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { User } from '../../types/lms';
import { useTranslation } from 'react-i18next';

interface UserEditorProps {
  user?: User;
  onSave: (user: Partial<User>) => void;
  onCancel: () => void;
}

export function UserEditor({ user, onSave, onCancel }: UserEditorProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<User & { password?: string }>>(user || {
    fullName: '',
    email: '',
    phone: '',
    role: 'student',
    iin: '',
    city: '',
    organization: '',
    verified: false,
    language: 'ru',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  // Обновляем formData при изменении user (для редактирования)
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'student',
        iin: user.iin || '',
        city: user.city || '',
        organization: user.organization || '',
        verified: user.verified !== undefined ? user.verified : false,
        is_active: user.is_active !== undefined ? user.is_active : true,
        language: user.language || 'ru',
      });
    }
  }, [user?.id]);

  const roles = [
    { value: 'student', label: t('forms.login.studentRole') },
    { value: 'pdek_member', label: t('forms.login.pdekMemberRole') },
    { value: 'pdek_chairman', label: t('forms.login.pdekChairmanRole') },
    { value: 'teacher', label: t('admin.users.teacher') },
    { value: 'admin', label: t('forms.login.adminRole') },
  ];

  const languages = [
    { value: 'ru', label: t('header.russian') },
    { value: 'kz', label: t('header.kazakh') },
    { value: 'en', label: t('header.english') },
  ];

  // Генерация случайного пароля
  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password });
    setGeneratedPassword(password);
    setShowPassword(true);
  };

  const handleSave = () => {
    // Пароль не обязателен - если не указан, backend сгенерирует его автоматически
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {user ? t('admin.users.editUser') : t('admin.users.addUser')}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('admin.users.personalData')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('lms.pdek.fullName')} *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={t('admin.users.fullNamePlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('forms.login.phone')} *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+7 (XXX) XXX-XX-XX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Поле пароля - только при создании нового пользователя */}
                {!user && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('forms.login.password')} <span className="text-gray-500 font-normal">({t('common.optional')})</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password || ''}
                          onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            setGeneratedPassword(null);
                          }}
                          placeholder={t('admin.users.passwordPlaceholder')}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        title={t('admin.users.generatePassword')}
                      >
                        <RefreshCw className="w-4 h-4" />
                        {t('admin.users.generate')}
                      </button>
                    </div>
                    {generatedPassword && (
                      <p className="mt-2 text-sm text-green-600 font-medium">
                        ✓ {t('admin.users.passwordGenerated')}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {t('admin.users.passwordHint')}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('lms.pdek.iin')}
                  </label>
                  <input
                    type="text"
                    value={formData.iin || ''}
                    onChange={(e) => setFormData({ ...formData, iin: e.target.value })}
                    placeholder={t('admin.users.iinPlaceholder')}
                    maxLength={12}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.users.city')}
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder={t('admin.users.cityPlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Work Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('admin.users.workplace')}</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('forms.register.company')}
                  </label>
                  <input
                    type="text"
                    value={formData.organization || formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value, company: e.target.value })}
                    placeholder={t('forms.register.companyPlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('admin.users.systemSettings')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.users.role')} *
                  </label>
                  <select
                    value={formData.role || 'student'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.users.interfaceLanguage')}
                  </label>
                  <select
                    value={formData.language || 'ru'}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.verified}
                      onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{t('admin.users.accountVerified')}</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active !== undefined ? formData.is_active : true}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{t('common.active')}</span>
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
