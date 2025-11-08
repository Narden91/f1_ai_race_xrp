const Features = () => {
  const features = [
    {
      icon: '🛠️',
      title: 'Train Your Car',
      description: 'Spend 1 XRP to train your car. Each training randomly adjusts hidden performance flags by ±20.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: '🏁',
      title: 'Enter Races',
      description: 'Pay 1 XRP to enter a race. Server-side AI computes speed using secret formulas. Fastest wins!',
      color: 'from-red-500 to-yellow-500',
    },
    {
      icon: '🏆',
      title: 'Win Big',
      description: 'Winner of each race takes home 100 XRP. Rankings shown, but speed calculations stay secret.',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      icon: '🔒',
      title: 'Secure & Fair',
      description: 'All transactions on XRP Ledger. No cheating—flags and formulas never leave the server.',
      color: 'from-orange-500 to-amber-500',
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50">
      <div className="w-full px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            How F1 AI Racing Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Train smart, race hard, and compete for XRP prizes on the XRP Ledger
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 bg-white border border-gray-200 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
