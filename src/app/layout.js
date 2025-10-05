// app/layout.js
import '../styles/globals.css';
import { Providers } from './providers';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AuthButtons from "@/components/AuthButtons";

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const isAdmin = user?.role === 'admin';
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <header className="bg-blue-600 text-white py-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center px-4">
              <h1 className="text-3xl font-bold">ዕዳጋ</h1>
              <nav>
                <ul className="flex space-x-6">
                  <li><a href="/" className="hover:text-blue-200">Home</a></li>
                  <li><a href="#" className="hover:text-blue-200">Shop</a></li>
                  <li><a href="#" className="hover:text-blue-200">Categories</a></li>
                  <li><a href="/aboutus" className="hover:text-blue-200">About Us</a></li>
                  <li><a href="/contactus" className="hover:text-blue-200">Contact</a></li>
                  {user && (
                    <li><a href="/customer/orders" className="hover:text-blue-200">My Orders</a></li>
                  )}
                  {isAdmin && (
                    <>
                      <li><a href="/admin/products/new" className="hover:text-blue-200">Stock</a></li>
                      <li><a href="/admin/products" className="hover:text-blue-200">Stock Management</a></li>
                      <li><a href="/admin/orders" className="hover:text-blue-200">Orders</a></li>
                    </>
                  )}
                </ul>
              </nav>
              <Providers session={session}>
                <AuthButtons />
              </Providers>
            </div>
          </header>

          <Providers session={session}>
            {children}
          </Providers>

          <footer className="bg-blue-600 text-white py-6 mt-auto">
            <div className="container mx-auto text-center">
              <p>&copy; 2023 Symbi Ecommerce. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
