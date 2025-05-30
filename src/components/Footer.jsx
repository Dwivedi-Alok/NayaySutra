import { 
  ScaleIcon as Scale,
  EnvelopeIcon as Mail,
  PhoneIcon as Phone,
  MapPinIcon as Location,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
  ShieldCheckIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    services: {
      title: 'Services',
      links: [
        { name: 'Legal Consultation', href: '/consultation' },
        { name: 'Document Review', href: '/document-review' },
        { name: 'Legal Research', href: '/research' },
        { name: 'Case Analysis', href: '/case-analysis' }
      ]
    },
    resources: {
      title: 'Resources',
      links: [
        { name: 'Legal Articles', href: '/articles' },
        { name: 'Law Dictionary', href: '/dictionary' },
        { name: 'Legal Forms', href: '/forms' },
        { name: 'FAQs', href: '/faqs' }
      ]
    },
    company: {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Our Team', href: '/team' },
        { name: 'Contact', href: '/contact' },
        { name: 'Careers', href: '/careers' }
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Disclaimer', href: '/disclaimer' },
        { name: 'Cookie Policy', href: '/cookies' }
      ]
    }
  };

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com' },
    { name: 'LinkedIn', href: 'https://linkedin.com' },
    { name: 'Facebook', href: 'https://facebook.com' },
    { name: 'Instagram', href: 'https://instagram.com' }
  ];

  return (
    <footer className="w-full bg-black text-gray-300">
      {/* Decorative Top Border */}
      {/* <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div> */}

      {/* Main Footer Content */}
      <div className="w-full px-6 lg:px-12bg-gradient-to-br from-blue-500 to-purple-600 py-16 bg-gray-950">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          
          {/* Brand Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Scale className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Nayay Sutra</h3>
                <p className="text-xs text-gray-500">AI Legal Assistant</p>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-sm">
              Your trusted AI-powered legal assistant. Get instant answers to legal questions and access comprehensive legal resources.
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2 mb-8">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-md text-xs text-gray-400 hover:text-white transition-all duration-200"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links - Each takes 1 column */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h4 className="text-gray-100 font-semibold mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-gray-500 hover:text-gray-200 text-sm transition-colors duration-200 block py-1"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Information Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="mailto:support@nayaysutra.com"
              className="group flex items-center gap-4 p-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg transition-all duration-200"
            >
              <div className="w-10 h-10 bg-gray-800 group-hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                <Mail className="w-5 h-5 text-gray-500 group-hover:text-gray-200" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Email Us</p>
                <p className="text-sm text-gray-400 group-hover:text-gray-200">support@nayaysutra.com</p>
              </div>
            </a>
            
            <a 
              href="tel:+919876543210"
              className="group flex items-center gap-4 p-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg transition-all duration-200"
            >
              <div className="w-10 h-10 bg-gray-800 group-hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                <Phone className="w-5 h-5 text-gray-500 group-hover:text-gray-200" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Call Us</p>
                <p className="text-sm text-gray-400 group-hover:text-gray-200">+91 98765 43210</p>
              </div>
            </a>
            
            <div className="flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <Location className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Visit Us</p>
                <p className="text-sm text-gray-400">Mumbai, Maharashtra</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full bg-black border-t border-gray-900">
        <div className="px-6 lg:px-12 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">
              © {currentYear} Nayay Sutra. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <a href="/sitemap" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                Sitemap
              </a>
              <span className="text-gray-800">•</span>
              <a href="/accessibility" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                Accessibility
              </a>
              <span className="text-gray-800">•</span>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                Made with <span className="text-red-500">❤️</span> in India
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}