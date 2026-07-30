import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthModalProvider } from "@/components/site-auth/auth-modal-context";
import { SplashScreen } from "@/components/splash-screen";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthModalProvider>
      <SplashScreen />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthModalProvider>
  );
}
