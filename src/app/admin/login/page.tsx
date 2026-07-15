import { AdminLoginForm } from "./admin-login-form";

export const metadata = {
  title: "Admin Login | My Ultimate Worship",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="mt-1 text-sm text-slate-400">
            My Ultimate Worship Ministry
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
