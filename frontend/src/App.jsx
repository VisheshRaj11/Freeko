import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import LandingPage    from "./pages/LandingPage"
import LoginPage      from "./pages/LoginPage"
import RegisterPage   from "./pages/RegisterPage"
import { useAuthStore } from '../store/authStore'

import CoachDashboard   from "./pages/coach/CoachDashboard"
import CoachAthletes    from "./pages/coach/CoachAthletes"
import CoachPlanBuilder from "./pages/coach/CoachPlanBuilder"
import CoachReports     from "./pages/coach/CoachReports"
import CoachChat        from "./pages/coach/CoachChat"

import AthleteDashboard from "./pages/athlete/AthleteDashboard"
import AthleteWorkout   from "./pages/athlete/AthleteWorkout"
import AthleteProgress  from "./pages/athlete/AthleteProgress"
import AthleteChat      from "./pages/athlete/AthleteChat"

import CoachLayout   from "./layouts/CoachLayout"
import AthleteLayout from "./layouts/AthleteLayout"

const ProtectedRoute = ({children, role}) => {
  const {user, token} = useAuthStore();
  if(!token) return <Navigate to={'/login'} replace/>
  if(role && user?.role !== role) return <Navigate to="/" replace />
  return children
}

const App = () => {
  return (
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path='/coach' element={
        <ProtectedRoute role={"coach"}>
          <CoachLayout/>
        </ProtectedRoute>
      }
      >
        <Route index                element={<CoachDashboard />} />
        <Route path="athletes"      element={<CoachAthletes />} />
        <Route path="plan/:planId"  element={<CoachPlanBuilder />} />
        <Route path="reports"       element={<CoachReports />} />
        <Route path="chat/:planId"  element={<CoachChat />} />
      </Route>

      <Route path="/athlete" element={
        <ProtectedRoute role="athlete">
          <AthleteLayout />
        </ProtectedRoute>
      }>
        <Route index                  element={<AthleteDashboard />} />
        <Route path="workout/:id"     element={<AthleteWorkout />} />
        <Route path="progress"        element={<AthleteProgress />} />
        <Route path="chat/:planId"    element={<AthleteChat />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App