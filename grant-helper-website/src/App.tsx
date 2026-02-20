import { useState } from 'react'
import Layout from './components/layout/Layout'
import ProfileView from './components/pages/ProfileView'
import SearchView from './components/pages/SearchView'
import WorkspaceView from './components/pages/WorkspaceView'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('profile')
  const [organizationProfile, setOrganizationProfile] = useState('')

  const renderView = () => {
    switch (activeView) {
      case 'profile':
        return (
          <ProfileView
            organizationProfile={organizationProfile}
            onOrganizationProfileChange={setOrganizationProfile}
          />
        )
      case 'search':
        return <SearchView organizationProfile={organizationProfile} />
      case 'workspace':
        return <WorkspaceView organizationProfile={organizationProfile} />
      default:
        return (
          <ProfileView
            organizationProfile={organizationProfile}
            onOrganizationProfileChange={setOrganizationProfile}
          />
        )
    }
  }

  return (
    <Layout activeView={activeView} onNavigate={setActiveView}>
      {renderView()}
    </Layout>
  )
}

export default App
