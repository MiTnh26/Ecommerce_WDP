import logo from "../assets/images/logo_page.jpg";

export default function Component() {
  return (
    <div className="w-full">
      {/* Orange top border */}
      <div className="w-full h-1 bg-orange-500"></div>

      {/* Header content */}
      <header className="bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center">
          <a href="http://localhost:3000/Ecommerce/home">
            <img
              src={logo}
              alt="EZShop"
              className="h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            />
          </a>
          {/* Divider */}
          <div className="mx-3 h-4 w-px bg-gray-300"></div>

          {/* Payment text */}
          <span className="text-gray-700 text-sm">Thanh Toán</span>
        </div>
      </header>
    </div>
  );
}
