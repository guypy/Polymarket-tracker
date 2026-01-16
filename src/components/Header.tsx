export default function Header() {
  return (
    <header className="pt-6 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-poly-accent to-poly-purple flex items-center justify-center glow-accent">
          <svg className="w-7 h-7 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 70 L25 30 L50 50 L75 30 L75 70" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold gradient-text">PM Tracker</h1>
          <p className="text-sm text-gray-500">Polymarket Activity Monitor</p>
        </div>
      </div>
    </header>
  )
}
