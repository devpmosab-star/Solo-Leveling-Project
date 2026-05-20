import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {})
}

const careerTracks = [
  { key: 'plc', name: 'PLC / الأتمتة', progress: 8, next: 'أساسيات المدخلات والمخرجات' },
  { key: 'scada', name: 'SCADA / واجهات المراقبة', progress: 3, next: 'تجربة شاشة SCADA' },
  { key: 'bms', name: 'BMS / أتمتة المباني', progress: 5, next: 'نظرة عامة على نظام BMS' },
]


const careerSkills = [
  { id: 'electrical-basics', title: 'أساسيات الكهرباء العملية', track: 'عام', level: 1, status: 'open', desc: 'فهم الأحمال، اللوحات، الحماية، والمخططات الأساسية.' },
  { id: 'control-drawings', title: 'مخططات التحكم الكهربائي', track: 'عام', level: 1, status: 'open', desc: 'قراءة وفهم دوائر التحكم، الرموز، والتوصيلات.' },
  { id: 'plc-io', title: 'PLC Inputs / Outputs', track: 'PLC', level: 1, status: 'open', desc: 'فهم المدخلات والمخرجات وعلاقة الحساسات والمشغلات بالـ PLC.' },
  { id: 'ladder', title: 'Ladder Logic', track: 'PLC', level: 2, status: 'locked', desc: 'بناء منطق تشغيل وإيقاف وتتابع بسيط.' },
  { id: 'timers-counters', title: 'Timers & Counters', track: 'PLC', level: 2, status: 'locked', desc: 'استخدام المؤقتات والعدادات في سيناريوهات صناعية.' },
  { id: 'hmi-basics', title: 'HMI Basics', track: 'SCADA', level: 2, status: 'locked', desc: 'تصميم شاشة تحكم بسيطة لمراقبة وتشغيل النظام.' },
  { id: 'scada-alarms', title: 'SCADA Alarms', track: 'SCADA', level: 3, status: 'locked', desc: 'فهم التنبيهات، البيانات، وشاشات المراقبة.' },
  { id: 'bms-overview', title: 'BMS Overview', track: 'BMS', level: 1, status: 'open', desc: 'فهم أنظمة المباني الذكية، HVAC، الإضاءة، والطاقة.' },
  { id: 'hvac-controls', title: 'HVAC Controls', track: 'BMS', level: 3, status: 'locked', desc: 'فهم التحكم بالتكييف والتهوية داخل المباني.' },
]

const careerProjects = [
  { id: 'p1', title: 'مشروع Start / Stop Motor', level: 1, track: 'PLC', xp: 250, status: 'open', desc: 'محاكاة تشغيل وإيقاف محرك مع حماية بسيطة.' },
  { id: 'p2', title: 'مشروع Tank Level Control', level: 2, track: 'PLC + SCADA', xp: 420, status: 'locked', desc: 'نظام خزان ماء بحساسات مستوى وتشغيل مضخة.' },
  { id: 'p3', title: 'مشروع SCADA Dashboard', level: 3, track: 'SCADA', xp: 500, status: 'locked', desc: 'واجهة مراقبة بسيطة تعرض الحالة والتنبيهات.' },
  { id: 'p4', title: 'مشروع BMS Room Control', level: 3, track: 'BMS', xp: 520, status: 'locked', desc: 'تحكم مبسط في غرفة: تكييف، إضاءة، وحساسات.' },
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

function getHour(date) {
  return date.getHours() + date.getMinutes() / 60
}

function getTimeState(date) {
  const h = getHour(date)

  if (h >= 2 && h < 5) {
    return {
      key: 'sleep',
      name: 'وضع النوم',
      focus: 'الراحة أولاً',
      advice: 'هذا وقت النوم الأساسي. لا مهام الآن إلا إذا كنت مستيقظًا للفجر.',
      intensity: 'منخفض جدًا',
    }
  }

  if (h >= 5 && h < 7) {
    return {
      key: 'fajr',
      name: 'نافذة الفجر',
      focus: 'ثبات وبداية هادئة',
      advice: 'ابدأ اليوم بهدوء. الصلاة ثم ماء وحركة خفيفة بدون ضغط.',
      intensity: 'منخفض',
    }
  }

  if (h >= 7 && h < 8) {
    return {
      key: 'activation',
      name: 'تشغيل اليوم',
      focus: 'تهيئة الطاقة',
      advice: 'جهز نفسك لبلوك التركيز. لا تبدأ بمهام كثيرة.',
      intensity: 'متوسط',
    }
  }

  if (h >= 8 && h < 10.5) {
    return {
      key: 'deep',
      name: 'نافذة التركيز العميق',
      focus: 'المهمة المهنية الرئيسية',
      advice: 'هذا أفضل وقت للتعلم المهني. أنجز مهمة PLC / SCADA / BMS الأساسية.',
      intensity: 'عالي',
    }
  }

  if (h >= 10.5 && h < 12) {
    return {
      key: 'light',
      name: 'عمل خفيف',
      focus: 'مراجعة وتنظيم',
      advice: 'استخدم هذه الفترة للإنجليزي، مراجعة خفيفة، أو تجهيز ملفات.',
      intensity: 'متوسط',
    }
  }

  if (h >= 12 && h < 13) {
    return {
      key: 'transition',
      name: 'الانتقال للدوام',
      focus: 'تجهيز واستقرار',
      advice: 'لا تضغط نفسك الآن. استعد للدوام وحافظ على الهدوء.',
      intensity: 'منخفض',
    }
  }

  if (h >= 13 && h < 22) {
    return {
      key: 'work',
      name: 'وضع الدوام',
      focus: 'حفظ الزخم',
      advice: 'أثناء الدوام لا نضع مهام ثقيلة. المطلوب فقط الثبات وعدم كسر النظام.',
      intensity: 'منخفض',
    }
  }

  if (h >= 22 && h < 24) {
    return {
      key: 'evening',
      name: 'استعادة بعد الدوام',
      focus: 'مراجعة خفيفة',
      advice: 'إذا طاقتك جيدة راجع شيئًا بسيطًا. إذا متعب، اكتفِ بالاستعادة.',
      intensity: 'منخفض إلى متوسط',
    }
  }

  return {
    key: 'shutdown',
    name: 'إغلاق اليوم',
    focus: 'تهدئة وتجهيز للنوم',
    advice: 'خفف الشاشة. لا تبدأ مهمة ثقيلة. جهز النوم حتى لا تضرب طاقة الغد.',
    intensity: 'منخفض جدًا',
  }
}

function getTimeline() {
  return [
    { time: '5:00–7:00', title: 'الفجر والثبات', type: 'stability' },
    { time: '7:00–8:00', title: 'تشغيل اليوم', type: 'activation' },
    { time: '8:00–10:30', title: 'تعلم مهني عميق', type: 'deep' },
    { time: '10:30–12:00', title: 'مراجعة خفيفة / إنجليزي', type: 'light' },
    { time: '12:00–1:00', title: 'الاستعداد للدوام', type: 'transition' },
    { time: '1:00–10:00', title: 'الدوام', type: 'work' },
    { time: '10:00–12:00', title: 'استعادة ومراجعة بسيطة', type: 'evening' },
    { time: '12:00–2:00', title: 'إغلاق اليوم والنوم', type: 'shutdown' },
  ]
}


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
function buildTodayPlan(profile, checks, timeState) {
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
  const [cloudReady, setCloudReady] = useState(false)
  const [profile, setProfile] = useState(defaultProfile)
  const [checks, setإنجازs] = useState({})
  const [toast, setToast] = useState('')
  const [now, setNow] = useState(new Date())
  const [view, setView] = useState('home')
  const [completedSkills, setCompletedSkills] = useState([])
  const [completedProjects, setCompletedProjects] = useState([])
  const [dailyReport, setDailyReport] = useState(null)
  const [energyInput, setEnergyInput] = useState(50)
  const [sleepHours, setSleepHours] = useState(5)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

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
    if (session?.user) loadCloudData(session.user)
  }, [session])

  async function loadCloudData(user) {
    setCloudReady(false)

    let { data: cloudProfile } = await supabase
      .from('ascend_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (!cloudProfile) {
      const { data: created } = await supabase
        .from('ascend_profiles')
        .insert({ id: user.id, name: user.email?.split('@')[0] || 'المتطوّر' })
        .select()
        .single()
      cloudProfile = created
    }

    if (cloudProfile) {
      setProfile({
        name: cloudProfile.name || 'المتطوّر',
        level: cloudProfile.level ?? 1,
        xp: cloudProfile.xp ?? 0,
        phase: cloudProfile.phase || 'مرحلة التأسيس',
        momentum: cloudProfile.momentum ?? 55,
        focus: cloudProfile.focus ?? 50,
        energy: cloudProfile.energy ?? 50,
        professionalValue: cloudProfile.professional_value ?? 5
      })
    }

    const today = todayKey()

    const { data: dailyLog } = await supabase
      .from('ascend_daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .maybeSingle()

    if (dailyLog) {
      setChecks(dailyLog.checks || {})
      setEnergyInput(dailyLog.energy_input ?? 50)
      setSleepHours(Number(dailyLog.sleep_hours ?? 5))
      setDailyReport(dailyLog.daily_report || null)
    } else {
      await supabase.from('ascend_daily_logs').insert({
        user_id: user.id,
        log_date: today,
        energy_input: energyInput,
        sleep_hours: sleepHours,
        readiness: 50,
        checks: {}
      })
    }

    const { data: skills } = await supabase.from('ascend_career_skills').select('skill_id').eq('user_id', user.id)
    const { data: projects } = await supabase.from('ascend_career_projects').select('project_id').eq('user_id', user.id)

    setCompletedSkills((skills || []).map(s => s.skill_id))
    setCompletedProjects((projects || []).map(p => p.project_id))
    setCloudReady(true)
  }

  async function saveProfileCloud(nextProfile) {
    if (!session?.user || !cloudReady) return
    await supabase.from('ascend_profiles').upsert({
      id: session.user.id,
      name: nextProfile.name,
      level: nextProfile.level,
      xp: nextProfile.xp,
      phase: nextProfile.phase,
      momentum: nextProfile.momentum,
      focus: nextProfile.focus,
      energy: nextProfile.energy,
      professional_value: nextProfile.professionalValue,
      updated_at: new Date().toISOString()
    })
  }

  async function saveDailyLogCloud(extra = {}) {
    if (!session?.user || !cloudReady) return
    await supabase.from('ascend_daily_logs').upsert({
      user_id: session.user.id,
      log_date: todayKey(),
      energy_input: energyInput,
      sleep_hours: sleepHours,
      readiness,
      time_state: timeState?.key,
      daily_report: dailyReport,
      checks,
      updated_at: new Date().toISOString(),
      ...extra
    }, { onConflict: 'user_id,log_date' })
  }

  useEffect(() => {
    const saved = localStorage.getItem('ascend-profile')
    const savedإنجازs = localStorage.getItem('ascend-checks-' + todayKey())
    if (saved) setProfile(JSON.parse(saved))
    if (savedإنجازs) setإنجازs(JSON.parse(savedإنجازs))
  }, [])

  useEffect(() => { localStorage.setItem('ascend-profile', JSON.stringify(profile)) }, [profile])
  useEffect(() => { localStorage.setItem('ascend-checks-' + todayKey(), JSON.stringify(checks)) }, [checks])
  useEffect(() => { localStorage.setItem('ascend-career-skills', JSON.stringify(completedSkills)) }, [completedSkills])
  useEffect(() => { localStorage.setItem('ascend-career-projects', JSON.stringify(completedProjects)) }, [completedProjects])
  useEffect(() => { localStorage.setItem('ascend-energy-input', String(energyInput)) }, [energyInput])
  useEffect(() => { localStorage.setItem('ascend-sleep-hours', String(sleepHours)) }, [sleepHours])
  useEffect(() => { saveProfileCloud(profile) }, [profile])
  useEffect(() => { saveDailyLogCloud() }, [checks, energyInput, sleepHours, dailyReport])

  const timeState = useMemo(() => getTimeState(now), [now])
  const timeline = useMemo(() => getTimeline(), [])
  const plan = useMemo(() => buildTodayPlan(profile, checks, timeState), [profile, checks, timeState])
  const xpNeed = 500 + profile.level * 120
  const xpPercent = Math.min(100, Math.round((profile.xp / xpNeed) * 100))
  const momentumStatus = getMomentumStatus(profile.momentum)
  const unlockedSkills = careerSkills.map(skill => ({
    ...skill,
    completed: completedSkills.includes(skill.id),
    available: skill.status === 'open' || profile.level >= skill.level * 3
  }))
  const unlockedProjects = careerProjects.map(project => ({
    ...project,
    completed: completedProjects.includes(project.id),
    available: project.status === 'open' || profile.level >= project.level * 4
  }))
  const careerProgressValue = Math.round(((completedSkills.length + completedProjects.length * 2) / (careerSkills.length + careerProjects.length * 2)) * 100)
  const adjustedEnergy = Math.max(0, Math.min(100, Math.round((energyInput * 0.65) + (sleepHours >= 7 ? 25 : sleepHours >= 5 ? 10 : -5))))
  const readiness = Math.round((profile.momentum + adjustedEnergy + profile.focus + profile.professionalValue) / 4)

  function notify(text) { setToast(text); setTimeout(() => setToast(''), 2200) }

  async function enableNotifications() {
    if (!('Notification' in window)) {
      notify('المتصفح لا يدعم الإشعارات')
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setNotificationsEnabled(true)
      new Notification('Ascend مفعل', { body: 'سيتم استخدام الإشعارات لاحقًا للتذكير الذكي.' })
      notify('تم تفعيل الإشعارات')
    } else {
      notify('لم يتم تفعيل الإشعارات')
    }
  }

  function sendTestNotification() {
    if (Notification.permission === 'granted') {
      new Notification('Ascend', { body: timeState.key === 'deep' ? 'نافذة التركيز العميق نشطة الآن.' : 'النظام يعمل ويتابع حالة اليوم.' })
    } else {
      notify('فعّل الإشعارات أولًا')
    }
  }

  function generateDailyReport() {
    const load = readiness >= 70 ? 'قوي' : readiness >= 45 ? 'متوسط' : 'خفيف'
    const report = {
      title: readiness >= 70 ? 'يوم مناسب للتقدم' : readiness >= 45 ? 'يوم متوازن' : 'يوم استعادة',
      load,
      summary: readiness >= 70
        ? 'طاقتك وزخمك يسمحان بمهمة مهنية قوية اليوم.'
        : readiness >= 45
          ? 'حافظ على التوازن. أنجز المهمة الأساسية بدون ضغط زائد.'
          : 'الأفضل اليوم تقليل الحمل وحماية الاستمرارية.',
      tasks: readiness >= 70
        ? ['مهمة مهنية عميقة 90 دقيقة', 'حركة 20 دقيقة', 'مراجعة إنجليزية خفيفة']
        : readiness >= 45
          ? ['مهمة مهنية 45–60 دقيقة', 'مشي 10–15 دقيقة', 'إغلاق اليوم مبكرًا']
          : ['جلسة خفيفة 25 دقيقة', 'صلاة وثبات', 'نوم واستعادة'],
    }
    setDailyReport(report)
    notify('تم توليد خطة اليوم')
  }

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

  function completeSkill(skill) {
    if (!skill.available || completedSkills.includes(skill.id)) return
    setCompletedSkills(prev => [...prev, skill.id])
    if (session?.user) supabase.from('ascend_career_skills').insert({ user_id: session.user.id, skill_id: skill.id })
    addXP(90 + skill.level * 35, skill.title)
    setProfile(prev => ({
      ...prev,
      professionalValue: Math.min(100, prev.professionalValue + 4),
      focus: Math.min(100, prev.focus + 2)
    }))
  }

  function completeProject(project) {
    if (!project.available || completedProjects.includes(project.id)) return
    setCompletedProjects(prev => [...prev, project.id])
    if (session?.user) supabase.from('ascend_career_projects').insert({ user_id: session.user.id, project_id: project.id })
    addXP(project.xp, project.title)
    setProfile(prev => ({
      ...prev,
      professionalValue: Math.min(100, prev.professionalValue + 10),
      momentum: Math.min(100, prev.momentum + 8)
    }))
  }

  function missedPrayerRecovery() {
    notify('تمت إضافة إجراء استعادة: نافلة أو لحظة هدوء ومراجعة')
    setProfile(prev => ({ ...prev, momentum: Math.max(0, prev.momentum - 8) }))
    if (session?.user) supabase.from('ascend_prayer_stability').upsert({ user_id: session.user.id, prayer_date: todayKey(), status: 'recovery', recovery_action: 'نافلة أو لحظة هدوء ومراجعة' }, { onConflict: 'user_id,prayer_date' })
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
    <main className={'app phase-' + profile.phase.toLowerCase().replaceAll(' ', '-') + ' state-' + timeState.key}>
      {toast && <div className="toast">{toast}</div>}
      <header className="topbar">
        <div className="brand"><div className="logo small">A</div><div><p>ASCEND</p><h1>{profile.phase} · Level {profile.level}</h1></div></div>
        <div className="clock"><b>{formatTime(now)}</b><span>{formatDate(now)}</span></div>
        <div className="cloud-status">{cloudReady ? "السحابة متصلة" : "جاري المزامنة"}</div><button className="logout" onClick={signOut}>خروج</button>
      </header>

      <nav className="nav">
        <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>الرئيسية</button>
        <button className={view === 'career' ? 'active' : ''} onClick={() => setView('career')}>المسار المهني</button>
        <button className={view === 'skills' ? 'active' : ''} onClick={() => setView('skills')}>المهارات والمشاريع</button>
        <button className={view === 'analytics' ? 'active' : ''} onClick={() => setView('analytics')}>الإحصائيات</button>
        <button className={view === 'settings' ? 'active' : ''} onClick={() => setView('settings')}>إعدادات اليوم</button>
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

            <div className="card timeline-card">
              <p className="kicker">خط اليوم الذكي</p>
              {timeline.map(block => (
                <div className={'timeline-item ' + (block.type === timeState.key ? 'active' : '')} key={block.type}>
                  <span>{block.time}</span>
                  <b>{block.title}</b>
                </div>
              ))}
            </div>
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

            <div className="card readiness-card">
              <p className="kicker">جاهزية اليوم</p>
              <h3>{readiness}%</h3>
              <div className="bar big"><div style={{ width: `${readiness}%` }} /></div>
              <p className="muted">تحسب من الزخم، الطاقة، التركيز، والقيمة المهنية.</p>
              <button onClick={generateDailyReport}>توليد خطة اليوم</button>
            </div>

            {dailyReport && (
              <div className="card report-card wide">
                <p className="kicker">تقرير اليوم الذكي</p>
                <h3>{dailyReport.title}</h3>
                <p>{dailyReport.summary}</p>
                <div className="mission-meta"><span>الحمل: {dailyReport.load}</span><span>حسب الوقت والطاقة</span></div>
                {dailyReport.tasks.map((task, i) => <div className="report-task" key={i}>✓ {task}</div>)}
              </div>
            )}
          </section>
        </>
      )}

      {view === 'career' && (
        <section className="grid">
          <div className="card wide"><p className="kicker">الخطة المهنية — المرحلة الأولى</p><h3>الأتمتة + السكادا + أنظمة المباني الذكية</h3><p className="muted">الهدف الحالي هو بناء أساس قابل للتوظيف، مشاريع بسيطة للملف المهني، والاستعداد لمقابلات المبتدئين.</p>
            <div className="bar big"><div style={{ width: `${careerProgressValue}%` }} /></div>
            <p className="muted">جاهزية مهنية مبدئية: {careerProgressValue}%</p>
          </div>
          <div className="tracks">
            {careerTracks.map(track => (
              <div className="card track" key={track.key}><h3>{track.name}</h3><div className="bar"><div style={{ width: `${track.progress}%` }} /></div><p>التقدم: {track.progress}%</p><small>التالي: {track.next}</small></div>
            ))}
          </div>
        </section>
      )}


      {view === 'skills' && (
        <section className="grid">
          <div className="card wide">
            <p className="kicker">شجرة المهارات المهنية</p>
            <h3>افتح المهارات بالتدرج حسب المستوى والتقدم</h3>
            <p className="muted">هذه ليست قائمة عشوائية. كل مهارة هنا تخدم هدف الدخول إلى مجال Automation / SCADA / BMS.</p>
          </div>

          <div className="skill-grid">
            {unlockedSkills.map(skill => (
              <div className={'card skill-node ' + (skill.completed ? 'completed' : '') + (!skill.available ? ' locked' : '')} key={skill.id}>
                <span>{skill.track} · Level {skill.level}</span>
                <h3>{skill.title}</h3>
                <p>{skill.desc}</p>
                <button disabled={!skill.available || skill.completed} onClick={() => completeSkill(skill)}>
                  {skill.completed ? 'تم الإتقان' : skill.available ? 'إكمال المهارة' : 'مقفلة'}
                </button>
              </div>
            ))}
          </div>

          <div className="card wide">
            <p className="kicker">المشاريع العملية</p>
            <h3>المشاريع هي أقوى دليل على جاهزيتك للمقابلات</h3>
          </div>

          <div className="skill-grid">
            {unlockedProjects.map(project => (
              <div className={'card project-node ' + (project.completed ? 'completed' : '') + (!project.available ? ' locked' : '')} key={project.id}>
                <span>{project.track} · +{project.xp} XP</span>
                <h3>{project.title}</h3>
                <p>{project.desc}</p>
                <button disabled={!project.available || project.completed} onClick={() => completeProject(project)}>
                  {project.completed ? 'تم المشروع' : project.available ? 'إنهاء المشروع' : 'مقفول'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}


      {view === 'settings' && (
        <section className="grid settings-grid">
          <div className="card wide">
            <p className="kicker">إعدادات اليوم</p>
            <h3>النظام يحتاج يعرف طاقتك ونومك حتى يعطيك يوم مناسب</h3>
            <p className="muted">هذه الإعدادات مبدئية الآن، ولاحقًا يمكن ربطها تلقائيًا بالنوم والرياضة والإشعارات.</p>
          </div>

          <div className="card control-card">
            <p className="kicker">الطاقة الحالية</p>
            <h3>{energyInput}%</h3>
            <input type="range" min="0" max="100" value={energyInput} onChange={e => setEnergyInput(Number(e.target.value))} />
            <p className="muted">اختر شعورك العام بالطاقة اليوم.</p>
          </div>

          <div className="card control-card">
            <p className="kicker">ساعات النوم</p>
            <h3>{sleepHours} ساعات</h3>
            <input type="range" min="0" max="10" value={sleepHours} onChange={e => setSleepHours(Number(e.target.value))} />
            <p className="muted">النوم يؤثر مباشرة على جاهزية اليوم.</p>
          </div>

          <div className="card control-card">
            <p className="kicker">الإشعارات</p>
            <h3>{notificationsEnabled ? 'مفعلة' : 'غير مفعلة'}</h3>
            <p className="muted">سنستخدمها لاحقًا لتذكيرك بوقت التركيز، الاستعادة، والنوم.</p>
            <div className="button-row">
              <button onClick={enableNotifications}>تفعيل الإشعارات</button>
              <button className="secondary" onClick={sendTestNotification}>تجربة إشعار</button>
            </div>
          </div>

          <div className="card control-card">
            <p className="kicker">الجاهزية المحسوبة</p>
            <h3>{readiness}%</h3>
            <div className="bar big"><div style={{ width: `${readiness}%` }} /></div>
            <p className="muted">الطاقة المعدلة: {adjustedEnergy}%</p>
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
