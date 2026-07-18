import { Link } from 'react-router-dom'
import { PageLayout } from '../components/Layout/PageLayout'

const projectAreas = [
  {
    title: 'Options theory',
    text: 'Payoffs, European and American exercise styles, the Black-Scholes equation, and the heat-equation transformation.',
  },
  {
    title: 'Numerical PDE methods',
    text: 'Finite-difference grids, explicit and implicit schemes, Crank-Nicolson, and Method of Lines with RK4.',
  },
  {
    title: 'Probabilistic methods',
    text: 'Pseudo-random generators, acceptance-rejection, Halton nodes, Monte Carlo, and numerical SDE methods.',
  },
  {
    title: 'American options',
    text: 'Free-boundary intuition, obstacle problems, SOR, PSOR, and the connection between theory and implementation.',
  },
]

export default function Home() {
  return (
    <PageLayout
      title="Computational Methods in Finance"
      rightPanel={{
        known: 'Lecture-note topics, project implementations, and numerical experiments.',
        unknown: 'How the theory behaves when turned into algorithms and simulations.',
        method: 'Use compact derivations, stencils, step-by-step calculations, matrix views, and interactive plots.',
        takeaway:
          'The application is a visual companion for understanding how computational finance methods move from equations to code.',
      }}
    >
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="space-y-4">
          <div className="rounded-md border border-blue-200 bg-blue-50 px-5 py-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Interactive learning resource</p>
            <p className="mt-3 max-w-3xl text-xl font-semibold leading-snug text-slate-950">
              A visual application for exploring the theory, algorithms, and simulations used in
              Computational Methods in Finance.
            </p>
          </div>
          <p className="text-slate-700">
            This project brings together topics from the{' '}
            <a
              href="https://fenix.tecnico.ulisboa.pt/cursos/mma/disciplina-curricular/1127428915200718"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blue-700 underline decoration-blue-200 underline-offset-2 hover:text-blue-900"
            >
              Computational Methods in Finance
            </a>{' '}
            course at Técnico / Universidade de Lisboa and presents them through derivations,
            algorithmic steps, grid calculations, matrix forms, and interactive visual simulations.
          </p>
          <p className="text-slate-700">
            The goal is to make the link between mathematical notation and implementation easier to see:
            each page starts from the relevant idea, shows how it is discretised or simulated, and then lets
            the reader inspect the numerical object being computed.
          </p>
        </div>

        <aside className="rounded-md border border-slate-200 bg-white px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Author</p>
          <p className="mt-3 text-lg font-semibold text-slate-950">Cristóvão Matos</p>
          <p className="mt-2 text-sm text-slate-700">
            Student in Computational Methods in Finance 2025/26 at Técnico / ULisboa.
          </p>
          <a
            href="https://cristovaomatos.github.io"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Personal page
          </a>
        </aside>
      </section>

      <section className="rounded-md border border-slate-200 bg-white px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Source and Disclaimer</h2>
        <p className="mt-2 text-slate-700">
          The content is based on the lecture notes and course material prepared by Professor{' '}
          <a
            href="https://webpages.ciencias.ulisboa.pt/~prantunes/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-blue-700 underline decoration-blue-200 underline-offset-2 hover:text-blue-900"
          >
            Pedro Antunes
          </a>
          . The explanations and implementations here are a best-effort visual companion to
          those materials, but they have not been fully audited or formally reviewed and may still contain
          mistakes, omissions, or software bugs.
        </p>
        <p className="mt-2 text-slate-700">
          If you find an error, please report it through the contact links available on my{' '}
          <a
            href="https://cristovaomatos.github.io"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-blue-700 underline decoration-blue-200 underline-offset-2 hover:text-blue-900"
          >
            personal page
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">What the Application Covers</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {projectAreas.map((area) => (
            <div key={area.title} className="rounded-md border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{area.title}</p>
              <p className="mt-1 text-sm text-slate-600">{area.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">How to Use It</h2>
        <p className="text-slate-700">
          The pages are organised as a guided path, but each section can also be used independently when
          revisiting a specific method or simulation.
        </p>
        <Link
          to="/options-theory/option-payoffs"
          className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Start with option payoffs
        </Link>
      </section>
    </PageLayout>
  )
}
