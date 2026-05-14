import { Link } from "react-router-dom";
import { useState } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai"; // Using react-icons

function SideNav() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`h-screen flex flex-col justify-between border-e bg-white transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
      {/* Top Section with Toggle Button */}
      <div className="p-4 flex items-center justify-between">
        <span className={`text-xl font-bold text-gray-600 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>
          ESTANTE
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 hover:text-black transition"
        >
          {isOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
        </button>
      </div>

      {/* Navigation Links */}
      <ul className="mt-4 space-y-1 flex-1 px-4">
        {[
          { name: "HOME", path: "/" },
          { name: "OTC", path: "/otc" },
          { name: "ZUELIG", path: "/zuelig" },
          { name: "UNILAB", path: "/unilab" },
          { name: "METRO", path: "/metro" },
          { name: "GENERICS", path: "/generics" },
          { name: "BRANDED", path: "/branded" },
        ].map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-blue-700 hover:text-white transition-all ${
                isOpen ? "w-full" : "w-10 flex justify-center"
              }`}
            >
              {isOpen ? item.name : item.name.charAt(0)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SideNav;
