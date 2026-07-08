import { NavLink } from 'react-router-dom'
import { routeList, sectionLabels, type Section } from '../../routes'

const sections: Section[] = [
  'optionsTheory',
  'numericalPdeMethods',
  'americanOptionMethods',
  'probabilisticMethods',
]

export function Sidebar() {
  return (
    <nav className="w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-3 py-4">
      {sections.map((section) => (
        <div key={section} className="mb-4">
          <div className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {sectionLabels[section]}
          </div>
          <ul className="space-y-0.5">
            {routeList
              .filter((r) => r.section === section)
              .map((r) => (
                <li key={r.path}>
                  <NavLink
                    to={r.path}
                    className={({ isActive }) =>
                      `block rounded-md px-2 py-1.5 text-sm ${
                        isActive
                          ? 'bg-blue-50 font-medium text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    {r.label}
                  </NavLink>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
