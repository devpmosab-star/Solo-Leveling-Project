import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'

const careerTracks = [
  { key: 'plc', name: 'PLC / الأتمتة', progress: 8, next: 'أساسيات المدخلات والمخرجات' },
  { key: 'scada', name: 'SCADA / واجهات المراقبة', progress: 3, next: 'تجربة شاشة SCADA' },
  { key: 'bms', name: 'BMS / أتمتة المباني', progress: 5, next: 'نظرة عامة على نظام BMS' },
]

const foundationMissions = [
  { title: 'أساسيات PLC: المدخلات والمخرجات', reason: 'أول أساس عملي مهم لمقابلات الأتمتة.', duration: '60–90 min', xp: 120, type: 'المسار المهني' },
  { title: 'Watch one تجربة شاشة SCADA', reason: 'لفهم شكل شاشات المراقبة والتحكم في العمل الحقيقي.', duration: '30–45 min', xp: 70, type: 'المسار المهني' },
  { title: 'راجع أساسيات مخططات التحكم الكهربائي', reason: 'المخططات مهارة أساسية لمهندس الكهرباء والتحكم.', duration: '45–60 min', xp: 90, type: 'Electrical Basics' },
]

const defaultProfile = { name: 'المتطوّر', level: 1, xp: 0, phase: 'مرحلة التأسيس', momentum: 55, focus: 50, energy: 50, professionalValue: 5 }

function todayKey() { return new Date().toISOString().slice(0, 10) }
function formatTime(date) { return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) }
function formatDate(date) { return date.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }
function getPhase(level) {
  if (level >= 31) return 'الأداء العالي'
  if (level >= 21) return 'النمو المهني'
  if (level >= 11) return 'الانضباط'
  return 'مرحلة التأسيس'
}
function getMomentumStatus(value) {
  if (value >= 75) return 'صاعد'
  if (value >= 45) return 'مستقر'
  return 'يحتاج استعادة'
}
function buildTodayPlan(profile, checks) {
  const lowالطاقة = profile.energy < 40
  const lowMomentum = profile.momentum < 40
  const mission = lowالطاقة || lowMomentum
    ? { title: 'جلسة دراسة خفيفة للاستعادة', reason: 'طاقتك منخفضة اليوم. حافظ على الاستمرارية بجلسة خفيفة.', duration: '25–40 min', xp: 45, type: 'استعادة مهنية' }
    : foundationMissions[(new Date().getDate() - 1) % foundationMissions.length]

  const core = [
    { id: 'career', title: lowالطاقة ? 'دراسة خفيفة' : 'دراسة مهنية', detail: lowالطاقة ? '25 دقيقة فقط' : '60 دقيقة تعلم مركز', xp: lowالطاقة ? 35 : 80, checked: checks.career || false, layer: 'xp' },
    { id: 'movement', title: 'الحركة', detail: lowالطاقة ? 'مشي 10 دقائق' : 'مشي أو تمرين 20–30 دقيقة', xp: lowالطاقة ? 20 : 45, checked: checks.movement || false, layer: 'xp' },
    { id: 'prayer', title: 'ثبات الصلاة', detail: 'طبقة إلزامية أساسية — بدون نقاط، فقط ثبات', xp: 0, checked: checks.prayer || false, layer: 'stability' },
    { id: 'sleep', title: 'ضبط النوم', detail: 'استعد لنوم أفضل الليلة', xp: 25, checked: checks.sleep || false, layer: 'xp' },
  ]

  const recommendation = lowMomentum
    ? 'وضع الاستعادة مناسب اليوم. أنجز الحد الأدنى واحمِ الاستمرارية بدون ضغط زائد.'
    : lowالطاقة
      ? 'الطاقة منخفضة. خفف اليوم لكن لا تنقطع عن النظام.'
      : 'الزخم مستقر. أنجز المهمة الرئيسية ومهمة حركة واحدة.'
  return { mission, core, recommendation, mode: lowMomentum || lowالطاقة ? 'Recovery' : 'Normal' }
}

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(defaultProfile)
  const [checks, setإنجازs] = useState({})
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
    const savedإنجازs = localStorage.getItem('ascend-checks-' + todayKey())
    if (saved) setProfile(JSON.parse(saved))
    if (savedإنجازs) setإنجازs(JSON.parse(savedإنجازs))
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
    else notify(authMode === 'signup' ? 'تم إنشاء الحساب' : 'تم تسجيل الدخول')
  }

  async function signOut() { await supabase.auth.signOut() }

  function completeCore(item) {
    if (checks[item.id]) return
    setإنجازs(prev => ({ ...prev, [item.id]: true }))
    if (item.layer === 'stability') {
      setProfile(prev => ({ ...prev, momentum: Math.min(100, prev.momentum + 4) }))
      notify('تم تأكيد الثبات')
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
    notify(`تم إنجاز: ${label}`)
  }

  function missedPrayerRecovery() {
    notify('تمت إضافة إجراء استعادة: نافلة أو لحظة هدوء ومراجعة')
    setProfile(prev => ({ ...prev, momentum: Math.max(0, prev.momentum - 8) }))
  }

  if (loading) {
    return <main className="auth-screen"><div className="auth-card"><div className="logo">A</div><h1>Ascend</h1><p>جاري تحميل النظام...</p></div></main>
  }

  if (!session) {
    return (
      <main className="auth-screen">
        {toast && <div className="toast">{toast}</div>}
        <form className="auth-card" onSubmit={signIn}>
          <div className="logo">A</div>
          <p className="kicker">نظام التشغيل الشخصي</p>
          <h1>Ascend</h1>
          <p>ابنِ مسارك المهني، انضباطك، طاقتك، وتطورك طويل المدى.</p>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button>{authMode === 'signup' ? 'إنشاء حساب' : 'دخول'}</button>
          <button type="button" className="secondary" onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}>
            {authMode === 'signup' ? 'لدي حساب بالفعل' : 'إنشاء حساب جديد'}
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
        <button className="logout" onClick={signOut}>خروج</button>
      </header>

      <nav className="nav">
        <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>الرئيسية</button>
        <button className={view === 'career' ? 'active' : ''} onClick={() => setView('career')}>المسار المهني</button>
        <button className={view === 'analytics' ? 'active' : ''} onClick={() => setView('analytics')}>الإحصائيات</button>
      </nav>

      {view === 'home' && (
        <>
          <section className="hero">
            <div><p className="kicker">حالة النظام اليوم</p><h2>{plan.mode === 'Recovery' ? 'وضع الاستعادة' : 'الرئيسية Center'}</h2><p>{plan.recommendation}</p></div>
            <div className="level-card"><span>المستوى</span><strong>{profile.level}</strong><p>{profile.phase}</p><div className="bar"><div style={{ width: `${xpPercent}%` }} /></div><small>{profile.xp}/{xpNeed} XP</small></div>
          </section>

          <section className="grid main-grid">
            <div className="card mission-card">
              <p className="kicker">المهمة الرئيسية</p><h3>{plan.mission.title}</h3><p>{plan.mission.reason}</p>
              <div className="mission-meta"><span>{plan.mission.duration}</span><span>+{plan.mission.xp} XP</span><span>{plan.mission.type}</span></div>
              <button onClick={completeMission}>إنهاء المهمة</button>
            </div>
            <div className="card"><p className="kicker">الزخم</p><h3>{momentumStatus}</h3><div className="bar big"><div style={{ width: `${profile.momentum}%` }} /></div><p className="muted">الزخم يحدد صعوبة اليوم، التوصيات، ووضع الاستعادة.</p></div>
            <div className="card daily-core">
              <p className="kicker">الأساسيات اليومية</p>
              {plan.core.map(item => (
                <div className={'core-item ' + (checks[item.id] ? 'done' : '')} key={item.id}>
                  <div><h4>{item.title}</h4><p>{item.detail}</p>{item.layer === 'stability' && <small>بدون XP · طبقة الثبات</small>}</div>
                  <button onClick={() => completeCore(item)}>{checks[item.id] ? 'تم' : 'إنجاز'}</button>
                </div>
              ))}
            </div>
            <div className="card prayer-card"><p className="kicker">الثبات الأساسي</p><h3>الصلاة ليست نقاط</h3><p>الصلاة تُعامل كطبقة إلزامية أساسية، وليست مهمة نقاط. إذا حصل تقصير، يقترح النظام إجراء استعادة لا عقوبة.</p><button className="secondary" onClick={missedPrayerRecovery}>إجراء الاستعادة</button></div>
          </section>
        </>
      )}

      {view === 'career' && (
        <section className="grid">
          <div className="card wide"><p className="kicker">الخطة المهنية — المرحلة الأولى</p><h3>الأتمتة + السكادا + أنظمة المباني الذكية</h3><p className="muted">الهدف الحالي هو بناء أساس قابل للتوظيف، مشاريع بسيطة للملف المهني، والاستعداد لمقابلات المبتدئين.</p></div>
          <div className="tracks">
            {careerTracks.map(track => (
              <div className="card track" key={track.key}><h3>{track.name}</h3><div className="bar"><div style={{ width: `${track.progress}%` }} /></div><p>التقدم: {track.progress}%</p><small>التالي: {track.next}</small></div>
            ))}
          </div>
        </section>
      )}

      {view === 'analytics' && (
        <section className="grid analytics">
          <Stat title="الانضباط" value={profile.momentum} />
          <Stat title="التركيز" value={profile.focus} />
          <Stat title="الطاقة" value={profile.energy} />
          <Stat title="القيمة المهنية" value={profile.professionalValue} />
        </section>
      )}
    </main>
  )
}

function Stat({ title, value }) {
  return <div className="card stat"><p className="kicker">{title}</p><h3>{value}%</h3><div className="bar"><div style={{ width: `${value}%` }} /></div></div>
}
