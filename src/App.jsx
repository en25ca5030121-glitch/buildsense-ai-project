import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SafetyMonitoringPage from './pages/SafetyMonitoringPage';
import CrackAnalysisPage from './pages/CrackAnalysisPage';
import RealEstateValuationPage from './pages/RealEstateValuationPage';
import ProjectPlanningPage from './pages/ProjectPlanningPage';
import WeatherAdvisoryPage from './pages/WeatherAdvisoryPage';
import AssistantPage from './pages/AssistantPage';
import DailySiteReportPage from './pages/DailySiteReportPage';
import KnowledgeCenterPage from './pages/KnowledgeCenterPage';
import ReportsAnalyticsPage from './pages/ReportsAnalyticsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ProjectProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Workspace Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/safety" element={<SafetyMonitoringPage />} />
                <Route path="/cracks" element={<CrackAnalysisPage />} />
                <Route path="/valuation" element={<RealEstateValuationPage />} />
                <Route path="/planning" element={<ProjectPlanningPage />} />
                <Route path="/weather" element={<WeatherAdvisoryPage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/daily-reports" element={<DailySiteReportPage />} />
                <Route path="/knowledge" element={<KnowledgeCenterPage />} />
                <Route path="/reports" element={<ReportsAnalyticsPage />} />
              </Route>

              {/* Catch all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ProjectProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
