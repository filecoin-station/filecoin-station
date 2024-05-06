import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import 'src/App.css'
import Onboarding from 'src/pages/onboarding/Onboarding'
import Dashboard from 'src/pages/dashboard/Dashboard'
import Sentry from 'src/components/Sentry'
import Plausible from 'src/components/Plausible'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import { ROUTES } from 'src/lib/routes'
import Layout from 'src/components/Layout'
import Settings from 'src/pages/settings/Settings'
import Wallet from 'src/pages/wallet/Wallet'
import { DialogProvider } from './components/DialogProvider'

const App = ():JSX.Element => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Filecoin Station</title>
      </Helmet>
      <Router>
        <DialogProvider>
          <Routes>
            <Route path={ROUTES.onboarding} element={<Onboarding />} />
            <Route
              path="*"
              element={
                  <Layout>
                    <Sentry />
                    <Plausible />
                      <Routes>
                        <Route path={ROUTES.dashboard} element={<Dashboard />} />
                        <Route path={ROUTES.wallet} element={<Wallet />} />
                        <Route path={ROUTES.settings} element={<Settings />} />
                      </Routes>
                  </Layout>
              }
            >
            </Route>
          </Routes>
        </DialogProvider>
      </Router>
    </HelmetProvider>
  )
}

export default App
