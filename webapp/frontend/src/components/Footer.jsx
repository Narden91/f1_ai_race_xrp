import { APP_CONFIG } from '../config'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const links = [
    { name: 'Documentation', url: 'https://xrpl.org/', icon: '📚' },
    { name: 'GitHub', url: 'https://github.com/XRPLF', icon: '💻' },
    { name: 'Community', url: 'https://xrpl.org/community.html', icon: '👥' },
  ]

  const features = [
    { icon: '⚡', text: 'Fast Transactions' },
    { icon: '🔒', text: 'Secure & Reliable' },
    { icon: '🌐', text: 'Global Network' },
    { icon: '💎', text: 'Low Fees' },
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 text-white mt-20">
      <div className="w-full px-8 py-12">
        {/* Top Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">🏎️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">{APP_CONFIG.name}</h3>
                <p className="text-xs text-purple-300">v{APP_CONFIG.version}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              A professional platform for XRP Ledger development and hackathons.
              Build, test, and deploy your XRP applications with ease.
            </p>
            <div className="inline-flex items-center px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-300 text-xs font-semibold">
              🧪 {APP_CONFIG.network.toUpperCase()} ENVIRONMENT
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-300">Features</h4>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <span>{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-300">Resources</h4>
            <div className="space-y-3">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
                >
                  <span className="group-hover:scale-110 transition-transform">
                    {link.icon}
                  </span>
                  <span className="text-sm">{link.name}</span>
                  <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-orange-700/50 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400">
            © {currentYear} {APP_CONFIG.name}. Built with ❤️ for XRP Hackathon
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-xs text-gray-500">Powered by</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                XRPL
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-sm font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                React
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-sm font-semibold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                FastAPI
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Background Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
    </footer>
  )
}

export default Footer