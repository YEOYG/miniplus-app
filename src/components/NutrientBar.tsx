interface NutrientBarProps {
  label: string
  current: number
  goal: number
  color: string
  unit?: string
}

export default function NutrientBar({ label, current, goal, color, unit = 'g' }: NutrientBarProps) {
  const progress = Math.min((current / goal) * 100, 100)
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-body-sm">
        <span className="text-neutral-600">{label}</span>
        <span className="text-neutral-800 font-medium">{current}/{goal}{unit}</span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
