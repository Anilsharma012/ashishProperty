import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";

export default function MyAccount() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Account</h1>
          <p className="text-lg text-gray-600 mb-8">
            Manage your profile and account settings - Coming Soon
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <p className="text-[#C70000] font-medium">
              Account management features are under development. Please check
              back soon!
            </p>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
