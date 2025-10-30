import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    key: '',
    telegramId: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.register({
        name: form.name,
        email: form.email,
        password: form.password,
        key: form.key,
        telegramId: form.telegramId ? Number(form.telegramId) : 0,
      });
      await apiClient.login({ email: form.email, password: form.password });
      await fetchUser();
      toast.success('Регистрация успешна!');
      navigate('/dashboard');
    } catch (error: any) {
      const resp = error?.response?.data;
      const msg = typeof resp === 'string'
        ? resp
        : (resp?.error || resp?.message || error?.message || 'Ошибка регистрации');
      toast.error(String(msg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Регистрация</h1>
          <p className="text-gray-600 mt-2">Введите данные и ключ регистрации</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Имя
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="input"
              placeholder="Введите имя"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="input"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="input"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
              Ключ регистрации
            </label>
            <input
              id="key"
              name="key"
              type="text"
              value={form.key}
              onChange={handleChange}
              required
              className="input"
              placeholder="Вставьте ключ от администратора"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="telegramId" className="block text-sm font-medium text-gray-700 mb-2">
              Telegram ID (число)
            </label>
            <input
              id="telegramId"
              name="telegramId"
              type="number"
              value={form.telegramId}
              onChange={handleChange}
              className="input"
              placeholder="Например, 123456789"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
          <div className="text-center pt-4 text-sm">
            Уже есть аккаунт?{' '}
            <a href="/login" className="text-primary-600 hover:underline">Войти</a>
          </div>
        </form>
      </div>
    </div>
  );
}
