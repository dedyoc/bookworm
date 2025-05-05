import logo from '@/assets/logo.jpg';
const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex">
          <div className="mr-4">
            <img src={logo} alt="Logo" className="h-16" />
          </div>
          <address className="text-gray-700">
            <p className="text-lg font-semibold">BOOKWORM</p>
            <p>Address</p>
            <p>Number</p>
            </address>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
