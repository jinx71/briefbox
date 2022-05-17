import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.email) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'That doesn\'t look like an email';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);
    try {
      await login({ email: form.email.trim().toLowerCase(), password: form.password });
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not sign in';
      toast.error(msg);
      setErrors((prev) => ({ ...prev, _form: msg }));
    } finally {
      setSubmitting(false);
    }
  };

  const onChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <section className="mx-auto max-w-md space-y-6 py-6">
      <header className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-ink-600 dark:text-ink-400">
          Saved stories sync to your account.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-4 rounded-2xl border border-ink-200/60 bg-white p-6 shadow-soft dark:border-ink-800 dark:bg-ink-900"
      >
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={onChange('email')}
          error={errors.email}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={onChange('password')}
          error={errors.password}
        />

        {errors._form ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-300">
            {errors._form}
          </p>
        ) : null}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? <Spinner size="sm" label="Signing in…" /> : 'Sign in'}
        </Button>

        <p className="text-center text-sm text-ink-600 dark:text-ink-400">
          New here?{' '}
          <Link to="/register" className="font-medium">
            Create an account
          </Link>
        </p>
      </form>
    </section>
  );
};

const Field = ({ id, label, error, ...rest }) => (
  <div>
    <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink-800 dark:text-ink-200">
      {label}
    </label>
    <input
      id={id}
      name={id}
      className={`w-full rounded-xl border bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-200 dark:bg-ink-950 dark:text-ink-100 dark:focus:ring-accent-900/40 ${
        error
          ? 'border-red-400 dark:border-red-500'
          : 'border-ink-200 dark:border-ink-700'
      }`}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      {...rest}
    />
    {error ? (
      <p id={`${id}-error`} className="mt-1 text-xs text-red-600 dark:text-red-300">
        {error}
      </p>
    ) : null}
  </div>
);

export default Login;
