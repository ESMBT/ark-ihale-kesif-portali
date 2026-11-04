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

import { KesifBosSayfa } from './features/kesif/KesifBosSayfa'
import { SantiyeciProjectListPage } from './features/santiyeci/SantiyeciProjectListPage'
import { SantiyeciProjectDetailPage } from './features/santiyeci/SantiyeciProjectDetailPage'
import { SantiyeciPackageDetailPage } from './features/santiyeci/SantiyeciPackageDetailPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/moduller" replace />} />

        {/* Bildirimler ve hesap ayarları — modülden bağımsız */}
        <Route path="/bildirimler" element={<NotificationsPage />} />
        <Route path="/profilim" element={<ProfilePage />} />
        <Route path="/kullanim" element={<UserManagementPage />} />

        {/* Modül seçim ekranı */}
        <Route path="/moduller" element={<ModulePickerPage />} />

        {/* ============ İHALE YÖNETİMİ MODÜLÜ ============ */}
        <Route path="/modul/ihale" element={<Navigate to="/modul/ihale/projeler" replace />} />
        <Route path="/modul/ihale/projeler" element={<ProjectListPage />} />
        <Route path="/modul/ihale/projeler/talep" element={<ProjectCodeRequestPage />} />
        <Route path="/modul/ihale/projeler/:id" element={<ProjectDetailPage />} />
        <Route path="/modul/ihale/projeler/:id/paket/:paketId" element={<PackageDetailPage />} />
        <Route path="/modul/ihale/kesif" element={<KesifBosSayfa />} />

        {/* ============ ŞANTİYECİ YÖNETİMİ MODÜLÜ ============ */}
        <Route
          path="/modul/santiyeci"
          element={<Navigate to="/modul/santiyeci/projeler" replace />}
        />
        <Route path="/modul/santiyeci/projeler" element={<SantiyeciProjectListPage />} />
        <Route path="/modul/santiyeci/projeler/talep" element={<ProjectCodeRequestPage />} />
        <Route path="/modul/santiyeci/projeler/:id" element={<SantiyeciProjectDetailPage />} />
        <Route
          path="/modul/santiyeci/projeler/:id/paket/:paketId"
          element={<SantiyeciPackageDetailPage />}
        />
        <Route path="/modul/santiyeci/kesif" element={<KesifBosSayfa />} />

        {/* Sözleşmeye dönüşmüş keşifler — menüden kaldırıldı, adres korunur */}
        <Route path="/kesif/sozlesmeler" element={<ContractedTakeoffPage />} />

        {/* Eski yollar → ihale modülüne yönlendirilir */}
        <Route path="/projeler" element={<Navigate to="/modul/ihale/projeler" replace />} />
        <Route path="/projeler/talep" element={<Navigate to="/modul/santiyeci/projeler/talep" replace />} />
        <Route path="/projeler/:id" element={<Navigate to="/modul/ihale/projeler/:id" replace />} />
        <Route
          path="/projeler/:id/paket/:paketId"
          element={<Navigate to="/modul/ihale/projeler/:id/paket/:paketId" replace />}
        />

        <Route path="*" element={<Navigate to="/moduller" replace />} />
      </Route>
    </Routes>
  )
}
