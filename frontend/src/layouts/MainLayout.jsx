
import { Outlet } from 'react-router';

import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#121212] text-[#F5F5F5]">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
