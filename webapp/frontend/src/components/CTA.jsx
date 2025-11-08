import PropTypes from 'prop-types'

const CTA = ({ onGetStarted }) => {
  return (
    <section className="py-24 bg-gradient-to-br from-orange-600 via-red-600 to-amber-600">
      <div className="w-full px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to race?
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Join the F1 AI Racing competition. Train your car, enter races, and win XRP tokens on the XRP Ledger.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="group relative px-8 py-4 bg-white text-orange-600 rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl min-w-[200px]">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Create Wallet
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
            
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 min-w-[200px]">
              View Documentation
            </button>
          </div>

          {/* Racing stats */}
          <div className="mt-16 pt-16 border-t border-white/20">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-2">1 XRP</div>
                <div className="text-sm text-white/70">Per Training</div>
              </div>
              <div className="border-x border-white/20">
                <div className="text-3xl font-bold text-white mb-2">100 XRP</div>
                <div className="text-sm text-white/70">Winner Prize</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">Secret</div>
                <div className="text-sm text-white/70">AI Formula</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

CTA.propTypes = {
  onGetStarted: PropTypes.func.isRequired,
}

export default CTA
