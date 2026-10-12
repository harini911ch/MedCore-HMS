
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/landing";

function ComingSoon({ title }: { title: string }) {
  return (
    <main className="coming-soon">
      <div className="coming-soon-card">
        <span className="coming-soon-icon">✚</span>
        <h1>{title}</h1>
        <p>This page will be implemented in the next stage of MedCore HMS.</p>
        <a href="/">← Back to home</a>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={<ComingSoon title="Welcome back" />}
        />
        <Route
          path="/register"
          element={<ComingSoon title="Create your account" />}
        />
        <Route
          path="/app/dashboard"
          element={<ComingSoon title="Your dashboard" />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
