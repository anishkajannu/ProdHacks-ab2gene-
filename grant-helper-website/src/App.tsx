import { useState } from 'react'
import Layout from './components/layout/Layout'
import ProfileView from './components/pages/ProfileView'
import SearchView from './components/pages/SearchView'
import WorkspaceView from './components/pages/WorkspaceView'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('profile')

  const renderView = () => {
    switch (activeView) {
      case 'profile':
        return <ProfileView />
      case 'search':
        return <SearchView />
      case 'workspace':
        return <WorkspaceView />
      default:
        return <ProfileView />
    }
  }

  return (
    <Layout activeView={activeView} onNavigate={setActiveView}>
      {renderView()}
    </Layout>
  )
}

export default App
