import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg px-2 py-1 text-lg font-bold tracking-tight">
      <span aria-hidden className="grid size-8 place-items-center rounded-[10px] bg-[linear-gradient(135deg,#6366f1,#059669)] text-white shadow-soft">
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
          <path d="M12 3 4 7.5v9L12 21l8-4.5v-9z" />
          <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
        </svg>
      </span>
      IT Hub
    </Link>
  )
}
