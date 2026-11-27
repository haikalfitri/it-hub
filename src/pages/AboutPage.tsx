import { ExternalLink, PlayCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ArchitectureDiagram } from '@/components/about/ArchitectureDiagram'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { PORTFOLIO_URL, REPO_URL } from '@/config'
import { startTour } from '@/tour/events'

const COMPARISON = [
  ['Sign-in', 'Microsoft 365 single sign-on', 'Role switcher (Staff, Manager, HR, IT)'],
  ['Data', 'Database on AWS', 'Your browser only, with a Reset button'],
  ['Approvals', 'Email with a link back to the app', 'In-app notifications'],
  ['User and org data', 'Microsoft Graph API', 'Fictional staff list'],
  ['Scope', 'About 20 forms and a ticket system, ~100 users', '4 workflows, tickets, inventory, help center'],
]

const STACK = ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn/ui', 'Recharts', 'Zustand', 'Vitest + Testing Library', 'Netlify']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[10px] border bg-card p-5 shadow-soft sm:p-6">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <div className="space-y-2 text-muted-foreground">{children}</div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl">
      <PageHeader eyebrow="About this project" title="One connected place for IT" description="Help center, service desk, asset inventory and approval workflows that share one set of data." />

      <p className="mb-6 rounded-[10px] border border-brand/40 bg-brand-soft px-4 py-3 font-medium text-brand-strong">
        A rebuild with fictional data of a system I built at Cypark. No company data is used.
      </p>

      <div className="space-y-5">
        <Section title="The problem">
          <p>
            Staff asked the same IT questions through chats, calls, walk-ups and email. About 20 processes, such as equipment requests, laptop returns and access requests, still ran on
            paper forms. There was no ticketing system, and the hardware inventory lived in a spreadsheet that the forms never touched.
          </p>
          <p>Requests were slow to approve, hard to track, and the inventory drifted out of date.</p>
        </Section>

        <Section title="What I did">
          <ul className="list-disc space-y-1 pl-5">
            <li>Built a SharePoint Help Center with how-to guides, FAQs, a request form and announcements, so staff can help themselves first.</li>
            <li>Designed the information architecture and each approval workflow, and built the web system with a colleague's guidance.</li>
            <li>Had every flow reviewed and approved by my manager and head of department before it went in.</li>
            <li>Linked the hardware inventory to the forms, so asset records feed requests and change when a request completes.</li>
          </ul>
          <p>The real system is in its demo phase. It has been presented to management and team members, for about 100 users.</p>
        </Section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">How the real system fits together</h2>
          <ArchitectureDiagram />
        </section>

        <section className="rounded-[10px] border bg-card shadow-soft">
          <h2 className="px-5 pt-5 text-lg font-semibold sm:px-6">Real system vs this demo</h2>
          <div className="overflow-x-auto p-5 sm:p-6">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="border-b pb-2 font-semibold" />
                  <th scope="col" className="border-b pb-2 font-semibold">
                    Real system
                  </th>
                  <th scope="col" className="border-b pb-2 font-semibold">
                    This demo
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(([k, real, demo]) => (
                  <tr key={k}>
                    <th scope="row" className="border-b py-2.5 pr-4 font-medium">
                      {k}
                    </th>
                    <td className="border-b py-2.5 pr-4 text-muted-foreground">{real}</td>
                    <td className="border-b py-2.5 text-muted-foreground">{demo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Section title="Connected by design">
          <p>Every workflow writes to shared data instead of ending in an inbox:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">Equipment request:</strong> the manager approves, IT assigns a device from stock, and the asset's history updates.
            </li>
            <li>
              <strong className="text-foreground">Laptop surrender:</strong> IT confirms the serial number against inventory and the device goes back to stock or repair.
            </li>
            <li>
              <strong className="text-foreground">Onboarding:</strong> creates the person, their system access and their laptop assignment in one step.
            </li>
            <li>
              <strong className="text-foreground">System access:</strong> after approval, the new system appears on the person's profile.
            </li>
          </ul>
          <p>Each request also opens a linked Service Desk ticket that resolves by itself when the request completes.</p>
        </Section>

        <Section title="Built with">
          <ul className="flex flex-wrap gap-2">
            {STACK.map((s) => (
              <li key={s} className="rounded-full border bg-background px-3 py-1 text-sm font-medium text-foreground">
                {s}
              </li>
            ))}
          </ul>
          <p>Business rules are pure, unit-tested TypeScript functions. The UI only calls them.</p>
        </Section>

        <div className="flex flex-wrap gap-2">
          <Button size="lg" onClick={startTour}>
            <PlayCircle /> Take the 60-second tour
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              Source on GitHub <ExternalLink />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={PORTFOLIO_URL} target="_blank" rel="noreferrer">
              My portfolio <ExternalLink />
            </a>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
