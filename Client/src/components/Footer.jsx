const Footer = () => {
  return (
    <footer className="mt-3 flex flex-col items-center justify-center bg-gray-800 text-white text-center py-4">
      <p>Made with ❤️ by <a href="https://github.com/bishal292" target="_blank"><span className="text-blue-300 hover:text-red-600"> @Bishal Singh</span></a> </p>
      <p>&copy; {new Date().getFullYear()} Waste Management System. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
