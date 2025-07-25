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
            className="h-8 w-8 object-contain rounded-md mr-2"
            style={{ maxWidth: 36, maxHeight: 36 }}
          />
          </a>
          <span className="text-gray-700 text-base font-medium"> || Thanh Toán</span>
        </div>
      </header>
    </div>
  );
}
