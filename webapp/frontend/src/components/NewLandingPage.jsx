import PropTypes from 'prop-types'
import Hero from './Hero'
import Features from './Features'
import Benefits from './Benefits'
import CTA from './CTA'

const NewLandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen">
      <Hero onGetStarted={onGetStarted} />
      <Features />
      <Benefits onGetStarted={onGetStarted} />
      <CTA onGetStarted={onGetStarted} />
    </div>
  )
}

NewLandingPage.propTypes = {
  onGetStarted: PropTypes.func.isRequired,
}

export default NewLandingPage
