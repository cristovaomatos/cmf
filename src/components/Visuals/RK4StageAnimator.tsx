import { useState } from 'react'
import { EquationBlock } from '../Math/EquationBlock'

const stages = [
  { id: 0, label: 'k1', latex: 'k_1 = h_t\\,f(t_n, W_n)' },
  { id: 1, label: 'k2', latex: 'k_2 = h_t\\,f(t_n+h_t/2,\\ W_n+k_1/2)' },
  { id: 2, label: 'k3', latex: 'k_3 = h_t\\,f(t_n+h_t/2,\\ W_n+k_2/2)' },
  { id: 3, label: 'k4', latex: 'k_4 = h_t\\,f(t_n+h_t,\\ W_n+k_3)' },
  { id: 4, label: 'update', latex: 'W_{n+1}=W_n+\\frac{k_1+2k_2+2k_3+k_4}{6}' },
]

export function RK4StageAnimator() {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {stages.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              active === s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <EquationBlock latex={stages[active].latex} />
    </div>
  )
}
