import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'

import { ModulePickerPage } from './features/modules/ModulePickerPage'

import { NotificationsPage } from './features/notifications/NotificationsPage'
import { ContractedTakeoffPage } from './features/kesif/ContractedTakeoffPage'

import { UserManagementPage } from './features/admin/UserManagementPage'
import { ProfilePage } from './features/admin/ProfilePage'

import { ProjectListPage } from './features/projects/ProjectListPage'
import { ProjectCodeRequestPage } from './features/projects/ProjectCodeRequestPage'
import { ProjectDetailPage } from './features/projects/ProjectDetailPage'

import { PackageDetailPage } from './features/packages/PackageDetailPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/projeler" replace />} />
        <Route path="/bildirimler" element={<NotificationsPage />} />

        {/* Sözleşmeye dönüşmüş keşifler — herkese açık */}
        <Route path="/kesif/sozlesmeler" element={<ContractedTakeoffPage />} />

        {/* Kullanıcı ve ekip yönetimi */}
        <Route path="/profilim" element={<ProfilePage />} />
        <Route path="/kullanim" element={<UserManagementPage />} />

        {/* Modül listesi */}
        <Route path="/moduller" element={<ModulePickerPage />} />

        {/* Projeler */}
        <Route path="/projeler" element={<ProjectListPage />} />
        <Route path="/projeler/talep" element={<ProjectCodeRequestPage />} />
        <Route path="/projeler/:id" element={<ProjectDetailPage />} />

        <Route path="/projeler/:id/paket/:paketId" element={<PackageDetailPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
