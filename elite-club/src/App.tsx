import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/admin/Dashboard'
import Members from './pages/admin/Members'
import MemberDetail from './pages/admin/MemberDetail'
import Usages from './pages/admin/Usages'
import Requests from './pages/admin/Requests'
import Meetings from './pages/admin/Meetings'
import Benefits from './pages/admin/Benefits'
import Partners from './pages/admin/Partners'
import Settings from './pages/admin/Settings'
import MemberHome from './pages/member/MemberHome'
import PublicProfile from './pages/public/PublicProfile'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/m/:slug" element={<PublicProfile />} />
      <Route path="/minha-area" element={<MemberHome />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="associadas" element={<Members />} />
        <Route path="associadas/:id" element={<MemberDetail />} />
        <Route path="usos" element={<Usages />} />
        <Route path="solicitacoes" element={<Requests />} />
        <Route path="encontros" element={<Meetings />} />
        <Route path="beneficios" element={<Benefits />} />
        <Route path="parceiros" element={<Partners />} />
        <Route path="configuracoes" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
