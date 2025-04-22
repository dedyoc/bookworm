const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex">
          <div className="mr-4">
            <img src="https://picsum.photos/128" alt="Logo" className="h-8" />
          </div>
          <address className="text-gray-700">
            <p className="text-lg font-semibold">BOOKWORM</p>
            <p>123 Book St.</p>
            <p>Booktown, BK 12345</p>
            </address>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
