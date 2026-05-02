import { useState, useEffect } from "react";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import HomePage from "./pages/HomePage";
import AuctionsPage from "./pages/AuctionsPage";
import CarDetailPage from "./pages/CarDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import MessageWidget from "./components/MessageWidget";
import InfoPage from "./pages/InfoPage";
import ReportIssuePage from "./pages/ReportIssuePage";
import { getSavedToken, getMe } from "./api/auth";

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = getSavedToken();
      if (token) {
        try { const me = await getMe(); setUser(me); }
        catch (_) { localStorage.removeItem("token"); }
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  const showToast = (msg, type = "info") => setToast({ msg, type });
  const navigate = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  if (loading) {
    return (
      <div style={{ background: "#080a10", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#64748b", fontFamily: "system-ui" }}>
          <div style={{ fontSize: 40, marginBottom: 16, color: "#f59e0b", fontWeight: 700 }}>AutoAuction LT</div>
          <div>Connecting to server…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#080a10", minHeight: "100vh", color: "#e2e8f0", fontFamily: "Georgia, serif" }}>
      <Nav page={page} setPage={navigate} user={user} setUser={setUser} />
      {page === "home"      && <HomePage setPage={navigate} setSelectedCar={setSelectedCar} showToast={showToast} />}
      {page === "auctions"  && <AuctionsPage setPage={navigate} setSelectedCar={setSelectedCar} />}
      {page === "carDetail" && selectedCar && <CarDetailPage car={selectedCar} user={user} setPage={navigate} showToast={showToast} />}
      {page === "login"     && <LoginPage setPage={navigate} setUser={setUser} showToast={showToast} />}
      {page === "signup"    && <SignupPage setPage={navigate} setUser={setUser} showToast={showToast} />}
      {(page === "dashboard" || page === "admin") && user?.role === "admin" && <AdminDashboard showToast={showToast} />}
      {page === "dashboard" && user && user.role !== "admin" && <DashboardPage user={user} setPage={navigate} setSelectedCar={setSelectedCar} showToast={showToast} />}
      {page === "dashboard" && !user && navigate("login")}
      {page === "admin"     && user?.role !== "admin" && navigate("home")}

      {/* ── Static / info pages ── */}
      {['howItWorks','helpCenter','faq','gdpr','privacy','terms','cookies','accessibility'].includes(page) && (
        <InfoPage type={page} setPage={navigate} />
      )}
      {page === 'reportIssue' && (
        <ReportIssuePage setPage={navigate} showToast={showToast} user={user} />
      )}

      <Footer setPage={navigate} />
      {user && user.role !== 'admin' && <MessageWidget showToast={showToast} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
