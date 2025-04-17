const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Bookworm</h3>
          <address className="not-italic text-gray-600">
            <p>123 Bookstore Street, Reading City, RC 12345</p>
            <p>Phone: (123) 456-7890</p>
          </address>
          <p className="mt-4 text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Bookworm. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
