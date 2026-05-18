import { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'

const defaultQuests = [
  { title: 'تمرين 20 دقيقة', type: 'Daily', rank: 'C', xp: 90, coins: 30, done: false },
  { title: 'مذاكرة 45 دقيقة', type: 'Daily', rank: 'B', xp: 130, coins: 45, done: false },
  { title: 'شرب 2 لتر ماء', type: 'Daily', rank: 'E', xp: 50, coins: 15, done: false },
  { title: 'إنجاز أهم مهمة اليوم', type: 'Main', rank: 'A', xp: 220, coins: 80, done: false },
]

const defaultSkills = [
  { name: 'Shadow Step', category: 'Agility', level: 1, power: 35 },
  { name: 'Iron Will', category: 'Discipline', level: 1, power: 30 },
  { name: 'Mana Focus', category: 'Intelligence', level: 1, power: 38 },
]

const shopItems = [
  { id: 1, name: 'راحة 30 دقيقة', cost: 80, type: 'Reward' },
  { id: 2, name: 'مشروب مفضل', cost: 120, type: 'Reward' },
  { id: 3, name: 'ترقية ظل', cost: 220, type: 'Upgrade' },
  { id: 4, name: 'يوم بدون عقوبة', cost: 350, type: 'Protection' },
]

const achievementsList = [
  { id: 'first_quest', title: 'First Blood', desc: 'أنجز أول مهمة' },
  { id: 'ten_quests', title: 'Quest Hunter', desc: 'أنجز 10 مهام' },
  { id: 'level_5', title: 'Rising Hunter', desc: 'وصل Level 5' },
  { id: 'rich', title: 'Coin Collector', desc: 'اجمع 1000 Coin' },
  { id: 'shadow_50', title: 'Shadow Awakening', desc: 'ارفع قوة الظل إلى 50' },
]

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('dashboard')
  const [toast, setToast] = useState('')
  const [booting, setBooting] = useState(true)
  const [levelFlash, setLevelFlash] = useState(false)
  const [xpPopup, setXpPopup] = useState(null)
  const [activeDungeon, setActiveDungeon] = useState(null)
  const [dungeonLog, setDungeonLog] = useState([])
  const [playerHp, setPlayerHp] = useState(1000)
  const [mana, setMana] = useState(300)
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Shadow Dagger', rarity: 'Epic', type: 'Weapon' },
    { id: 2, name: 'Mana Potion', rarity: 'Rare', type: 'Potion' },
    { id: 3, name: 'Knight Armor', rarity: 'Legendary', type: 'Armor' },
  ])
  const [shadowArmy, setShadowArmy] = useState([
    { id: 1, name: 'Igris', rank: 'Commander', level: 18, power: 920 },
    { id: 2, name: 'Iron', rank: 'Elite', level: 11, power: 540 },
  ])
  const [systemMessages, setSystemMessages] = useState([
    'System online. Hunter profile synchronized.',
    'Daily activity scan completed.',
    'Shadow energy level is stable.'
  ])
  const [dailyEvent, setDailyEvent] = useState(null)
  const [combo, setCombo] = useState(0)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [quests, setQuests] = useState([])
  const [skills, setSkills] = useState([])
  const [history, setHistory] = useState([])
  const [achievements, setAchievements] = useState([])
  const [questForm, setQuestForm] = useState({ title: '', type: 'Daily', rank: 'C', xp: 80, coins: 25 })
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Strength', level: 1, power: 25 })

  function notify(text) {
    setToast(text)
    setTimeout(() => setToast(''), 2300)
  }

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 3200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      if (!currentSession) {
        setProfile(null)
        setStats(null)
        setQuests([])
        setSkills([])
        setHistory([])
        setAchievements([])
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session?.user) loadCloudData(session.user)
  }, [session])

  async function signIn(e) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return notify('اكتب الإيميل وكلمة المرور')

    const action = authMode === 'signup'
      ? supabase.auth.signUp({ email, password })
      : supabase.auth.signInWithPassword({ email, password })

    const { error } = await action

    if (error) notify(error.message)
    else notify(authMode === 'signup' ? 'تم إنشاء الحساب. إذا طلب تأكيد، افتح الإيميل.' : 'تم تسجيل الدخول')
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function loadCloudData(user) {
    setLoading(true)

    let { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()

    if (!profileData) {
      const { data: createdProfile } = await supabase.from('profiles').insert({
        id: user.id,
        name: user.email?.split('@')[0] || 'Hunter',
        title: 'Shadow Monarch Candidate',
        level: 1,
        xp: 0,
        coins: 250,
        streak: 1,
        stat_points: 8
      }).select().single()

      await supabase.from('stats').insert({
        user_id: user.id,
        strength: 20,
        agility: 20,
        intelligence: 20,
        endurance: 20,
        discipline: 20,
        shadow: 10
      })

      await supabase.from('quests').insert(defaultQuests.map(q => ({ ...q, user_id: user.id })))
      await supabase.from('skills').insert(defaultSkills.map(s => ({ ...s, user_id: user.id })))

      profileData = createdProfile
    }

    const [
      statsRes,
      questsRes,
      skillsRes,
      historyRes,
      achievementsRes,
    ] = await Promise.all([
      supabase.from('stats').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('quests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('skills').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('progress_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(60),
      supabase.from('achievements').select('*').eq('user_id', user.id),
    ])

    setProfile(profileData)
    setStats(statsRes.data)
    setQuests(questsRes.data || [])
    setSkills(skillsRes.data || [])
    setHistory(historyRes.data || [])
    setAchievements((achievementsRes.data || []).map(a => a.achievement_key))
    setLoading(false)
  }

  async function updateProfile(patch) {
    const next = { ...profile, ...patch }
    setProfile(next)
    await supabase.from('profiles').update(patch).eq('id', profile.id)
  }

  async function checkAchievements(nextProfile = profile, nextStats = stats) {
    const earned = new Set(achievements)
    const completed = history.length

    if (completed >= 1) earned.add('first_quest')
    if (completed >= 10) earned.add('ten_quests')
    if (nextProfile.level >= 5) earned.add('level_5')
    if (nextProfile.coins >= 1000) earned.add('rich')
    if (nextStats?.shadow >= 50) earned.add('shadow_50')

    const newOnes = [...earned].filter(key => !achievements.includes(key))
    if (newOnes.length) {
      const rows = newOnes.map(key => ({
        user_id: session.user.id,
        achievement_key: key,
        title: achievementsList.find(a => a.id === key)?.title || key
      }))
      await supabase.from('achievements').insert(rows)
      setAchievements([...earned])
      notify('Achievement Unlocked!')
    }
  }

  async function completeQuest(q) {
    if (q.done) return

    let level = profile.level
    let xp = profile.xp + Number(q.xp)
    let coins = profile.coins + Number(q.coins)
    let statPoints = profile.stat_points
    let xpNeed = 600 + level * 120

    while (xp >= xpNeed) {
      setLevelFlash(true)
      setTimeout(() => setLevelFlash(false), 2400)
      xp -= xpNeed
      level += 1
      statPoints += 3
      xpNeed = 600 + level * 120
    }

    const updatedProfile = { ...profile, level, xp, coins, stat_points: statPoints }

    setQuests(prev => prev.map(item => item.id === q.id ? { ...item, done: true } : item))
    setProfile(updatedProfile)

    await Promise.all([
      supabase.from('quests').update({ done: true }).eq('id', q.id),
      supabase.from('profiles').update({ level, xp, coins, stat_points: statPoints }).eq('id', profile.id),
      supabase.from('progress_history').insert({
        user_id: session.user.id,
        quest_title: q.title,
        xp: q.xp,
        coins: q.coins
      })
    ])

    await refreshHistory()
    await checkAchievements(updatedProfile, stats)
    setCombo(prev => prev + 1)
    setXpPopup({ xp: q.xp, coins: q.coins, label: combo >= 2 ? 'COMBO QUEST CLEAR' : 'QUEST CLEARED' })
    setTimeout(() => setXpPopup(null), 2200)
    systemSpeak(`Quest cleared. ${q.xp} experience gained.`)
    notify(`Quest Cleared +${q.xp} XP`)
  }

  async function refreshHistory() {
    const { data } = await supabase.from('progress_history').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(60)
    setHistory(data || [])
  }

  async function addQuest(e) {
    e.preventDefault()
    if (!questForm.title.trim()) return notify('اكتب اسم المهمة')
    const row = {
      user_id: session.user.id,
      title: questForm.title,
      type: questForm.type,
      rank: questForm.rank,
      xp: Number(questForm.xp),
      coins: Number(questForm.coins),
      done: false
    }

    const { data, error } = await supabase.from('quests').insert(row).select().single()
    if (error) return notify(error.message)

    setQuests(prev => [data, ...prev])
    setQuestForm({ title: '', type: 'Daily', rank: 'C', xp: 80, coins: 25 })
    notify('تمت إضافة المهمة وحفظها بالسحابة')
  }

  async function deleteQuest(id) {
    await supabase.from('quests').delete().eq('id', id)
    setQuests(prev => prev.filter(q => q.id !== id))
  }

  async function resetDaily() {
    const dailyIds = quests.filter(q => q.type === 'Daily').map(q => q.id)
    if (!dailyIds.length) return
    await supabase.from('quests').update({ done: false }).in('id', dailyIds)
    setQuests(prev => prev.map(q => q.type === 'Daily' ? { ...q, done: false } : q))
    notify('تمت إعادة المهام اليومية')
  }

  async function addSkill(e) {
    e.preventDefault()
    if (!skillForm.name.trim()) return notify('اكتب اسم المهارة')
    const row = {
      user_id: session.user.id,
      name: skillForm.name,
      category: skillForm.category,
      level: Number(skillForm.level),
      power: Number(skillForm.power)
    }

    const { data, error } = await supabase.from('skills').insert(row).select().single()
    if (error) return notify(error.message)

    setSkills(prev => [data, ...prev])
    setSkillForm({ name: '', category: 'Strength', level: 1, power: 25 })
    notify('تمت إضافة المهارة وحفظها بالسحابة')
  }

  async function upgradeSkill(skill) {
    if (profile.coins < 75) return notify('Coins غير كافية')
    const nextSkill = {
      level: skill.level + 1,
      power: Math.min(100, skill.power + 10)
    }
    const nextProfile = { ...profile, coins: profile.coins - 75 }

    setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, ...nextSkill } : s))
    setProfile(nextProfile)

    await Promise.all([
      supabase.from('skills').update(nextSkill).eq('id', skill.id),
      supabase.from('profiles').update({ coins: nextProfile.coins }).eq('id', profile.id)
    ])
    notify('تم تطوير المهارة')
  }

  async function increaseStat(key) {
    if (profile.stat_points <= 0) return notify('لا توجد نقاط تطوير')
    const nextValue = Math.min(100, stats[key] + 5)
    const nextStats = { ...stats, [key]: nextValue }
    const nextProfile = { ...profile, stat_points: profile.stat_points - 1 }

    setStats(nextStats)
    setProfile(nextProfile)

    await Promise.all([
      supabase.from('stats').update({ [key]: nextValue }).eq('id', stats.id),
      supabase.from('profiles').update({ stat_points: nextProfile.stat_points }).eq('id', profile.id)
    ])
    await checkAchievements(nextProfile, nextStats)
  }

  async function buyItem(item) {
    if (profile.coins < item.cost) return notify('Coins غير كافية')
    const nextProfile = { ...profile, coins: profile.coins - item.cost }
    let nextStats = stats

    if (item.type === 'Upgrade') {
      nextStats = { ...stats, shadow: Math.min(100, stats.shadow + 10) }
      setStats(nextStats)
      await supabase.from('stats').update({ shadow: nextStats.shadow }).eq('id', stats.id)
    }

    setProfile(nextProfile)
    await supabase.from('profiles').update({ coins: nextProfile.coins }).eq('id', profile.id)
    await checkAchievements(nextProfile, nextStats)
    notify('تم الشراء')
  }



  function systemSpeak(text) {
    setSystemMessages(prev => [text, ...prev].slice(0, 8))
    try {
      const audio = new AudioContext()
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = 520
      gain.gain.value = 0.035
      oscillator.connect(gain)
      gain.connect(audio.destination)
      oscillator.start()
      oscillator.stop(audio.currentTime + 0.08)
    } catch {}
  }

  function generateSystemEvent() {
    const events = [
      {
        title: 'Emergency Gate Alert',
        rank: 'A',
        desc: 'A high-risk gate appeared. Clear one dungeon today for bonus rewards.',
        bonus: '+20% Dungeon XP'
      },
      {
        title: 'Discipline Trial',
        rank: 'B',
        desc: 'Complete three quests without deleting any quest to maintain hunter discipline.',
        bonus: '+1 Stat Point'
      },
      {
        title: 'Shadow Resonance',
        rank: 'S',
        desc: 'Shadow energy is unstable. Upgrade one skill or clear a boss.',
        bonus: '+Shadow Aura'
      },
      {
        title: 'Recovery Window',
        rank: 'C',
        desc: 'Complete one recovery task. Low stamina hunters receive reduced penalties.',
        bonus: '+50 Coins'
      },
    ]
    const event = events[Math.floor(Math.random() * events.length)]
    setDailyEvent(event)
    systemSpeak(`Daily event generated: ${event.title}`)
  }

  function addGeneratedQuest() {
    const ideas = [
      { title: 'Complete a focused 60-minute training block', type: 'Daily', rank: 'B', xp: 150, coins: 45 },
      { title: 'Clear one difficult personal task', type: 'Main', rank: 'A', xp: 240, coins: 90 },
      { title: 'Review your progress and plan tomorrow', type: 'Daily', rank: 'C', xp: 90, coins: 30 },
      { title: 'Do a no-distraction sprint for 30 minutes', type: 'Side', rank: 'B', xp: 130, coins: 40 },
    ]
    const q = ideas[Math.floor(Math.random() * ideas.length)]
    setQuestForm(q)
    systemSpeak('AI generated a new quest suggestion.')
    setTab('quests')
  }


  function getRank(level) {
    if (level >= 30) return 'National Level Hunter'
    if (level >= 22) return 'S-Rank'
    if (level >= 15) return 'A-Rank'
    if (level >= 10) return 'B-Rank'
    if (level >= 5) return 'C-Rank'
    if (level >= 2) return 'D-Rank'
    return 'E-Rank'
  }

  function getRankClass(level) {
    if (level >= 22) return 'rank-s'
    if (level >= 15) return 'rank-a'
    if (level >= 10) return 'rank-b'
    return 'rank-c'
  }


  function useSkill(skill) {
    if (!activeDungeon) return
    const skills = {
      'Shadow Slash': { damage: 180, mana: 40 },
      'Monarch Authority': { damage: 260, mana: 70 },
      'Dagger Rush': { damage: 130, mana: 30 },
    }

    const current = skills[skill]
    if (mana < current.mana) {
      notify('Not enough mana')
      return
    }

    setMana(prev => prev - current.mana)

    const nextHp = Math.max(0, activeDungeon.currentHp - current.damage)
    setActiveDungeon(prev => ({ ...prev, currentHp: nextHp }))
    setDungeonLog(prev => [`${skill} dealt ${current.damage} damage`, ...prev].slice(0, 8))

    if (nextHp <= 0) {
      claimDungeonReward(activeDungeon)
    }
  }

  function spawnDungeon() {
    const gates = [
      { name: 'Azure Dungeon Gate', rank: 'C', boss: 'Stone Golem', hp: 420, rewardXp: 180, rewardCoins: 70, danger: 'Moderate' },
      { name: 'Crimson Red Gate', rank: 'A', boss: 'Frost Monarch Beast', hp: 850, rewardXp: 420, rewardCoins: 160, danger: 'High' },
      { name: 'Double Dungeon', rank: 'S', boss: 'Architect Statue', hp: 1400, rewardXp: 800, rewardCoins: 320, danger: 'Extreme' },
      { name: 'Shadow Trial Gate', rank: 'B', boss: 'Elite Knight', hp: 620, rewardXp: 260, rewardCoins: 110, danger: 'Serious' },
    ]
    const gate = gates[Math.floor(Math.random() * gates.length)]
    setActiveDungeon({ ...gate, currentHp: gate.hp, createdAt: Date.now() })
    setDungeonLog(prev => [`Gate detected: ${gate.name}`, ...prev].slice(0, 6))
    notify('Dungeon Gate detected')
  }

  async function attackDungeon() {
    if (!activeDungeon || !profile) return
    const power = stats ? Object.entries(stats)
      .filter(([k]) => !['id','user_id','created_at'].includes(k))
      .reduce((a, [,b]) => a + Number(b), 0) : 100
    const damage = Math.floor(70 + Math.random() * 90 + power * 0.12)
    const nextHp = Math.max(0, activeDungeon.currentHp - damage)
    setActiveDungeon(prev => ({ ...prev, currentHp: nextHp }))
    setDungeonLog(prev => [`Attack dealt ${damage} damage`, ...prev].slice(0, 6))

    if (nextHp <= 0) {
      await claimDungeonReward(activeDungeon)
    }
  }

  async function claimDungeonReward(dungeon) {
    const bonus = profile.level >= 10 ? 1.25 : 1
    const rewardXp = Math.floor(dungeon.rewardXp * bonus)
    const rewardCoins = Math.floor(dungeon.rewardCoins * bonus)

    let level = profile.level
    let xp = profile.xp + rewardXp
    let coins = profile.coins + rewardCoins
    let statPoints = profile.stat_points
    let xpNeedLocal = 600 + level * 120

    while (xp >= xpNeedLocal) {
      setLevelFlash(true)
      setTimeout(() => setLevelFlash(false), 2400)
      xp -= xpNeedLocal
      level += 1
      statPoints += 3
      xpNeedLocal = 600 + level * 120
    }

    const updatedProfile = { ...profile, level, xp, coins, stat_points: statPoints }
    setProfile(updatedProfile)
    setXpPopup({ xp: rewardXp, coins: rewardCoins, label: 'DUNGEON CLEARED' })
    setTimeout(() => setXpPopup(null), 2200)
    setDungeonLog(prev => [`Dungeon cleared: +${rewardXp} XP +${rewardCoins} Coins`, ...prev].slice(0, 6))
    setActiveDungeon(null)

    await Promise.all([
      supabase.from('profiles').update({ level, xp, coins, stat_points: statPoints }).eq('id', profile.id),
      supabase.from('progress_history').insert({
        user_id: session.user.id,
        quest_title: `Dungeon Cleared: ${dungeon.name}`,
        xp: rewardXp,
        coins: rewardCoins
      })
    ])

    await refreshHistory()
    await checkAchievements(updatedProfile, stats)
    systemSpeak('Dungeon cleared. Reward has been archived.')
    notify('Dungeon Cleared')
  }


    const xpNeed = profile ? 600 + profile.level * 120 : 1000
  const xpPercent = profile ? Math.min(100, Math.round((profile.xp / xpNeed) * 100)) : 0
  const activeAchievements = useMemo(() => achievementsList.map(a => ({ ...a, earned: achievements.includes(a.id) })), [achievements])

  if (booting) {
    return (
      <main className="boot">
        <div className="boot-overlay"></div>
        <div className="boot-center">
          <div className="boot-ring"></div>
          <div className="boot-symbol">影</div>
          <p className="boot-system">SYSTEM INITIALIZING</p>
          <h1>Shadow Monarch Protocol</h1>
          <div className="boot-bar"><div></div></div>
        </div>
      </main>
    )
  }

  if (loading) return <main className="login"><div className="loginCard"><div className="loader"></div><h1>Loading System...</h1></div></main>

  if (!session) {
    return (
      <main className="login">
        <form className="loginCard" onSubmit={signIn}>
          <div className="mark">影</div>
          <p className="system">CLOUD HUNTER SYSTEM</p>
          <h1>Solo Leveling</h1>
          <p>{authMode === 'signup' ? 'أنشئ حساب جديد واحفظ تقدمك في Supabase.' : 'سجل دخولك بالإيميل وكلمة المرور من أي جهاز.'}</p>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button>{authMode === 'signup' ? 'Create Account' : 'Login'}</button>
          <button type="button" className="ghost full" onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}>
            {authMode === 'signup' ? 'عندي حساب بالفعل' : 'إنشاء حساب جديد'}
          </button>
          <small>بعد إنشاء الحساب، استخدم نفس الإيميل وكلمة المرور للدخول من أي جهاز.</small>
        </form>
        {toast && <div className="toast">{toast}</div>}
      </main>
    )
  }

  if (!profile || !stats) {
    return (
      <main className="login">
        <div className="loginCard">
          <div className="loader"></div>
          <h1>Loading Hunter Data...</h1>
          <p>جاري تحميل بياناتك من Supabase.</p>
          <button className="danger" onClick={signOut}>تسجيل خروج</button>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </main>
    )
  }

  return (
    <main className={"app " + (
      getRankClass(profile?.level || 1)
    )}>
      {xpPopup && (
        <div className="xp-popup">
          <span>{xpPopup.label}</span>
          <b>+{xpPopup.xp} XP</b>
          <small>+{xpPopup.coins} Coins</small>
        </div>
      )}

      {levelFlash && (
        <div className="level-overlay">
          <div className="level-core"></div>
          <div className="level-content">
            <span>LEVEL UP</span>
            <h1>{profile.level}</h1>
            <p>Hunter power has evolved.</p>
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}

      <header className="topbar">
        <div className="brand">
          <div className="sigil">影</div>
          <div>
            <p>Shadow Hunter Archive</p>
            <h1>{profile?.name}</h1>
          </div>
        </div>
        <nav>
          {[
            ['dashboard', 'الرئيسية'],
            ['quests', 'المهام'],
            ['skills', 'المهارات'],
            ['stats', 'الإحصائيات'],
            ['shop', 'المتجر'],
            ['achievements', 'الإنجازات'],
            ['history', 'السجل'],
          ].map(([id, name]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{name}</button>)}
          <button className="danger" onClick={signOut}>خروج</button>
        </nav>
      </header>

      <section className="hero">
        <div>
          <p className="system">SYSTEM MESSAGE</p>
          <h2>System Awakening Complete.</h2>
          <p>تم ربط حسابك بالنظام السحابي. كل مهمة، مهارة، وإنجاز يتم حفظه داخل Hunter Archive.</p>
          <div className="heroStats">
            <span>{getRank(profile.level)}</span><span>Level {profile.level}</span>
            <span>{profile.coins} Coins</span>
            <span>{profile.stat_points} Points</span>
            <span>{history.length} Cleared</span>
          </div>
          <div className="actions"><button onClick={resetDaily}>إعادة المهام اليومية</button></div>
        </div>
        <div className="levelCard">
          <span>LEVEL</span>
          <strong>{profile.level}</strong>
          <p>{profile.title}</p>
          <div className="xpRow"><b>{xpPercent}%</b><b>XP</b></div>
          <div className="bar"><div style={{width: `${xpPercent}%`}} /></div>
        </div>
      </section>

      <section className="system-banner">
        <div>
          <span className="banner-kicker">SYSTEM DIRECTIVE</span>
          <h3>Complete the day. Increase your rank. Do not break the streak.</h3>
        </div>
        <div className="banner-runes">
          <span>XP</span><span>RANK</span><span>GATE</span><span>SHADOW</span>
        </div>
      </section>

      {tab === 'dashboard' && <Dashboard profile={profile} stats={stats} quests={quests} history={history} achievements={activeAchievements} />}
      {tab === 'quests' && <Quests quests={quests} form={questForm} setForm={setQuestForm} addQuest={addQuest} completeQuest={completeQuest} deleteQuest={deleteQuest} />}
      {tab === 'skills' && <Skills skills={skills} form={skillForm} setForm={setSkillForm} addSkill={addSkill} upgradeSkill={upgradeSkill} />}
      {tab === 'stats' && <Stats stats={stats} points={profile.stat_points} increaseStat={increaseStat} />}
      {tab === 'dungeon' && <Dungeon activeDungeon={activeDungeon} spawnDungeon={spawnDungeon} attackDungeon={attackDungeon} dungeonLog={dungeonLog} useSkill={useSkill} playerHp={playerHp} mana={mana} />}
      {tab === 'army' && <ShadowArmy shadows={shadowArmy} />}
      {tab === 'inventory' && <Inventory inventory={inventory} />}
      {tab === 'systemai' && <SystemAI messages={systemMessages} dailyEvent={dailyEvent} generateSystemEvent={generateSystemEvent} addGeneratedQuest={addGeneratedQuest} combo={combo} />}
      {tab === 'shop' && <Shop items={shopItems} coins={profile.coins} buyItem={buyItem} />}
      {tab === 'achievements' && <Achievements achievements={activeAchievements} />}
      {tab === 'history' && <History history={history} />}
    </main>
  )
}

function Card({ title, children }) {
  return <div className="card"><h2>{title}</h2>{children}</div>
}

function Dashboard({ profile, stats, quests, history, achievements }) {
  return (
    <section className="grid dashboard">
      <Card title="Hunter Identity">
        <div className="profile">
          <div className="avatar">影</div>
          <h3>{profile.name}</h3>
          <p>{profile.title}</p>
          <div className="miniGrid">
            <span>Coins: {profile.coins}</span>
            <span>Level: {profile.level}</span>
            <span>Completed: {history.length}</span>
            <span>Achievements: {achievements.filter(a => a.earned).length}/{achievements.length}</span>
          </div>
        </div>
      </Card>
      <Card title="Dungeon Quest Board">
        <div className="list">{quests.slice(0, 5).map(q => <Quest q={q} key={q.id} />)}</div>
      </Card>
      <Card title="Dungeon Gate">
        <div className="gate"><div className="portal"></div><h3>{quests.filter(q => !q.done).length > 3 ? 'Crimson Dungeon Gate' : 'Azure Dungeon Gate'}</h3></div>
      </Card>
      <Card title="Mana Power Scan">
        <div className="rank"><h3>{stats ? Object.entries(stats).filter(([k]) => !['id','user_id','created_at'].includes(k)).reduce((a, [,b]) => a + Number(b), 0) : 0}</h3><p>Total Power</p><div className="scan"></div></div>
      </Card>
    </section>
  )
}

function Quests({ quests, form, setForm, addQuest, completeQuest, deleteQuest }) {
  return (
    <section className="grid two">
      <Card title="Create New Quest">
        <form className="form" onSubmit={addQuest}>
          <input placeholder="اسم المهمة" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option>Daily</option><option>Weekly</option><option>Main</option><option>Side</option></select>
          <select value={form.rank} onChange={e => setForm({...form, rank: e.target.value})}><option>E</option><option>D</option><option>C</option><option>B</option><option>A</option><option>S</option></select>
          <input type="number" value={form.xp} onChange={e => setForm({...form, xp: e.target.value})} />
          <input type="number" value={form.coins} onChange={e => setForm({...form, coins: e.target.value})} />
          <button>إضافة وحفظ</button>
        </form>
      </Card>
      <Card title="All Active Quests">
        <div className="list">{quests.map(q => <Quest q={q} key={q.id} actions completeQuest={completeQuest} deleteQuest={deleteQuest} />)}</div>
      </Card>
    </section>
  )
}

function Quest({ q, actions, completeQuest, deleteQuest }) {
  return (
    <div className={'quest ' + (q.done ? 'done' : '')}>
      <div><h3>{q.title}</h3><p>{q.type} · Rank {q.rank} · +{q.xp} XP · +{q.coins} Coins</p></div>
      {actions && <div className="row"><button disabled={q.done} onClick={() => completeQuest(q)}>{q.done ? 'تم' : 'إنجاز'}</button><button className="danger" onClick={() => deleteQuest(q.id)}>حذف</button></div>}
    </div>
  )
}

function Skills({ skills, form, setForm, addSkill, upgradeSkill }) {
  return (
    <section className="grid two">
      <Card title="Unlock New Skill">
        <form className="form" onSubmit={addSkill}>
          <input placeholder="اسم المهارة" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option>Strength</option><option>Agility</option><option>Intelligence</option><option>Endurance</option><option>Discipline</option><option>Shadow</option></select>
          <input type="number" value={form.level} onChange={e => setForm({...form, level: e.target.value})} />
          <input type="number" value={form.power} onChange={e => setForm({...form, power: e.target.value})} />
          <button>Unlock Skill</button>
        </form>
      </Card>
      <Card title="Shadow Skill Tree">
        <div className="cards">{skills.map(s => <div className="skill" key={s.id}><h3>{s.name}</h3><p>{s.category} · Lv.{s.level}</p><div className="bar"><div style={{width:`${s.power}%`}} /></div><button onClick={() => upgradeSkill(s)}>Upgrade -75</button></div>)}</div>
      </Card>
    </section>
  )
}

function Stats({ stats, points, increaseStat }) {
  if (!stats) return null
  const labels = {strength:'القوة', agility:'السرعة', intelligence:'الذكاء', endurance:'التحمل', discipline:'الانضباط', shadow:'قوة الظل'}
  return (
    <section className="grid">
      <Card title={`نقاط التطوير: ${points}`}>
        <div className="list">{Object.entries(labels).map(([k, label]) => <div className="stat" key={k}><div className="xpRow"><b>{label}</b><b>{stats[k]}</b></div><div className="bar"><div style={{width:`${stats[k]}%`}} /></div><button onClick={() => increaseStat(k)}>+ تطوير</button></div>)}</div>
      </Card>
    </section>
  )
}

function Shop({ items, coins, buyItem }) {
  return <section className="grid"><Card title={`Shadow Market — Coins: ${coins}`}><div className="cards">{items.map(i => <div className="item" key={i.id}><span>{i.type}</span><h3>{i.name}</h3><p>Cost: {i.cost} Coins</p><button onClick={() => buyItem(i)}>شراء</button></div>)}</div></Card></section>
}

function Achievements({ achievements }) {
  return <section className="grid"><Card title="Achievements"><div className="cards">{achievements.map(a => <div className={'achievement ' + (a.earned ? 'earned' : '')} key={a.id}><span>{a.earned ? 'UNLOCKED' : 'LOCKED'}</span><h3>{a.title}</h3><p>{a.desc}</p></div>)}</div></Card></section>
}


function Dungeon({ activeDungeon, spawnDungeon, attackDungeon, dungeonLog, useSkill, playerHp, mana }) {
  const hpPercent = activeDungeon ? Math.max(0, Math.round((activeDungeon.currentHp / activeDungeon.hp) * 100)) : 0

  return (
    <section className="grid two">
      <Card title="Dungeon Gate Scanner">
        {!activeDungeon ? (
          <div className="dungeon-empty">
            <div className="portal boss-portal"></div>
            <h3>No active gate detected</h3>
            <p>Scan the area to detect a dungeon gate and challenge the boss.</p>
            <button onClick={spawnDungeon}>Scan for Gate</button>
          </div>
        ) : (
          <div className="boss-card">
            <span className="boss-rank">Rank {activeDungeon.rank} · {activeDungeon.danger}</span>
            <h3>{activeDungeon.name}</h3>
            <p>Boss: {activeDungeon.boss}</p>
            <div className="boss-hp">
              <div className="xpRow"><b>Boss HP</b><b>{activeDungeon.currentHp}/{activeDungeon.hp}</b></div>
              <div className="bar danger-bar"><div style={{ width: `${hpPercent}%` }} /></div>
            </div>
            <div className="combat-actions">
              <button onClick={attackDungeon}>Basic Attack</button>
              <button onClick={() => useSkill('Shadow Slash')}>Shadow Slash</button>
              <button onClick={() => useSkill('Monarch Authority')}>Monarch Authority</button>
            </div>
            <div className="combat-stats">
              <span>HP {playerHp}</span>
              <span>Mana {mana}</span>
            </div>
          </div>
        )}
      </Card>

      <Card title="Dungeon Rewards + Battle Log">
        <div className="reward-grid">
          <div><span>XP Reward</span><b>{activeDungeon ? activeDungeon.rewardXp : '???'}</b></div>
          <div><span>Coins</span><b>{activeDungeon ? activeDungeon.rewardCoins : '???'}</b></div>
          <div><span>Boss</span><b>{activeDungeon ? activeDungeon.boss : 'Unknown'}</b></div>
        </div>
        <div className="logs dungeon-logs">
          {dungeonLog.length ? dungeonLog.map((l, i) => <p key={i}>› {l}</p>) : <p>› Waiting for gate detection...</p>}
        </div>
      </Card>
    </section>
  )
}



function SystemAI({ messages, dailyEvent, generateSystemEvent, addGeneratedQuest, combo }) {
  return (
    <section className="grid two">
      <Card title="System AI Core">
        <div className="ai-core">
          <div className="ai-orb">
            <span>AI</span>
          </div>
          <h3>Architect Protocol</h3>
          <p>The system can generate events, recommend quests, and track hunter behavior.</p>
          <div className="combat-actions">
            <button onClick={generateSystemEvent}>Generate Daily Event</button>
            <button onClick={addGeneratedQuest}>Suggest Quest</button>
          </div>
          <div className="combat-stats">
            <span>Combo {combo}</span>
            <span>Status Online</span>
          </div>
        </div>
      </Card>

      <Card title="Daily Event + System Messages">
        {dailyEvent ? (
          <div className="event-card">
            <span>Rank {dailyEvent.rank}</span>
            <h3>{dailyEvent.title}</h3>
            <p>{dailyEvent.desc}</p>
            <b>{dailyEvent.bonus}</b>
          </div>
        ) : (
          <div className="event-card muted-event">
            <span>NO EVENT</span>
            <h3>No daily event generated</h3>
            <p>Press Generate Daily Event to create a system challenge.</p>
          </div>
        )}

        <div className="logs ai-logs">
          {messages.map((m, i) => <p key={i}>› {m}</p>)}
        </div>
      </Card>
    </section>
  )
}

function ShadowArmy({ shadows }) {
  return (
    <section className="grid">
      <Card title="Shadow Monarch Army">
        <div className="cards">
          {shadows.map(shadow => (
            <div className="shadow-card" key={shadow.id}>
              <span>{shadow.rank}</span>
              <h3>{shadow.name}</h3>
              <p>Level {shadow.level}</p>
              <div className="bar"><div style={{ width: `${Math.min(100, shadow.power / 10)}%` }} /></div>
              <b>{shadow.power} Power</b>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}

function Inventory({ inventory }) {
  return (
    <section className="grid">
      <Card title="Hunter Inventory">
        <div className="cards">
          {inventory.map(item => (
            <div className={"inventory-item rarity-" + item.rarity.toLowerCase()} key={item.id}>
              <span>{item.rarity}</span>
              <h3>{item.name}</h3>
              <p>{item.type}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}

function History({ history }) {
  return <section className="grid"><Card title="Hunter Archive Log"><div className="logs">{history.map(h => <p key={h.id}>{new Date(h.created_at).toLocaleDateString()} — {h.quest_title} +{h.xp} XP +{h.coins} Coins</p>)}</div></Card></section>
}
