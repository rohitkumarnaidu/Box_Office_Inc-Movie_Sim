import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";

import Dashboard from "./pages/dashboard/Dashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import Scripts from "./pages/scripts/Scripts";
import Writers from "./pages/writers/Writers";
import Directors from "./pages/directors/Directors";
import Actors from "./pages/actors/Actors";
import CrewMarket from "./pages/crew/CrewMarket";
import OwnedCrew from "./pages/crew/OwnedCrew";
import ActiveMovies from "./pages/movies/ActiveMovies";
import CreateMovie from "./pages/movies/CreateMovie";
import MovieDetails from "./pages/movies/MovieDetails";
import ReadyForRelease from "./pages/movies/ReadyForRelease";
import ReleaseResult from "./pages/movies/ReleaseResult";
import MovieLibrary from "./pages/movies/MovieLibrary";
import ReleasedMovieDetail from "./pages/movies/ReleasedMovieDetail";
import ProductionQueue from "./pages/movies/ProductionQueue";
import MovieComparison from "./pages/movies/MovieComparison";
import StreamingDeals from "./pages/movies/StreamingDeals";
import StudioStats from "./pages/studio/StudioStats";
import FinancialHistory from "./pages/studio/FinancialHistory";
import Franchises from "./pages/studio/Franchises";
import Leaderboard from "./pages/studio/Leaderboard";
import TalentProfile from "./pages/talent/TalentProfile";
import DirectorProfile from "./pages/directors/DirectorProfile";
import WriterProfile from "./pages/writers/WriterProfile";
import Notifications from "./pages/notifications/Notifications";
import Settings from "./pages/settings/Settings";
import AuthMonitoring from "./pages/auth/AuthMonitoring";
import NewsFeed from "./pages/news/NewsFeed";
import Toast from "./components/common/Toast";
import RivalStudios from "./pages/rivals/RivalStudios";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rivals"
          element={
            <ProtectedRoute>
              <RivalStudios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/:id"
          element={
            <ProtectedRoute>
              <MovieDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/ready"
          element={
            <ProtectedRoute>
              <ReadyForRelease />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/:id/results"
          element={
            <ProtectedRoute>
              <ReleaseResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/:id/streaming-deals"
          element={
            <ProtectedRoute>
              <StreamingDeals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/library"
          element={
            <ProtectedRoute>
              <MovieLibrary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/library/:id"
          element={
            <ProtectedRoute>
              <ReleasedMovieDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/queue"
          element={
            <ProtectedRoute>
              <ProductionQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/comparison"
          element={
            <ProtectedRoute>
              <MovieComparison />
            </ProtectedRoute>
          }
        />

        <Route
          path="/movies"
          element={
            <ProtectedRoute>
              <ActiveMovies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/create"
          element={
            <ProtectedRoute>
              <CreateMovie />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scripts"
          element={
            <ProtectedRoute>
              <Scripts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/writers"
          element={
            <ProtectedRoute>
              <Writers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/writers/:writerId/profile"
          element={
            <ProtectedRoute>
              <WriterProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/actors"
          element={
            <ProtectedRoute>
              <Actors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/directors"
          element={
            <ProtectedRoute>
              <Directors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/directors/:id"
          element={
            <ProtectedRoute>
              <DirectorProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/talent/:type/:id"
          element={
            <ProtectedRoute>
              <TalentProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crew"
          element={
            <ProtectedRoute>
              <CrewMarket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crew/owned"
          element={
            <ProtectedRoute>
              <OwnedCrew />
            </ProtectedRoute>
          }
        />

        <Route
          path="/studio/stats"
          element={
            <ProtectedRoute>
              <StudioStats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studio/history"
          element={
            <ProtectedRoute>
              <FinancialHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studio/franchises"
          element={
            <ProtectedRoute>
              <Franchises />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/news"
          element={
            <ProtectedRoute>
              <NewsFeed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth-monitoring"
          element={
            <ProtectedRoute>
              <AuthMonitoring />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toast />
    </BrowserRouter>
  );
}

export default App;
