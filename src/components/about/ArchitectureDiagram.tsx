type Box = { x: number; y: number; w: number; h: number; title: string; sub: string; accent?: boolean }

const BOXES: Box[] = [
  { x: 20, y: 150, w: 170, h: 64, title: 'Staff browser', sub: '~100 users, any device' },
  { x: 20, y: 286, w: 170, h: 64, title: 'SharePoint Help Center', sub: 'guides, FAQs, notices' },
  { x: 285, y: 20, w: 190, h: 64, title: 'Microsoft 365 SSO', sub: 'one work sign-in' },
  { x: 285, y: 146, w: 190, h: 76, title: 'Web app on AWS', sub: '~20 digital forms + tickets', accent: true },
  { x: 285, y: 286, w: 190, h: 64, title: 'Database', sub: 'requests, tickets, hardware' },
  { x: 570, y: 20, w: 170, h: 64, title: 'Microsoft Graph API', sub: 'user and org data' },
  { x: 570, y: 150, w: 170, h: 64, title: 'Email approvals', sub: 'link opens the app' },
  { x: 570, y: 286, w: 170, h: 64, title: 'Manager / HoD', sub: 'approve or reject' },
]

type Arrow = { d: string; label: string; lx: number; ly: number; both?: boolean }

const ARROWS: Arrow[] = [
  { d: 'M190 182 H281', label: 'opens', lx: 236, ly: 174 },
  { d: 'M105 214 V282', label: 'self-service', lx: 112, ly: 252 },
  { d: 'M380 146 V88', label: 'SSO', lx: 388, ly: 121, both: true },
  { d: 'M475 160 L566 66', label: 'prefill', lx: 482, ly: 96 },
  { d: 'M475 184 H566', label: 'notify', lx: 506, ly: 176 },
  { d: 'M655 214 V282', label: 'click link', lx: 662, ly: 252 },
  { d: 'M570 300 L479 214', label: 'decision', lx: 468, ly: 270 },
  { d: 'M380 222 V282', label: 'read / write', lx: 388, ly: 256, both: true },
]

export function ArchitectureDiagram() {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card p-4 shadow-soft">
      <svg
        role="img"
        aria-label="Architecture of the real system: staff sign in with Microsoft 365 single sign-on to a web app on AWS, which prefills forms from Microsoft Graph, stores requests, tickets and hardware in a database, and emails approvers a link back to the app. A SharePoint Help Center sits alongside for self-service."
        viewBox="0 0 760 370"
        className="min-w-[640px]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--muted-foreground)" />
          </marker>
        </defs>
        {ARROWS.map((a) => (
          <g key={a.d}>
            <path d={a.d} fill="none" stroke="var(--muted-foreground)" strokeWidth={1.5} markerEnd="url(#arrow)" markerStart={a.both ? 'url(#arrow)' : undefined} />
            <text x={a.lx} y={a.ly} fontSize={11} fill="var(--muted-foreground)">
              {a.label}
            </text>
          </g>
        ))}
        {BOXES.map((b) => (
          <g key={b.title}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={12}
              fill={b.accent ? 'var(--brand-soft)' : 'var(--background)'}
              stroke={b.accent ? 'var(--brand)' : 'var(--border)'}
              strokeWidth={b.accent ? 2 : 1.5}
            />
            <text x={b.x + b.w / 2} y={b.y + b.h / 2 - 4} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--foreground)">
              {b.title}
            </text>
            <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 15} textAnchor="middle" fontSize={11.5} fill="var(--muted-foreground)">
              {b.sub}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
