import { Outlet } from '@tanstack/react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
const RootLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
