import {
  Home,
  Building2,
  MapPin,
  Building,
  Users,
  Layers,
  TreePine,
  Store,
  Warehouse,
  Car,
  Truck,
  Wrench,
  Briefcase,
  GraduationCap,
  Heart,
  Utensils,
  Gamepad2,
  Camera,
  Shirt,
  Baby,
  Dumbbell,
  Book,
  Music,
  Laptop,
  Smartphone,
} from "lucide-react";

const propertyCategories = [
  {
    title: "Property Types",
    items: [
      { name: "Residential", icon: Home, href: "/categories?type=residential" },
      {
        name: "Commercial",
        icon: Building2,
        href: "/categories?type=commercial",
      },
      { name: "Plots", icon: MapPin, href: "/categories?type=plots" },
      { name: "Rental", icon: Users, href: "/categories?type=rental" },
      {
        name: "Builder Floors",
        icon: Layers,
        href: "/categories?type=builder-floors",
      },
      {
        name: "Agricultural",
        icon: TreePine,
        href: "/categories?type=agricultural",
      },
      { name: "Shops", icon: Store, href: "/categories?type=shops" },
      {
        name: "Warehouses",
        icon: Warehouse,
        href: "/categories?type=warehouses",
      },
      { name: "Parking", icon: Car, href: "/categories?type=parking" },
    ],
  },
  {
    title: "Residential",
    items: [
      { name: "1 BHK Apartment", icon: Home, href: "/properties?type=1bhk" },
      { name: "2 BHK Apartment", icon: Home, href: "/properties?type=2bhk" },
      { name: "3 BHK Apartment", icon: Home, href: "/properties?type=3bhk" },
      { name: "4+ BHK Apartment", icon: Home, href: "/properties?type=4bhk" },
      {
        name: "Independent House",
        icon: Building,
        href: "/properties?type=house",
      },
      { name: "Villa", icon: Building2, href: "/properties?type=villa" },
      { name: "Duplex", icon: Layers, href: "/properties?type=duplex" },
      {
        name: "Penthouse",
        icon: Building2,
        href: "/properties?type=penthouse",
      },
    ],
  },
  {
    title: "Commercial",
    items: [
      {
        name: "Office Space",
        icon: Briefcase,
        href: "/properties?type=office",
      },
      { name: "Retail Shop", icon: Store, href: "/properties?type=retail" },
      { name: "Showroom", icon: Building, href: "/properties?type=showroom" },
      {
        name: "Warehouse",
        icon: Warehouse,
        href: "/properties?type=warehouse",
      },
      {
        name: "Restaurant Space",
        icon: Utensils,
        href: "/properties?type=restaurant",
      },
      { name: "Industrial", icon: Truck, href: "/properties?type=industrial" },
      { name: "IT Office", icon: Laptop, href: "/properties?type=it-office" },
      { name: "Medical Center", icon: Heart, href: "/properties?type=medical" },
    ],
  },
  {
    title: "Rental & PG",
    items: [
      { name: "Boys PG", icon: Users, href: "/properties?type=boys-pg" },
      { name: "Girls PG", icon: Users, href: "/properties?type=girls-pg" },
      { name: "Co-living", icon: Home, href: "/properties?type=co-living" },
      {
        name: "Guest House",
        icon: Building,
        href: "/properties?type=guest-house",
      },
      { name: "Hostel", icon: Building2, href: "/properties?type=hostel" },
      {
        name: "Service Apartment",
        icon: Home,
        href: "/properties?type=service-apartment",
      },
      { name: "Room Rental", icon: Home, href: "/properties?type=room-rental" },
      {
        name: "Flat Sharing",
        icon: Users,
        href: "/properties?type=flat-sharing",
      },
    ],
  },
  {
    title: "Plots & Land",
    items: [
      {
        name: "Residential Plot",
        icon: MapPin,
        href: "/properties?type=residential-plot",
      },
      {
        name: "Commercial Plot",
        icon: Building,
        href: "/properties?type=commercial-plot",
      },
      {
        name: "Agricultural Land",
        icon: TreePine,
        href: "/properties?type=agricultural",
      },
      {
        name: "Industrial Plot",
        icon: Truck,
        href: "/properties?type=industrial-plot",
      },
      {
        name: "Farm House",
        icon: TreePine,
        href: "/properties?type=farm-house",
      },
      { name: "Open Land", icon: MapPin, href: "/properties?type=open-land" },
      {
        name: "Construction Plot",
        icon: Wrench,
        href: "/properties?type=construction-plot",
      },
      {
        name: "Investment Plot",
        icon: MapPin,
        href: "/properties?type=investment-plot",
      },
    ],
  },
];

const locations = [
  "Sector 1, Rohtak",
  "Sector 2, Rohtak",
  "Sector 3, Rohtak",
  "Sector 4, Rohtak",
  "Sector 5, Rohtak",
  "Sector 6, Rohtak",
  "Sector 7, Rohtak",
  "Sector 8, Rohtak",
  "Sector 9, Rohtak",
  "Sector 10, Rohtak",
  "Sector 11, Rohtak",
  "Sector 12, Rohtak",
  "Sector 13, Rohtak",
  "Sector 14, Rohtak",
  "Sector 15, Rohtak",
  "Sector 16, Rohtak",
  "Model Town, Rohtak",
  "Civil Lines, Rohtak",
  "Railway Road, Rohtak",
  "Delhi Road, Rohtak",
  "Hisar Road, Rohtak",
  "Jhajjar Road, Rohtak",
  "Sonipat Road, Rohtak",
  "Panipat Road, Rohtak",
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Property Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-12">
          {propertyCategories.map((category, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-white mb-4">
                {category.title}
              </h3>
              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => {
                  const IconComponent = item.icon;
                  return (
                    <li key={itemIndex}>
                      <a
                        href={item.href}
                        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm"
                      >
                        <IconComponent className="h-4 w-4 text-[#C70000]" />
                        <span>{item.name}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Popular Locations */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-white mb-4">
            Popular Locations in Rohtak
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {locations.map((location, index) => (
              <a
                key={index}
                href={`/properties?location=${encodeURIComponent(location)}`}
                className="text-gray-300 hover:text-white transition-colors text-sm py-1"
              >
                {location}
              </a>
            ))}
          </div>
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-t border-gray-800 pt-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-[#C70000] flex items-center justify-center rounded">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold">Aashish Property</span>
            </div>
            <p className="text-gray-400 mb-4 text-sm">
              Your trusted partner in finding the perfect property in Rohtak and
              surrounding areas. We connect buyers, sellers, and renters with
              the best real estate opportunities.
            </p>
            <p className="text-sm text-gray-400">
              📍 Rohtak, Haryana
              <br />
              📞 +91 98765 43210
              <br />
              ✉️ info@aashishproperty.com
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/categories"
                  className="hover:text-white transition-colors"
                >
                  All Categories
                </a>
              </li>
              <li>
                <a
                  href="/properties"
                  className="hover:text-white transition-colors"
                >
                  Browse Properties
                </a>
              </li>
              <li>
                <a
                  href="/post-property"
                  className="hover:text-white transition-colors"
                >
                  Post Property
                </a>
              </li>
              <li>
                <a
                  href="/agents"
                  className="hover:text-white transition-colors"
                >
                  Find Agents
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition-colors">
                  Login
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Property Owners</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a
                  href="/login?type=seller"
                  className="hover:text-white transition-colors"
                >
                  Seller Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/post-property"
                  className="hover:text-white transition-colors"
                >
                  Post Free Ad
                </a>
              </li>
              <li>
                <a
                  href="/seller-dashboard"
                  className="hover:text-white transition-colors"
                >
                  Manage Properties
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  className="hover:text-white transition-colors"
                >
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="/help" className="hover:text-white transition-colors">
                  Selling Guide
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Agents</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a
                  href="/login?type=agent"
                  className="hover:text-white transition-colors"
                >
                  Agent Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/agent-registration"
                  className="hover:text-white transition-colors"
                >
                  Become an Agent
                </a>
              </li>
              <li>
                <a
                  href="/agent-tools"
                  className="hover:text-white transition-colors"
                >
                  Agent Tools
                </a>
              </li>
              <li>
                <a
                  href="/commission"
                  className="hover:text-white transition-colors"
                >
                  Commission Plans
                </a>
              </li>
              <li>
                <a
                  href="/agent-support"
                  className="hover:text-white transition-colors"
                >
                  Agent Support
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © 2024 Aashish Property. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Licensed Real Estate Platform | RERA Registered
              </p>
            </div>

            <div className="flex space-x-6 text-sm">
              <a
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/contact"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact Us
              </a>
              <a
                href="/sitemap"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
