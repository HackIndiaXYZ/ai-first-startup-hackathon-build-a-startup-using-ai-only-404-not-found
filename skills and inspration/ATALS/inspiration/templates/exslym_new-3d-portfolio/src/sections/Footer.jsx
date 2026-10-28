const Footer = () => {
  return (
    <footer className="c-space pt-7 pb-3 border-t border-black-300 flex justify-between items-center flex-wrap gap-5">
      <div className="text-white-500 flex gap-2">
        <p>Terms & Conditions</p>
        <p>|</p>
        <p>Privacy Policy</p>
      </div>

      <div className="flex gap-5">
        <a href="https://github.com/exslym" target="_blank" rel="noopener noreferrer" className="social-icon">
          <img src="/assets/github.png" alt="github" className="w-full h-full" />
        </a>
        <a href="https://linkedin.com/in/exslym/" target="_blank" rel="noopener noreferrer" className="social-icon">
          <img src="/assets/linkedin.png" alt="linkedin" className="w-full h-full" />
        </a>
      </div>

      <p className="text-white-500">© 2025 eXslym. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
