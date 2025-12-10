import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from './contexts/AuthContext'
import TabBar from './components/TabBar'
import { Loader2 } from 'lucide-react'

// 核心页面直接加载
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

// 懒加载次要页面
const Recipes = lazy(() => import('./pages/Recipes'))
const AIAssistant = lazy(() => import('./pages/AIAssistant'))
const Family = lazy(() => import('./pages/Family'))
const Settings = lazy(() => import('./pages/Settings'))
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'))
const MemberDetail = lazy(() => import('./pages/MemberDetail'))
const FamilyNutrition = lazy(() => import('./pages/FamilyNutrition'))
const FoodTrends = lazy(() => import('./pages/FoodTrends'))
const NutritionAnalysis = lazy(() => import('./pages/NutritionAnalysis'))
const Shopping = lazy(() => import('./pages/Shopping'))
const ShoppingLists = lazy(() => import('./pages/ShoppingLists'))
const ShoppingListDetail = lazy(() => import('./pages/ShoppingListDetail'))
const PantryManage = lazy(() => import('./pages/PantryManage'))
const PriceCompare = lazy(() => import('./pages/PriceCompare'))
const Cooking = lazy(() => import('./pages/Cooking'))
const CookingConsole = lazy(() => import('./pages/CookingConsole'))

// 加载占位组件
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 pb-safe">
      <main className="pb-14">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/family" element={<Family />} />
            <Route path="/family/member/:memberId" element={<MemberDetail />} />
            <Route path="/family/nutrition" element={<FamilyNutrition />} />
            <Route path="/trends" element={<FoodTrends />} />
            <Route path="/nutrition-analysis" element={<NutritionAnalysis />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/shopping/lists" element={<ShoppingLists />} />
            <Route path="/shopping/list/:id" element={<ShoppingListDetail />} />
            <Route path="/shopping/pantry" element={<PantryManage />} />
            <Route path="/shopping/compare" element={<PriceCompare />} />
            <Route path="/cooking" element={<Cooking />} />
            <Route path="/cooking/console/:id" element={<CookingConsole />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </main>
      <TabBar />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      } />
    </Routes>
  )
}
