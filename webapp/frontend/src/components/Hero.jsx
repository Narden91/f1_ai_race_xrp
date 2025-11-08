import PropTypes from 'prop-types'

const Hero = ({ onGetStarted }) => {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative flex-1 flex flex-col justify-between w-full py-20 text-center px-4">
        {/* Main heading */}
        <div className="animate-fadeIn pt-16">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight">
            🏎️ F1 AI Racing
            <br />
            <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Train. Race. Win.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed px-4">
            Build and optimize your AI-powered racing machine on the XRP Ledger. Every training session refines your car's performance. Compete against other racers in real-time tournaments where only the fastest win. Master the art of strategic upgrades and claim your 100 XRP prize.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <button
              onClick={onGetStarted}
              className="group relative px-10 py-5 bg-gray-900 text-white rounded-full font-semibold text-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl min-w-[220px]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button className="px-10 py-5 bg-transparent border-2 border-gray-900 text-gray-900 rounded-full font-semibold text-xl hover:bg-gray-900 hover:text-white transition-all duration-300 min-w-[220px]">
              Learn More
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8 w-full max-w-5xl mx-auto pb-20 animate-slideUp px-4">
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-3">1 XRP</div>
            <div className="text-sm md:text-base text-gray-600 uppercase tracking-wide font-semibold">Training Cost</div>
          </div>
          <div className="text-center sm:border-x border-gray-200">
            <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-3">100 XRP</div>
            <div className="text-sm md:text-base text-gray-600 uppercase tracking-wide font-semibold">Winner Prize</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-3">???</div>
            <div className="text-sm md:text-base text-gray-600 uppercase tracking-wide font-semibold">Speed Formula (Secret)</div>
          </div>
        </div>
      </div>
    </section>
  )
}

Hero.propTypes = {
  onGetStarted: PropTypes.func.isRequired,
}

export default Hero
