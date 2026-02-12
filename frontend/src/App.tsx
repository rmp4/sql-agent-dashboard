import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { DashboardsPage } from '@/pages/DashboardsPage';
import { DashboardDetailPage } from '@/pages/DashboardDetailPage';
import { DataSourcesPage } from '@/pages/DataSourcesPage';
import { RulesPage } from '@/pages/RulesPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ChatInterface />} />
          <Route path="/dashboards" element={<DashboardsPage />} />
          <Route path="/dashboards/:id" element={<DashboardDetailPage />} />
          <Route path="/data-sources" element={<DataSourcesPage />} />
          <Route path="/rules" element={<RulesPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

