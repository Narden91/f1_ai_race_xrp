import PropTypes from 'prop-types'

const Benefits = ({ onGetStarted }) => {
  const benefits = [
    {
      title: 'Start racing instantly',
      description: 'Create your XRP wallet and get funded instantly on testnet. Start training your AI car right away.',
      image: '🚀',
    },
    {
      title: 'Fair competition',
      description: 'Secret speed formulas ensure no one can game the system. Train strategically to improve performance.',
      image: '⚖️',
    },
    {
      title: 'Real blockchain rewards',
      description: 'Win 100 XRP per race. All transactions verified on XRP Ledger for transparency and security.',
      image: '💎',
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="w-full px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Benefits list */}
          <div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Race smarter,
              <br />
              not harder
            </h2>
            
            <div className="space-y-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="text-5xl flex-shrink-0">{benefit.image}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onGetStarted}
              className="mt-12 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Get Started Now
            </button>
          </div>

          {/* Right side - Visual element */}
          <div className="relative">
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-gray-200">
              <div className="space-y-4">
                {/* Mock racing interface */}
                <div className="bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 rounded-2xl p-6 text-white">
                  <div className="text-sm opacity-80 mb-2">🏎️ Your Racing Wallet</div>
                  <div className="text-4xl font-bold mb-4">250 XRP</div>
                  <div className="text-sm opacity-80">Ready to race</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <div className="text-2xl mb-2">🛠️</div>
                    <div className="text-sm text-orange-600 mb-1">Trainings</div>
                    <div className="text-lg font-bold text-orange-900">12</div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="text-2xl mb-2">🏆</div>
                    <div className="text-sm text-yellow-600 mb-1">Races Won</div>
                    <div className="text-lg font-bold text-yellow-900">3</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl">🏁</div>
                      <div>
                        <div className="font-semibold text-gray-900">Race Won!</div>
                        <div className="text-sm text-gray-600">5 minutes ago</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">+100 XRP</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xl">🛠️</div>
                      <div>
                        <div className="font-semibold text-gray-900">Car Trained</div>
                        <div className="text-sm text-gray-600">15 minutes ago</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">-1 XRP</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

Benefits.propTypes = {
  onGetStarted: PropTypes.func.isRequired,
}

export default Benefits
