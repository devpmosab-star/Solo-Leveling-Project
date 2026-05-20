import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'

const careerTracks = [
  { key: 'plc', name: 'PLC / Automation', progress: 8, next: 'Inputs & Outputs basics' },
  { key: 'scada', name: 'SCADA / HMI', progress: 3, next: 'SCADA dashboard demo' },
  { key: 'bms', name: 'BMS / Building Automation', progress: 5, next: 'BMS system overview' },
]

const foundationMissions = [
  { title: 'PLC Inputs & Outputs Basics', reason: 'First practical foundation for automation interviews.', duration: '60–90 min', xp: 120, type: 'Career' },
  { title: 'Watch one SCADA dashboard demo', reason: 'Understand how monitoring and control screens look in real work.', duration: '30–45 min', xp: 70, type: 'Career' },
  { title: 'Review basic electrical control drawings', reason: 'Drawings are a core skill for electrical/control engineers.', duration: '45–60 min', xp: 90, type: 'Electrical Basics' },
]

const defaultProfile = { name: 'Ascender', level: 1, xp: 0, phase: 'Foundation', momentum: 55, focus: 50, energy: 50, professionalValue: 5 }

function todayKey() { return new Date().toISOString().slice(0, 10) }
function formatTime(date) { return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
function formatDate(date) { return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }
function getPhase(level) {
  if (level >= 31) return 'High Performance'
  if (level >= 21) return 'Professional Growth'
  if (level >= 11) return 'Discipline'
  return 'Foundation'
}
function getMomentumStatus(value) {
  if (value >= 75) return 'Rising'
  if (value >= 45) return 'Stable'
  return 'Recovery Needed'
}
function buildTodayPlan(profile, checks) {
  const lowEnergy = profile.energy < 40
  const lowMomentum = profile.momentum < 40
  const mission = lowEnergy || lowMomentum
    ? { title: 'Recovery Study Session', reason: 'Your system load is low today. Keep the chain alive with a lighter session.', duration: '25–40 min', xp: 45, type: 'Recovery Career' }
    : foundationMissions[(new Date().getDate() - 1) % foundationMissions.length]

  const core = [
    { id: 'career', title: lowEnergy ? 'Light Study' : 'Career Study', detail: lowEnergy ? '25 minutes only' : '60 minutes focused learning', xp: lowEnergy ? 35 : 80, checked: checks.career || false, layer: 'xp' },
    { id: 'movement', title: 'Movement', detail: lowEnergy ? '10 min walk' : '20–30 min walk or workout', xp: lowEnergy ? 20 : 45, checked: checks.movement || false, layer: 'xp' },
    { id: 'prayer', title: 'Prayer Stability', detail: 'Core obligation layer — no XP, only stability', xp: 0, checked: checks.prayer || false, layer: 'stability' },
    { id: 'sleep', title: 'Sleep Reset', detail: 'Prepare for better sleep tonight', xp: 25, checked: checks.sleep || false, layer: 'xp' },
  ]

  const recommendation = lowMomentum
    ? 'Recovery Mode is recommended today. Do the minimum, protect consistency, and avoid overload.'
    : lowEnergy
      ? 'Energy is low. Keep the day light but do not disappear from the system.'
      : 'Momentum is stable. Complete the main mission and one movement task.'
  return { mission, core, recommendation, mode: lowMomentum || lowEnergy ? 'Recovery' : 'Normal' }
}

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(defaultProfile)
  const [checks, setChecks] = useState({})
  const [toast, setToast] = useState('')
  const [now, setNow] = useState(new Date())
  const [view, setView] = useState('home')

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession); setLoading(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('ascend-profile')
    const savedChecks = localStorage.getItem('ascend-checks-' + todayKey())
    if (saved) setProfile(JSON.parse(saved))
    if (savedChecks) setChecks(JSON.parse(savedChecks))
  }, [])

  useEffect(() => { localStorage.setItem('ascend-profile', JSON.stringify(profile)) }, [profile])
  useEffect(() => { localStorage.setItem('ascend-checks-' + todayKey(), JSON.stringify(checks)) }, [checks])

  const plan = useMemo(() => buildTodayPlan(profile, checks), [profile, checks])
  const xpNeed = 500 + profile.level * 120
  const xpPercent = Math.min(100, Math.round((profile.xp / xpNeed) * 100))
  const momentumStatus = getMomentumStatus(profile.momentum)

  function notify(text) { setToast(text); setTimeout(() => setToast(''), 2200) }

  async function signIn(e) {
    e.preventDefault()
    if (!email || !password) return notify('اكتب الإيميل وكلمة المرور')
    const result = authMode === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (result.error) notify(result.error.message)
    else notify(authMode === 'signup' ? 'Account created' : 'Logged in')
  }

  async function signOut() { await supabase.auth.signOut() }

  function completeCore(item) {
    if (checks[item.id]) return
    setChecks(prev => ({ ...prev, [item.id]: true }))
    if (item.layer === 'stability') {
      setProfile(prev => ({ ...prev, momentum: Math.min(100, prev.momentum + 4) }))
      notify('Stability confirmed')
      return
    }
    addXP(item.xp, item.title)
  }

  function completeMission() { addXP(plan.mission.xp, plan.mission.title) }

  function addXP(amount, label) {
    setProfile(prev => {
      let xp = prev.xp + amount
      let level = prev.level
      let momentum = Math.min(100, prev.momentum + 6)
      let focus = Math.min(100, prev.focus + 3)
      let professionalValue = Math.min(100, prev.professionalValue + (label.toLowerCase().includes('plc') ? 2 : 1))
      let need = 500 + level * 120
      while (xp >= need) {
        xp -= need
        level += 1
        momentum = Math.min(100, momentum + 10)
        need = 500 + level * 120
      }
      return { ...prev, xp, level, phase: getPhase(level), momentum, focus, professionalValue }
    })
    notify(`Completed: ${label}`)
  }

  function missedPrayerRecovery() {
    notify('Recovery action added: pray sunnah or quiet reflection')
    setProfile(prev => ({ ...prev, momentum: Math.max(0, prev.momentum - 8) }))
  }

  if (loading) {
    return <main className="auth-screen"><div className="auth-card"><div className="logo">A</div><h1>Ascend</h1><p>Loading your system...</p></div></main>
  }

  if (!session) {
    return (
      <main className="auth-screen">
        {toast && <div className="toast">{toast}</div>}
        <form className="auth-card" onSubmit={signIn}>
          <div className="logo">A</div>
          <p className="kicker">PERSONAL OPERATING SYSTEM</p>
          <h1>Ascend</h1>
          <p>Build your career, discipline, energy, and long-term life progress.</p>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button>{authMode === 'signup' ? 'Create Account' : 'Login'}</button>
          <button type="button" className="secondary" onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}>
            {authMode === 'signup' ? 'I already have an account' : 'Create new account'}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className={'app phase-' + profile.phase.toLowerCase().replaceAll(' ', '-')}>
      {toast && <div className="toast">{toast}</div>}
      <header className="topbar">
        <div className="brand"><div className="logo small">A</div><div><p>ASCEND</p><h1>{profile.phase} · Level {profile.level}</h1></div></div>
        <div className="clock"><b>{formatTime(now)}</b><span>{formatDate(now)}</span></div>
        <button className="logout" onClick={signOut}>Logout</button>
      </header>

      <nav className="nav">
        <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>Command</button>
        <button className={view === 'career' ? 'active' : ''} onClick={() => setView('career')}>Career</button>
        <button className={view === 'analytics' ? 'active' : ''} onClick={() => setView('analytics')}>Analytics</button>
      </nav>

      {view === 'home' && (
        <>
          <section className="hero">
            <div><p className="kicker">TODAY'S SYSTEM STATUS</p><h2>{plan.mode === 'Recovery' ? 'Recovery Mode' : 'Command Center'}</h2><p>{plan.recommendation}</p></div>
            <div className="level-card"><span>LEVEL</span><strong>{profile.level}</strong><p>{profile.phase}</p><div className="bar"><div style={{ width: `${xpPercent}%` }} /></div><small>{profile.xp}/{xpNeed} XP</small></div>
          </section>

          <section className="grid main-grid">
            <div className="card mission-card">
              <p className="kicker">MAIN MISSION</p><h3>{plan.mission.title}</h3><p>{plan.mission.reason}</p>
              <div className="mission-meta"><span>{plan.mission.duration}</span><span>+{plan.mission.xp} XP</span><span>{plan.mission.type}</span></div>
              <button onClick={completeMission}>Complete Mission</button>
            </div>
            <div className="card"><p className="kicker">MOMENTUM</p><h3>{momentumStatus}</h3><div className="bar big"><div style={{ width: `${profile.momentum}%` }} /></div><p className="muted">Momentum controls daily difficulty, recommendations, and recovery mode.</p></div>
            <div className="card daily-core">
              <p className="kicker">DAILY CORE</p>
              {plan.core.map(item => (
                <div className={'core-item ' + (checks[item.id] ? 'done' : '')} key={item.id}>
                  <div><h4>{item.title}</h4><p>{item.detail}</p>{item.layer === 'stability' && <small>No XP · Stability Layer</small>}</div>
                  <button onClick={() => completeCore(item)}>{checks[item.id] ? 'Done' : 'Check'}</button>
                </div>
              ))}
            </div>
            <div className="card prayer-card"><p className="kicker">CORE STABILITY</p><h3>Prayer is not XP</h3><p>Prayer is treated as an obligation layer, not a points task. If missed, the system suggests corrective recovery, not punishment.</p><button className="secondary" onClick={missedPrayerRecovery}>Missed prayer recovery</button></div>
          </section>
        </>
      )}

      {view === 'career' && (
        <section className="grid">
          <div className="card wide"><p className="kicker">PHASE 1 CAREER ROADMAP</p><h3>Automation + SCADA + BMS</h3><p className="muted">The current goal is employability foundation, portfolio projects, and readiness for junior interviews.</p></div>
          <div className="tracks">
            {careerTracks.map(track => (
              <div className="card track" key={track.key}><h3>{track.name}</h3><div className="bar"><div style={{ width: `${track.progress}%` }} /></div><p>Progress: {track.progress}%</p><small>Next: {track.next}</small></div>
            ))}
          </div>
        </section>
      )}

      {view === 'analytics' && (
        <section className="grid analytics">
          <Stat title="Discipline" value={profile.momentum} />
          <Stat title="Focus" value={profile.focus} />
          <Stat title="Energy" value={profile.energy} />
          <Stat title="Professional Value" value={profile.professionalValue} />
        </section>
      )}
    </main>
  )
}

function Stat({ title, value }) {
  return <div className="card stat"><p className="kicker">{title}</p><h3>{value}%</h3><div className="bar"><div style={{ width: `${value}%` }} /></div></div>
}
