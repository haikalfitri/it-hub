import { Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import AboutPage from '@/pages/AboutPage'
import AssetDetailPage from '@/pages/AssetDetailPage'
import AssetsPage from '@/pages/AssetsPage'
import DashboardPage from '@/pages/DashboardPage'
import GuidePage from '@/pages/GuidePage'
import HelpPage from '@/pages/HelpPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import PeoplePage from '@/pages/PeoplePage'
import ProfilePage from '@/pages/ProfilePage'
import RequestDetailPage from '@/pages/RequestDetailPage'
import TicketDetailPage from '@/pages/TicketDetailPage'
import TicketsPage from '@/pages/TicketsPage'
import WorkflowFormPage from '@/pages/WorkflowFormPage'
import WorkflowsPage from '@/pages/WorkflowsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="help/:slug" element={<GuidePage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="assets/:id" element={<AssetDetailPage />} />
        <Route path="workflows" element={<WorkflowsPage />} />
        <Route path="workflows/new/:type" element={<WorkflowFormPage />} />
        <Route path="workflows/:id" element={<RequestDetailPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="me" element={<ProfilePage />} />
        <Route path="people" element={<PeoplePage />} />
        <Route path="people/:id" element={<PeoplePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
