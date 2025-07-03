import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/products";
import SettingsPage from "./pages/SettingsPage";
import Quotations from "./pages/quotations";
import CreateQuotation from "./pages/create-quotation";
import Invoices from "./pages/invoices";
import CreateInvoice from "./pages/create-invoice";
import SalesReports from "./pages/SalesReports";
import Suppliers from "./pages/suppliers";
import Notifications from "./pages/Notifications";
import Profile from "./pages/profile";
import UserManagement from "./pages/UserManagement";
import DocumentLibrary from "./pages/DocumentLibrary";
import TenderManagement from "./pages/TenderManagement";
import TicketsPage from "./pages/TicketsPage";
import TicketDetail from "./pages/TicketDetail";
import AuditLogs from "./pages/audit-logs";
import CompanySettings from "./pages/company-settings";

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      
      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Modules */}
      <Route path="/products" element={<Products />} />
      <Route path="/quotations" element={<Quotations />} />
      <Route path="/quotations/create" element={<CreateQuotation />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/invoices/create" element={<CreateInvoice />} />
      <Route path="/sales-reports" element={<SalesReports />} />
      <Route path="/suppliers" element={<Suppliers />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/company-settings" element={<CompanySettings />} />
      <Route path="/user-management" element={<UserManagement />} />
      <Route path="/documents" element={<DocumentLibrary />} />
      <Route path="/tenders" element={<TenderManagement />} />
      <Route path="/tickets" element={<TicketsPage />} />
      <Route path="/ticket/:id" element={<TicketDetail />} />
      <Route path="/audit-logs" element={<AuditLogs />} />
    </Routes>
  );
}

export default App;
