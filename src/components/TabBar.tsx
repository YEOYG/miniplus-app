import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LayoutDashboard, ShoppingCart, Sparkles, Users, User, ChefHat } from 'lucide-react'

const tabs = [
  { path: '/', icon: LayoutDashboard, label: '首页' },
  { path: '/cooking', icon: ChefHat, label: '烹饪' },
  { path: '/shopping', icon: ShoppingCart, label: '采购' },
  { path: '/family', icon: Users, label: '家庭' },
  { path: '/settings', icon: User, label: '我的' },
]

export default function TabBar() {
  const { userRole } = useAuth()
  
  const filteredTabs = userRole === 'single' 
    ? tabs.filter(t => t.path !== '/family')
    : tabs

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 bottom-safe z-50">
      <div className="flex items-center justify-around h-14">
        {filteredTabs.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full transition-all duration-150
              ${isActive 
                ? 'text-primary-500 scale-105' 
                : 'text-neutral-400 hover:text-neutral-600'}`
            }
          >
            <Icon className="w-6 h-6" strokeWidth={1.5} />
            <span className="text-caption mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
