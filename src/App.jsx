
import "@fortawesome/fontawesome-free/css/all.min.css";
import "primeicons/primeicons.css";
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";
import Profile from "./components/Profile";
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const Login = lazy(() => import("./components/Login"));

const SubAdminManage = lazy(() =>
  import("./components/admin/SubAdminManage")
);
const ManageNOSDetails = lazy(() =>
  import("./components/admin/NOSDetailsManage")
);
const ManagePCDetails = lazy(() =>
  import("./components/admin/PCDetailsManage")
);
const ManageTp = lazy(() =>
  import("./components/admin/TPManage")
);
const ManageTc = lazy(() =>
  import("./components/admin/TCManage")
);
const ManageAssessor = lazy(() =>
  import("./components/admin/AssessorManage")
);
const ManageBatch = lazy(() =>
  import("./components/admin/BatchManage")
);
const ManageCandidate = lazy(() =>
  import("./components/admin/CandidateManage")
);
const ManageQuestionSet = lazy(() =>
  import("./components/admin/QuestionSetManage")
);
const ManageQuestion = lazy(() =>
  import("./components/admin/QuestionManage")
);
const BatchStatus = lazy(() =>
  import("./components/admin/BatchStatus")
);
const EvidenceComponent = lazy(() =>
  import("./components/admin/CandidateEvidence")
);
const BatchResult = lazy(() =>
  import("./components/admin/BatchResult")
);
const ManageJobRole = lazy(() =>
  import("./components/admin/JobRoleManage")
);
const ManageAssignTest = lazy(() =>
  import("./components/admin/AssignTestManage")
);
const Layout = lazy(() => import("./components/Layout"));
const AllBatches = lazy(() =>
  import("./components/Dashboard/AllBatches")
);
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const AssessorEvidence = lazy(() =>
  import("./components/admin/AssessorEvidence")
);
const SummaryReport = lazy(() =>
  import("./components/admin/SummaryReport")
);
const BatchAnalytics = lazy(() =>
  import("./components/admin/BatchAnalytics")
);
const ManageBatchAnalytics = lazy(() => import("./components/admin/ManageBatchAnalytics"));


function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = ( type) => {
    setIsAuthenticated(true);
    sessionStorage.setItem("type", type);
    setUserType(type);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("type");
    setIsAuthenticated(false);
    setUserType("");
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
        }}
      />

      <ErrorBoundary>
        <Router>
          <Suspense
            fallback={
              <div className="flex justify-center items-center mt-20">
                {" "}
                <ProgressSpinner style={{ width: "50px", height: "50px" }} />
              </div>
            }
          >
            <Routes>
            <Route path="/batch-analytics/:linkId" element={<BatchAnalytics/>}/>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="batch-analytics/report/:link"
                element={<BatchAnalytics />}
              />
              <Route
                path="/login"
                element={<Login onLogin={handleLogin} />}
              />
              <Route
                path="/logout"
                element={<Logout onLogout={handleLogout} />}
              />
              {isAuthenticated && (
                <Route
                  path="/*"
                  element={<Layout userType={userType} />}
                >
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="manageJobRole" element={<ManageJobRole />} />
                  <Route path="manageSubAdmin" element={<SubAdminManage />} />
                  <Route
                    path="manageNOSDetails"
                    element={<ManageNOSDetails />}
                  />
                  <Route path="managePC" element={<ManagePCDetails />} />
                  <Route path="manageTP" element={<ManageTp />} />
                  <Route path="manageTC" element={<ManageTc />} />
                  <Route path="manageAssessor" element={<ManageAssessor />} />
                  <Route path="manageBatch" element={<ManageBatch />} />
                  <Route path="manageCandidate" element={<ManageCandidate />} />
                  <Route
                    path="manageQuestionSet"
                    element={<ManageQuestionSet />}
                  />
                  <Route path="manageQuestion" element={<ManageQuestion />} />
                  <Route path="batchEvidence" element={<BatchStatus />} />
                  <Route
                    path="assessorEvidence"
                    element={<AssessorEvidence />}
                  />
                  <Route path="assignBatch" element={<ManageAssignTest />} />
                 
                  <Route
                    path="batchEvidence/candidate/:candidateId"
                    element={<EvidenceComponent />}
                  />
                  <Route path="batchResult" element={<BatchResult />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="summary-report" element={<SummaryReport />} />
                  <Route
                    path="batchAnalytics"
                    element={<ManageBatchAnalytics />}
                  />
                </Route>
              )}
            </Routes>
          </Suspense>
        </Router>
      </ErrorBoundary>
    </>
  );
}

function Logout({ onLogout}) {
  useEffect(() => {
    onLogout();
  }, [onLogout]);

  let navigateTo = "/login";

  return <Navigate to={navigateTo} replace />;
}
export default App;