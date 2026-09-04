"use client";

import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    // 'flex flex-col min-h-screen' ensures the wrapper is at least the full height of the device
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-x-hidden">
      <NavBar />
      
      {/* 
        'flex-1' automatically expands to fill all remaining vertical space, 
        smoothly pushing the Footer to the bottom on all devices (PC, Tabs, Mobiles).
        'w-full' ensures it spans the entire width without breaking out on small screens.
      */}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}