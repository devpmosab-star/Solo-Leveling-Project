import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {})
}

const defaultProfile = {
  name: 'مصعب',
  level: 1,
  xp: 0,
  phase: 'مرحلة التأسيس',
  momentum: 55,
  focus: 50,
  energy: 50,
  professionalValue: 5,
}

const prayerTimes = {
  fajr: '04:25',
  dhuhr: '12:15',
  asr: '15:35',
  maghrib: '18:55',
  isha: '20:25',
}

const prayerLabels = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
}

const careerItems = [
  {
    id: 'industrial-electrical-basics',
    type: 'skill',
    stage: 1,
    title: 'أساسيات الكهرباء الصناعية',
    track: 'Foundation',
    weight: 8,
    guide: 'افهم الفرق بين الأحمال، القواطع، الكونتاكتور، الريليه، والحماية الأساسية.',
  },
  {
    id: 'control-components',
    type: 'skill',
    stage: 1,
    title: 'مكونات دوائر التحكم',
    track: 'Foundation',
    weight: 8,
    guide: 'تعرف على Push Buttons, Relays, Contactors, Overload, Sensors.',
  },
  {
    id: 'control-drawings',
    type: 'skill',
    stage: 1,
    title: 'قراءة مخططات التحكم الكهربائي',
    track: 'Foundation',
    weight: 12,
    guide: 'تعلم قراءة الرموز والتوصيلات ومسار الإشارة داخل لوحة التحكم.',
  },
  {
    id: 'plc-concept',
    type: 'skill',
    stage: 2,
    title: 'مفهوم PLC',
    track: 'PLC',
    weight: 8,
    guide: 'افهم لماذا نستخدم PLC وكيف يقرأ المدخلات ويتحكم بالمخرجات.',
  },
  {
    id: 'plc-io',
    type: 'skill',
    stage: 2,
    title: 'PLC Inputs / Outputs',
    track: 'PLC',
    weight: 10,
    guide: 'اربط بين الحساسات والمفاتيح كمداخل، والمحركات واللمبات كمخرجات.',
  },
  {
    id: 'ladder-logic',
    type: 'skill',
    stage: 2,
    title: 'Ladder Logic Basics',
    track: 'PLC',
    weight: 14,
    guide: 'ابدأ بمنطق Start/Stop و Seal-in circuit قبل أي شيء متقدم.',
  },
  {
    id: 'project-start-stop',
    type: 'project',
    stage: 3,
    title: 'مشروع Start / Stop Motor',
    track: 'PLC Project',
    weight: 18,
    guide: 'ابنِ أول مشروع محاكاة لمحرك يعمل ويتوقف مع حماية بسيطة.',
  },
  {
    id: 'project-tank',
    type: 'project',
    stage: 3,
    title: 'مشروع Tank Level Control',
    track: 'PLC Project',
    weight: 22,
    guide: 'نظام خزان ماء بحساس مستوى وتشغيل مضخة، ممتاز للـ Portfolio.',
  },
  {
    id: 'hmi-basics',
    type: 'skill',
    stage: 4,
    title: 'HMI / SCADA Basics',
    track: 'SCADA',
    weight: 12,
    guide: 'افهم كيف تظهر حالة النظام على شاشة مراقبة وتحكم.',
  },
  {
    id: 'scada-dashboard',
    type: 'project',
    stage: 4,
    title: 'مشروع SCADA Dashboard',
    track: 'SCADA Project',
    weight: 22,
    guide: 'صمم شاشة تعرض حالة المضخة، مستوى الخزان، والتنبيهات.',
  },
  {
    id: 'bms-overview',
    type: 'skill',
    stage: 5,
    title: 'BMS / Building Automation Overview',
    track: 'BMS',
    weight: 10,
    guide: 'افهم أنظمة المباني: HVAC, Lighting, Sensors, Energy Monitoring.',
  },
  {
    id: 'interview-prep',
    type: 'career',
    stage: 6,
    title: 'تحضير مقابلات Junior Automation',
    track: 'Career',
    weight: 18,
    guide: 'جهز شرح مشاريعك، أساسيات PLC، والمخططات، وأسئلة المقابلات.',
  },
]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function timeToMinutes(value) {
  const [h, m] = value.split(':').map(Number)
  return h * 60 + m
}

function minutesToClock(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function secondsText(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatTime(date) {
  return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date) {
  return date.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function getPrayerWindow(date) {
  const nowMinutes = date.getHours() * 60 + date.getMinutes()
  const entries = Object.entries(prayerTimes).map(([key, time]) => ({
    key,
    label: prayerLabels[key],
    minutes: timeToMinutes(time),
    time,
  }))

  let current = entries[0]
  for (const p of entries) {
    if (p.minutes <= nowMinutes) current = p
  }

  let next = entries.find(p => p.minutes > nowMinutes)
  let nextIsTomorrow = false
  if (!next) {
    next = entries[0]
    nextIsTomorrow = true
  }

  const nextDiff = nextIsTomorrow ? (24 * 60 - nowMinutes) + next.minutes : next.minutes - nowMinutes
  const currentEnds = next.minutes > current.minutes ? next.minutes : 24 * 60 + next.minutes
  const currentDiff = currentEnds - nowMinutes

  return {
    current,
    next,
    nextDiff,
    currentDiff,
    nextText: `${Math.floor(nextDiff / 60)}س ${nextDiff % 60}د`,
    currentText: `${Math.floor(currentDiff / 60)}س ${currentDiff % 60}د`,
  }
}

function getTimeState(date) {
  const h = date.getHours() + date.getMinutes() / 60
  if (h >= 2 && h < 7) return { key: 'sleep', title: 'وضع النوم', priority: 'الراحة وحماية طاقة الغد' }
  if (h >= 7 && h < 8) return { key: 'activation', title: 'تشغيل اليوم', priority: 'تهيئة الطاقة' }
  if (h >= 8 && h < 10.5) return { key: 'deep', title: 'نافذة التركيز العميق', priority: 'المهمة المهنية الرئيسية' }
  if (h >= 10.5 && h < 13) return { key: 'transition', title: 'انتقال وتجهيز', priority: 'مراجعة خفيفة واستعداد' }
  if (h >= 13 && h < 22) return { key: 'work', title: 'وضع الدوام', priority: 'حفظ الزخم بدون ضغط' }
  if (h >= 22 && h < 24) return { key: 'evening', title: 'استعادة بعد الدوام', priority: 'مراجعة خفيفة أو استعادة' }
  return { key: 'shutdown', title: 'إغلاق اليوم', priority: 'النوم وعدم فتح مهام ثقيلة' }
}

function getPhase(level) {
  if (level >= 31) return 'الأداء العالي'
  if (level >= 21) return 'النمو المهني'
  if (level >= 11) return 'الانضباط'
  return 'مرحلة التأسيس'
}

function createOrders({ timeState, readiness, careerReadiness, prayerWindow, nextCareerItem }) {
  const orders = []

  if (timeState.key === 'deep' && readiness >= 45) {
    orders.push({
      id: 'career-deep',
      title: nextCareerItem ? nextCareerItem.title : (careerReadiness < 20 ? 'تعلم أساسيات PLC: المدخلات والمخرجات' : 'تقدم في مشروع مهني بسيط'),
      duration: readiness >= 70 ? '60 دقيقة' : '35 دقيقة',
      reason: nextCareerItem ? nextCareerItem.guide : 'هذه أفضل نافذة للتقدم المهني قبل الدوام.',
      xp: readiness >= 70 ? 120 : 70,
      type: 'career',
    })
  } else if (timeState.key === 'work') {
    orders.push({
      id: 'work-maintain',
      title: 'حفظ الزخم أثناء الدوام',
      duration: '5 دقائق',
      reason: 'أنت داخل وقت العمل. لا نفتح مهام ثقيلة الآن.',
      xp: 15,
      type: 'stability',
    })
  } else if (timeState.key === 'evening') {
    orders.push({
      id: 'evening-review',
      title: 'مراجعة مهنية خفيفة',
      duration: '15 دقيقة',
      reason: 'بعد الدوام نحتاج مراجعة بسيطة لا ضغط.',
      xp: 35,
      type: 'career',
    })
  } else if (timeState.key === 'sleep' || timeState.key === 'shutdown') {
    orders.push({
      id: 'sleep-protect',
      title: 'إغلاق اليوم وتجهيز النوم',
      duration: '10 دقائق',
      reason: 'النوم الآن يحمي طاقة الغد.',
      xp: 15,
      type: 'recovery',
    })
  } else {
    orders.push({
      id: 'light-career',
      title: 'جلسة مهنية خفيفة',
      duration: '25 دقيقة',
      reason: 'حافظ على الاستمرارية بدون ضغط زائد.',
      xp: 45,
      type: 'career',
    })
  }

  if (readiness >= 55 && timeState.key !== 'work' && timeState.key !== 'sleep') {
    orders.push({
      id: 'movement',
      title: 'حركة للجسم والطاقة',
      duration: readiness >= 70 ? '20 دقيقة' : '10 دقائق',
      reason: 'الحركة ترفع الطاقة والتركيز.',
      xp: readiness >= 70 ? 45 : 20,
      type: 'fitness',
    })
  }

  if (timeState.key === 'transition' || timeState.key === 'evening') {
    orders.push({
      id: 'english',
      title: 'مراجعة إنجليزية خفيفة',
      duration: '10 دقائق',
      reason: 'اللغة جزء من الجاهزية المهنية.',
      xp: 20,
      type: 'english',
    })
  }

  orders.push({
    id: 'prayer-anchor',
    title: `محور الصلاة: ${prayerWindow.current.label}`,
    duration: 'بدون نقاط',
    reason: 'الصلاة طبقة ثبات وليست XP.',
    xp: 0,
    type: 'prayer',
  })

  return orders.slice(0, 4)
}


function isCareerItemAvailable(item, completedCareer) {
  if (item.stage === 1) return true
  const previousStageItems = careerItems.filter(x => x.stage < item.stage)
  const completedPrevious = previousStageItems.filter(x => completedCareer.includes(x.id))
  return completedPrevious.length >= Math.ceil(previousStageItems.length * 0.65)
}

function getNextCareerItem(completedCareer) {
  return careerItems.find(item => !completedCareer.includes(item.id) && isCareerItemAvailable(item, completedCareer)) || null
}


const portfolioProjects = [
  {
    id: 'portfolio-start-stop',
    title: 'PLC Start / Stop Motor',
    track: 'PLC',
    steps: ['الفكرة', 'المنطق', 'المحاكاة', 'التوثيق'],
    relatedCareer: 'project-start-stop',
  },
  {
    id: 'portfolio-tank',
    title: 'Tank Level Control',
    track: 'PLC + SCADA',
    steps: ['الفكرة', 'PLC Logic', 'SCADA Screen', 'التوثيق'],
    relatedCareer: 'project-tank',
  },
  {
    id: 'portfolio-scada',
    title: 'SCADA Dashboard',
    track: 'SCADA',
    steps: ['واجهة', 'Alarms', 'Trends', 'شرح المشروع'],
    relatedCareer: 'scada-dashboard',
  },
]

const timelineStages = [
  { id: 'foundation', title: 'Foundation', subtitle: 'كهرباء صناعية + مخططات' },
  { id: 'plc', title: 'PLC Basics', subtitle: 'IO + Ladder Logic' },
  { id: 'projects', title: 'Projects', subtitle: 'Start/Stop + Tank Control' },
  { id: 'scada', title: 'SCADA', subtitle: 'HMI + Dashboard' },
  { id: 'interview', title: 'Interview', subtitle: 'شرح المشاريع والأساسيات' },
  { id: 'job', title: 'Job Ready', subtitle: 'جاهزية أول وظيفة' },
]

function getCareerMissingItems(completedCareer) {
  return careerItems.filter(item => !completedCareer.includes(item.id)).slice(0, 6)
}

function getTimelineActiveStage(careerReadiness) {
  if (careerReadiness >= 85) return 'job'
  if (careerReadiness >= 70) return 'interview'
  if (careerReadiness >= 50) return 'scada'
  if (careerReadiness >= 30) return 'projects'
  if (careerReadiness >= 15) return 'plc'
  return 'foundation'
}

function getWeeklyReview({ completedCareer, completedOrders, readiness, careerReadiness, profile }) {
  const orderCount = Object.values(completedOrders || {}).filter(Boolean).length
  const skillCount = careerItems.filter(item => completedCareer.includes(item.id) && item.type === 'skill').length
  const projectCount = careerItems.filter(item => completedCareer.includes(item.id) && item.type === 'project').length

  return {
    title: careerReadiness >= 50 ? 'أسبوع تقدم مهني واضح' : orderCount >= 3 ? 'أسبوع بناء الزخم' : 'أسبوع تأسيس',
    orderCount,
    skillCount,
    projectCount,
    readiness,
    careerReadiness,
    level: profile.level,
    advice: careerReadiness < 30
      ? 'ركز على الأساسيات: الكهرباء الصناعية، المخططات، و PLC IO.'
      : careerReadiness < 60
        ? 'ابدأ تحويل التعلم إلى مشاريع صغيرة قابلة للعرض.'
        : 'اقتربت من مرحلة المقابلات. ركز على شرح المشاريع بثقة.',
  }
}

function getPortfolioProgress(project, completedCareer) {
  const relatedDone = completedCareer.includes(project.relatedCareer)
  if (relatedDone) return 100
  const careerReadinessBase = completedCareer.length * 8
  return Math.min(75, Math.max(0, careerReadinessBase))
}


function energyFromSleep(hours) {
  if (hours >= 8) return 95
  if (hours >= 7) return 85
  if (hours >= 6) return 70
  if (hours >= 5) return 55
  if (hours >= 4) return 38
  return 25
}

export default function App() {
  const [session, setSession] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [cloudReady, setCloudReady] = useState(false)
  const [profile, setProfile] = useState(defaultProfile)
  const [energyInput, setEnergyInput] = useState(50)
  const [sleepHours, setSleepHours] = useState(5)
  const [completedOrders, setCompletedOrders] = useState({})
  const [prayerStatus, setPrayerStatus] = useState({})
  const [completedCareer, setCompletedCareer] = useState([])
  const [toast, setToast] = useState('')
  const [now, setNow] = useState(new Date())
  const [view, setView] = useState('command')
  const [focusActive, setFocusActive] = useState(false)
  const [focusSeconds, setFocusSeconds] = useState(25 * 60)
  const [focusTask, setFocusTask] = useState('جلسة تركيز')

  const timeState = useMemo(() => getTimeState(now), [now])
  const prayerWindow = useMemo(() => getPrayerWindow(now), [now])
  const careerReadiness = useMemo(() => {
    const total = careerItems.reduce((a, x) => a + x.weight, 0)
    const done = careerItems.filter(x => completedCareer.includes(x.id)).reduce((a, x) => a + x.weight, 0)
    return Math.round((done / total) * 100)
  }, [completedCareer])
  const nextCareerItem = useMemo(() => getNextCareerItem(completedCareer), [completedCareer])
  const adjustedEnergy = energyFromSleep(sleepHours)
  const readiness = Math.round((profile.momentum + adjustedEnergy + profile.focus + profile.professionalValue) / 4)
  const missingCareerItems = useMemo(() => getCareerMissingItems(completedCareer), [completedCareer])
  const activeTimelineStage = useMemo(() => getTimelineActiveStage(careerReadiness), [careerReadiness])
  const weeklyReview = useMemo(() => getWeeklyReview({ completedCareer, completedOrders, readiness, careerReadiness, profile }), [completedCareer, completedOrders, readiness, careerReadiness, profile])
  const todayOrders = useMemo(
    () => createOrders({ timeState, readiness, careerReadiness, prayerWindow, nextCareerItem }),
    [timeState, readiness, careerReadiness, prayerWindow, nextCareerItem]
  )
  const xpNeed = 500 + profile.level * 120
  const xpPercent = Math.min(100, Math.round((profile.xp / xpNeed) * 100))

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!focusActive) return
    const timer = setInterval(() => {
      setFocusSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setFocusActive(false)
          addXP(60, focusTask)
          notify('تمت جلسة التركيز')
          return 25 * 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [focusActive, focusTask])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      setLoading(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session?.user) loadCloudData()
  }, [session])

  useEffect(() => {
    if (session?.user && cloudReady) saveCloud()
  }, [profile, energyInput, sleepHours, completedOrders, prayerStatus, completedCareer])

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(''), 2200)
  }

  async function signIn(e) {
    e.preventDefault()
    const result = authMode === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (result.error) notify(result.error.message)
    else notify(authMode === 'signup' ? 'تم إنشاء الحساب' : 'تم الدخول')
  }

  async function signOut() {
    await supabase.auth.signOut()
  }


  async function loadPrayerEvents(userId) {
    const { data, error } = await supabase
      .from('ascend_prayer_events')
      .select('prayer_key, completed')
      .eq('user_id', userId)
      .eq('prayer_date', todayKey())

    if (error) {
      console.error('Prayer load error:', error)
      return {}
    }

    const status = {}
    ;(data || []).forEach(row => {
      if (row.completed) status[row.prayer_key] = true
    })

    localStorage.setItem('ascend-prayer-status-' + todayKey(), JSON.stringify(status))
    return status
  }

  async function savePrayerEvent(userId, key, label) {
    const { error } = await supabase
      .from('ascend_prayer_events')
      .upsert({
        user_id: userId,
        prayer_date: todayKey(),
        prayer_key: key,
        prayer_label: label,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,prayer_date,prayer_key' })

    if (error) {
      console.error('Prayer save error:', error)
      notify('لم يتم حفظ الصلاة في السحابة')
      return false
    }

    return true
  }

  async function loadCloudData() {
    setCloudReady(false)
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    const prayerEventsStatus = await loadPrayerEvents(user.id)
    setPrayerStatus(prayerEventsStatus)

    let { data: cloudProfile } = await supabase.from('ascend_profiles').select('*').eq('id', user.id).maybeSingle()
    if (!cloudProfile) {
      const { data: created } = await supabase.from('ascend_profiles')
        .insert({ id: user.id, name: 'مصعب' })
        .select()
        .single()
      cloudProfile = created
    }

    if (cloudProfile) {
      setProfile({
        name: cloudProfile.name || 'مصعب',
        level: cloudProfile.level ?? 1,
        xp: cloudProfile.xp ?? 0,
        phase: cloudProfile.phase || 'مرحلة التأسيس',
        momentum: cloudProfile.momentum ?? 55,
        focus: cloudProfile.focus ?? 50,
        energy: cloudProfile.energy ?? 50,
        professionalValue: cloudProfile.professional_value ?? 5,
      })
    }

    const { data: log } = await supabase.from('ascend_daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', todayKey())
      .maybeSingle()

    if (log) {
      setEnergyInput(log.energy_input ?? 50)
      setSleepHours(Number(log.sleep_hours ?? 5))
      setCompletedOrders(log.completed_orders || {})
      // Prayer status now loads from ascend_prayer_events only.
    } else {
      await supabase.from('ascend_daily_logs').insert({
        user_id: user.id,
        log_date: todayKey(),
        energy_input: 50,
        sleep_hours: 5,
        readiness: 50,
        current_prayer: prayerWindow.current.key,
        orders: todayOrders,
        completed_orders: {},
        prayer_status: {},
        daily_state: timeState.key,
      })
    }

    const { data: career } = await supabase.from('ascend_career_progress').select('item_id').eq('user_id', user.id)
    setCompletedCareer((career || []).map(x => x.item_id))
    setCloudReady(true)
  }

  async function saveCloud() {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    await supabase.from('ascend_profiles').upsert({
      id: user.id,
      name: profile.name,
      level: profile.level,
      xp: profile.xp,
      phase: profile.phase,
      momentum: profile.momentum,
      focus: profile.focus,
      energy: profile.energy,
      professional_value: profile.professionalValue,
      updated_at: new Date().toISOString(),
    })

    await supabase.from('ascend_daily_logs').upsert({
      user_id: user.id,
      log_date: todayKey(),
      energy_input: energyInput,
      sleep_hours: sleepHours,
      readiness,
      current_prayer: prayerWindow.current.key,
      prayer_status: prayerStatus,
      orders: todayOrders,
      completed_orders: completedOrders,
      daily_state: timeState.key,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,log_date' })
  }

  function addXP(amount, label) {
    if (!amount) return
    setProfile(prev => {
      let xp = prev.xp + amount
      let level = prev.level
      let need = 500 + level * 120
      let momentum = Math.min(100, prev.momentum + 5)
      let focus = Math.min(100, prev.focus + 2)
      let professionalValue = Math.min(100, prev.professionalValue + (label.includes('PLC') || label.includes('مهني') ? 2 : 1))

      while (xp >= need) {
        xp -= need
        level += 1
        need = 500 + level * 120
        momentum = Math.min(100, momentum + 8)
      }

      return {
        ...prev,
        xp,
        level,
        phase: getPhase(level),
        momentum,
        focus,
        professionalValue,
      }
    })
  }

  function completeOrder(order) {
    if (completedOrders[order.id]) return
    setCompletedOrders(prev => ({ ...prev, [order.id]: true }))
    if (order.type !== 'prayer') {
      addXP(order.xp, order.title)
      notify(`تم تنفيذ الأمر: ${order.title}`)
    } else {
      confirmCurrentPrayer()
    }
  }

  async function confirmCurrentPrayer() {
    const key = prayerWindow.current.key
    const label = prayerWindow.current.label

    const nextPrayerStatus = { ...(prayerStatus || {}), [key]: true }

    setPrayerStatus(nextPrayerStatus)
    localStorage.setItem('ascend-prayer-status-' + todayKey(), JSON.stringify(nextPrayerStatus))
    setProfile(prev => ({ ...prev, momentum: Math.min(100, prev.momentum + 3) }))

    const user = (await supabase.auth.getUser()).data.user
    if (user) {
      const saved = await savePrayerEvent(user.id, key, label)
      if (saved) {
        const verified = await loadPrayerEvents(user.id)
        setPrayerStatus(verified)
      }
    }

    notify(`تم تسجيل صلاة ${label}`)
  }

  function startFocus(order, minutes = 25) {
    setFocusTask(order?.title || 'جلسة تركيز')
    setFocusSeconds(minutes * 60)
    setFocusActive(true)
  }

  function stopFocus() {
    setFocusActive(false)
    setFocusSeconds(25 * 60)
  }


  async function resetTestData() {
    const ok = window.confirm('سيتم مسح تقدم التجربة والرجوع للبداية. هل أنت متأكد؟')
    if (!ok) return

    const resetProfile = {
      name: 'مصعب',
      level: 1,
      xp: 0,
      phase: 'مرحلة التأسيس',
      momentum: 55,
      focus: 50,
      energy: 50,
      professionalValue: 5,
    }

    setProfile(resetProfile)
    setEnergyInput(50)
    setSleepHours(5)
    setCompletedOrders({})
    setPrayerStatus({})
    setCompletedCareer([])
    setFocusActive(false)
    setFocusSeconds(25 * 60)

    const user = (await supabase.auth.getUser()).data.user
    if (user) {
      await supabase.from('ascend_profiles').upsert({
        id: user.id,
        name: 'مصعب',
        level: 1,
        xp: 0,
        phase: 'مرحلة التأسيس',
        momentum: 55,
        focus: 50,
        energy: 50,
        professional_value: 5,
        updated_at: new Date().toISOString(),
      })

      await supabase.from('ascend_daily_logs').upsert({
        user_id: user.id,
        log_date: todayKey(),
        energy_input: 50,
        sleep_hours: 5,
        readiness: 50,
        current_prayer: prayerWindow.current.key,
        prayer_status: {},
        orders: todayOrders,
        completed_orders: {},
        daily_state: timeState.key,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,log_date' })

      await supabase.from('ascend_career_progress').delete().eq('user_id', user.id)
      await supabase.from('ascend_prayer_events').delete().eq('user_id', user.id).eq('prayer_date', todayKey())
    }

    notify('تم تصفير بيانات التجربة')
  }

  async function enableNotifications() {
    if (!('Notification' in window)) return notify('المتصفح لا يدعم الإشعارات')
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      new Notification('Ascend', { body: 'تم تفعيل الإشعارات التجريبية.' })
      notify('تم تفعيل الإشعارات')
    } else {
      notify('لم يتم تفعيل الإشعارات')
    }
  }

  async function completeCareerItem(item) {
    if (completedCareer.includes(item.id)) return
    setCompletedCareer(prev => [...prev, item.id])
    const user = (await supabase.auth.getUser()).data.user
    if (user) await supabase.from('ascend_career_progress').insert({ user_id: user.id, item_id: item.id, item_type: item.type })
    addXP(item.type === 'project' ? 300 : 120, item.title)
    notify(`تم إنجاز: ${item.title}`)
  }

  if (loading) {
    return <main className="auth-screen"><div className="auth-card"><div className="logo">A</div><h1>Ascend</h1><p>جاري التحميل...</p></div></main>
  }

  if (!session) {
    return (
      <main className="auth-screen">
        {toast && <div className="toast">{toast}</div>}
        <form className="auth-card" onSubmit={signIn}>
          <div className="logo">A</div>
          <p className="kicker">نظام التشغيل الشخصي</p>
          <h1>Ascend</h1>
          <p>نظام يومي للتطور المهني، الصلاة، الطاقة، والتركيز.</p>
          <input placeholder="الإيميل" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} />
          <button>{authMode === 'signup' ? 'إنشاء حساب' : 'دخول'}</button>
          <button type="button" className="secondary" onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}>
            {authMode === 'signup' ? 'لدي حساب بالفعل' : 'إنشاء حساب جديد'}
          </button>
        </form>
      </main>
    )
  }

  const currentPrayerDone = prayerStatus[prayerWindow.current.key]

  return (
    <main className={'app state-' + timeState.key}>
      {toast && <div className="toast">{toast}</div>}

      {focusActive && (
        <section className="focus-overlay">
          <div className="focus-panel">
            <p className="kicker">وضع التركيز</p>
            <h2>{focusTask}</h2>
            <strong>{secondsText(focusSeconds)}</strong>
            <p>مهمة واحدة فقط. لا تنتقل لشيء آخر الآن.</p>
            <button onClick={stopFocus}>إنهاء الجلسة</button>
          </div>
        </section>
      )}

      <header className="topbar">
        <div className="brand">
          <div className="logo small">A</div>
          <div>
            <p>ASCEND V3.0</p>
            <h1>{profile.name} · {profile.phase}</h1>
          </div>
        </div>
        <div className="clock">
          <b>{formatTime(now)}</b>
          <span>{formatDate(now)}</span>
        </div>
        <div className="cloud">{cloudReady ? 'محفوظ' : 'مزامنة...'}</div>
        <button className="secondary" onClick={signOut}>خروج</button>
      </header>

      <nav className="nav">
        <button className={view === 'command' ? 'active' : ''} onClick={() => setView('command')}>اليوم</button>
        <button className={view === 'career' ? 'active' : ''} onClick={() => setView('career')}>المهنة</button>
        <button className={view === 'portfolio' ? 'active' : ''} onClick={() => setView('portfolio')}>المشاريع</button>
        <button className={view === 'review' ? 'active' : ''} onClick={() => setView('review')}>الأسبوع</button>
        <button className={view === 'debug' ? 'active' : ''} onClick={() => setView('debug')}>فحص</button>
        <button className={view === 'settings' ? 'active' : ''} onClick={() => setView('settings')}>الإعدادات</button>
      </nav>

      {view === 'command' && (
        <>
          <section className="hero">
            <div>
              <p className="kicker">حالة النظام الآن</p>
              <h2>{timeState.title}</h2>
              <p>{timeState.priority}</p>
              <div className="hero-pills">
                <span>جاهزية اليوم: {readiness}%</span><span>الطاقة من النوم: {adjustedEnergy}%</span>
                <span>الصلاة الحالية: {prayerWindow.current.label}</span>
                <span>جاهزية الوظيفة: {careerReadiness}%</span>
                <span>المستوى: {profile.level}</span>
              </div>
            </div>
            <div className="level-card">
              <span>XP</span>
              <strong>{profile.level}</strong>
              <div className="bar"><div style={{ width: `${xpPercent}%` }} /></div>
              <small>{profile.xp}/{xpNeed}</small>
            </div>
          </section>

          <section className="grid main-grid">
            <div className={'card prayer-current ' + (currentPrayerDone ? 'prayer-completed' : '')}>
              {!currentPrayerDone ? (
                <>
                  <p className="kicker">الصلاة الحالية</p>
                  <h3>{prayerWindow.current.label}</h3>
                  <p>الصلاة القادمة: {prayerWindow.next.label} بعد {prayerWindow.nextText}</p>
                  <p className="muted">ينتهي وقت {prayerWindow.current.label} بعد {prayerWindow.currentText}</p>
                  <button onClick={confirmCurrentPrayer}>تم أداء الصلاة</button>
                </>
              ) : (
                <>
                  <p className="kicker">تم تسجيل الصلاة</p>
                  <h3>{prayerWindow.current.label} ✓</h3>
                  <div className="prayer-countdown">
                    <span>الصلاة القادمة</span>
                    <b>{prayerWindow.next.label}</b>
                    <strong>{prayerWindow.nextText}</strong>
                  </div>
                  <p className="muted">لن يظهر زر الصلاة مرة أخرى حتى تدخل الصلاة التالية.</p>
                </>
              )}
            </div>

            <div className="card orders-card">
              <p className="kicker">أوامر اليوم</p>
              <h3>Ascend اختار لك التالي</h3>
              <div className="priority-order">
                <span>الأولوية الآن</span>
                <b>{todayOrders.filter(order => !(order.type === 'prayer' && currentPrayerDone))[0]?.title || 'لا توجد أوامر متبقية الآن'}</b>
                <small>{todayOrders.filter(order => !(order.type === 'prayer' && currentPrayerDone))[0]?.reason || 'حافظ على الثبات وانتظر النافذة القادمة.'}</small>
              </div>
              {todayOrders.filter(order => !(order.type === 'prayer' && currentPrayerDone)).map(order => (
                <div className={'order ' + (completedOrders[order.id] ? 'done' : '')} key={order.id}>
                  <div>
                    <b>{order.title}</b>
                    <p>{order.duration} · {order.reason}</p>
                    {order.xp > 0 && <small>+{order.xp} XP</small>}
                  </div>
                  <div className="order-actions">
                    {order.type === 'career' && <button className="secondary" onClick={() => startFocus(order, 25)}>تركيز</button>}
                    <button onClick={() => completeOrder(order)}>{completedOrders[order.id] ? 'تم' : 'تنفيذ'}</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <p className="kicker">الزخم والطاقة</p>
              <h3>{profile.momentum}%</h3>
              <div className="bar big"><div style={{ width: `${profile.momentum}%` }} /></div>
              <p className="muted">الزخم لا يعتمد على الكمال، بل على العودة والاستمرارية.</p>
            </div>

            <div className="card">
              <p className="kicker">تشغيل سريع</p>
              <button onClick={() => startFocus(todayOrders[0], 25)}>ابدأ 25 دقيقة</button>
              <button className="secondary" onClick={enableNotifications}>تفعيل الإشعارات</button>
            </div>
          </section>
        </>
      )}

      {view === 'career' && (
        <section className="grid">
          <div className="card wide">
            <p className="kicker">جاهزية Junior Automation Engineer</p>
            <h3>{careerReadiness}%</h3>
            <div className="bar big"><div style={{ width: `${careerReadiness}%` }} /></div>
            <p className="muted">الهدف: PLC + SCADA + BMS + مشاريع عملية + استعداد للمقابلات.</p>
            <div className="missing-box">
              <b>المتبقي الآن:</b>
              {missingCareerItems.map(item => (
                <span key={item.id}>☐ {item.title}</span>
              ))}
            </div>
          </div>
          <div className="roadmap">
            {[1,2,3,4,5,6].map(stage => (
              <div className="roadmap-stage" key={stage}>
                <h3>المرحلة {stage}</h3>
                <div className="card wide timeline-card-v3">
            <p className="kicker">Career Timeline</p>
            <div className="timeline-v3">
              {timelineStages.map(stage => (
                <div className={'timeline-step-v3 ' + (stage.id === activeTimelineStage ? 'active' : '')} key={stage.id}>
                  <b>{stage.title}</b>
                  <small>{stage.subtitle}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="career-grid">
                  {careerItems.filter(item => item.stage === stage).map(item => {
                    const available = isCareerItemAvailable(item, completedCareer)
                    const done = completedCareer.includes(item.id)
                    return (
                      <div className={'card career-item ' + (done ? 'done' : '') + (!available ? ' locked' : '')} key={item.id}>
                        <span>{item.track} · {item.type === 'project' ? 'مشروع' : item.type === 'career' ? 'جاهزية' : 'مهارة'}</span>
                        <h3>{item.title}</h3>
                        <p>{item.guide}</p>
                        <small>وزن الجاهزية: {item.weight}</small>
                        <button disabled={!available || done} onClick={() => completeCareerItem(item)}>
                          {done ? 'تم' : available ? 'إنجاز' : 'مقفلة'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="card wide locked-paths">
            <p className="kicker">مسارات لاحقة</p>
            <h3>مقفلة الآن لتجنب التشتت</h3>
            <div className="locked-tags">
              <span>الإنجليزية المهنية</span>
              <span>اللياقة المتقدمة</span>
              <span>الثقافة العامة</span>
              <span>التواصل والثقة</span>
              <span>مسار الشركة</span>
            </div>
          </div>
        </section>
      )}


      {view === 'portfolio' && (
        <section className="grid">
          <div className="card wide">
            <p className="kicker">Portfolio Projects</p>
            <h3>مشاريعك العملية للملف المهني</h3>
            <p className="muted">الهدف أن لا يكون التعلم نظري فقط. كل مشروع هنا يجب أن يصبح قابلًا للشرح في مقابلة.</p>
          </div>

          <div className="portfolio-grid">
            {portfolioProjects.map(project => {
              const progress = getPortfolioProgress(project, completedCareer)
              return (
                <div className="card portfolio-card" key={project.id}>
                  <span>{project.track}</span>
                  <h3>{project.title}</h3>
                  <div className="bar big"><div style={{ width: `${progress}%` }} /></div>
                  <p>التقدم: {progress}%</p>
                  <div className="project-steps">
                    {project.steps.map((step, index) => (
                      <small key={step}>{progress >= ((index + 1) / project.steps.length) * 100 ? '✓' : '☐'} {step}</small>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {view === 'review' && (
        <section className="grid review-grid">
          <div className="card wide">
            <p className="kicker">Weekly Review</p>
            <h3>{weeklyReview.title}</h3>
            <p className="muted">{weeklyReview.advice}</p>
          </div>

          <div className="card review-stat">
            <p className="kicker">أوامر منجزة</p>
            <h3>{weeklyReview.orderCount}</h3>
          </div>
          <div className="card review-stat">
            <p className="kicker">مهارات منجزة</p>
            <h3>{weeklyReview.skillCount}</h3>
          </div>
          <div className="card review-stat">
            <p className="kicker">مشاريع منجزة</p>
            <h3>{weeklyReview.projectCount}</h3>
          </div>
          <div className="card review-stat">
            <p className="kicker">جاهزية الوظيفة</p>
            <h3>{weeklyReview.careerReadiness}%</h3>
          </div>
        </section>
      )}

      {view === 'debug' && (
        <section className="grid debug-grid">
          <div className="card wide">
            <p className="kicker">Debug Center</p>
            <h3>مركز فحص النظام</h3>
            <p className="muted">هذا القسم مؤقت أثناء التطوير لمراقبة الحفظ والمزامنة.</p>
          </div>

          <div className="card">
            <p className="kicker">Cloud</p>
            <h3>{cloudReady ? 'متصل' : 'غير جاهز'}</h3>
            <p className="muted">حالة الاتصال مع Supabase.</p>
          </div>

          <div className="card">
            <p className="kicker">Prayer Table</p>
            <h3>{prayerStatus[prayerWindow.current.key] ? 'محفوظة' : 'غير مسجلة'}</h3>
            <p className="muted">الصلاة الحالية: {prayerWindow.current.label}</p>
          </div>

          <div className="card">
            <p className="kicker">Daily Orders</p>
            <h3>{Object.values(completedOrders || {}).filter(Boolean).length}</h3>
            <p className="muted">عدد أوامر اليوم المنجزة.</p>
          </div>

          <div className="card">
            <p className="kicker">Career Items</p>
            <h3>{completedCareer.length}</h3>
            <p className="muted">عدد عناصر المسار المهني المنجزة.</p>
          </div>
        </section>
      )}

      {view === 'settings' && (
        <section className="grid settings-grid">
          <div className="card">
            <p className="kicker">الطاقة المحسوبة</p>
            <h3>{adjustedEnergy}%</h3>
            <p className="muted">النظام يحسب الطاقة تلقائيًا من ساعات النوم. لا تحتاج تحديدها يدويًا.</p>
          </div>
          <div className="card">
            <p className="kicker">ساعات النوم</p>
            <h3>{sleepHours}</h3>
            <input type="range" min="0" max="10" value={sleepHours} onChange={e => setSleepHours(Number(e.target.value))} />
          </div>
          <div className="card">
            <p className="kicker">الجاهزية المحسوبة</p>
            <h3>{readiness}%</h3>
            <div className="bar big"><div style={{ width: `${readiness}%` }} /></div>
          </div>

          <div className="card">
            <p className="kicker">فحص حفظ الصلاة</p>
            <h3>{prayerStatus[prayerWindow.current.key] ? 'محفوظة' : 'غير مسجلة'}</h3>
            <p className="muted">الحفظ الآن يتم في جدول مستقل: ascend_prayer_events.</p>
          </div>

          <div className="card danger-card">
            <p className="kicker">وضع التجربة</p>
            <h3>Reset</h3>
            <p className="muted">استخدم هذا الزر أثناء التجربة فقط لمسح التقدم والرجوع للبداية.</p>
            <button className="danger-button" onClick={resetTestData}>تصفير بيانات التجربة</button>
          </div>
        </section>
      )}
    </main>
  )
}
