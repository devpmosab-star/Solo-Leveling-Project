import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════
const RANKS = [
  { rank:"E", title:"E-Rank Hunter",        minXP:0,     color:"#6b7280", shadow:"#6b728066", bg:"#6b728011" },
  { rank:"D", title:"D-Rank Hunter",        minXP:500,   color:"#22c55e", shadow:"#22c55e66", bg:"#22c55e11" },
  { rank:"C", title:"C-Rank Hunter",        minXP:1500,  color:"#3b82f6", shadow:"#3b82f666", bg:"#3b82f611" },
  { rank:"B", title:"B-Rank Hunter",        minXP:3500,  color:"#a855f7", shadow:"#a855f766", bg:"#a855f711" },
  { rank:"A", title:"A-Rank Hunter",        minXP:7000,  color:"#f59e0b", shadow:"#f59e0b66", bg:"#f59e0b11" },
  { rank:"S", title:"Shadow Monarch",       minXP:15000, color:"#ef4444", shadow:"#ef444466", bg:"#ef444411" },
  { rank:"SS",title:"Absolute Being",       minXP:30000, color:"#c084fc", shadow:"#c084fc88", bg:"#c084fc11" },
];

const BOSSES = [
  { id:"b1", name:"Double Dungeon",     xpReq:0,    reward:200, desc:"أكمل 7 مهام يومية متتالية",       condition:"streak7",  color:"#3b82f6" },
  { id:"b2", name:"Demon Castle",       xpReq:500,  reward:400, desc:"أكمل مشروع TIA Portal كامل",      condition:"c6done",   color:"#a855f7" },
  { id:"b3", name:"Jeju Island Raid",   xpReq:1500, reward:700, desc:"احصل على Siemens Certification",   condition:"c7done",   color:"#ef4444" },
  { id:"b4", name:"Monarchs War",       xpReq:3500, reward:1200,desc:"قدّم على وظيفة واحصل على مقابلة", condition:"c8done",   color:"#f59e0b" },
  { id:"b5", name:"Architect's Trial",  xpReq:7000, reward:2000,desc:"احصل على أول وظيفة تقنية",        condition:"job1",     color:"#c084fc" },
];

const ACHIEVEMENTS = [
  { id:"ach1", title:"First Blood",        icon:"🗡️",  desc:"أكمل أول مهمة",              condition: d=>Object.values(d).filter(Boolean).length>=1 },
  { id:"ach2", title:"Arise",              icon:"💀",  desc:"أكمل 10 مهام",               condition: d=>Object.values(d).filter(Boolean).length>=10 },
  { id:"ach3", title:"Shadows Accumulate",icon:"👥",  desc:"أكمل 25 مهمة",               condition: d=>Object.values(d).filter(Boolean).length>=25 },
  { id:"ach4", title:"I alone level up",  icon:"⚔️",  desc:"أكمل 50 مهمة",               condition: d=>Object.values(d).filter(Boolean).length>=50 },
  { id:"ach5", title:"Shadow Army",       icon:"🌑",  desc:"أكمل جميع المهام اليومية يوماً",condition: d=>["c9","p1","p2","f2","e1","e2"].every(k=>d[k]) },
  { id:"ach6", title:"System Approved",   icon:"📜",  desc:"أكمل TIA Portal + Cert",      condition: d=>d["c6"]&&d["c7"] },
];

const DOMAINS = [
  {
    id:"career", label:"المسار المهني", icon:"⚡", color:"#00d4ff", darkBg:"#00d4ff08",
    quests:[
      { id:"c1",  title:"تثبيت TIA Portal",         xp:50,  type:"once",   desc:"حمّل وثبّت TIA Portal V19 + PLCSIM",              difficulty:"E" },
      { id:"c2",  title:"أول مشروع PLC",             xp:30,  type:"once",   desc:"أنشئ أول مشروع فارغ وعرّف Hardware S7-1200",       difficulty:"E" },
      { id:"c3",  title:"دائرة Start/Stop",          xp:80,  type:"once",   desc:"برمج دائرة تشغيل وإيقاف تعمل على PLCSIM",          difficulty:"E" },
      { id:"c4",  title:"Timers & Counters",         xp:100, type:"once",   desc:"برمج TON وCTU واستخدمهما في مثال واحد",            difficulty:"D" },
      { id:"c5",  title:"Function Blocks",           xp:120, type:"once",   desc:"أنشئ FB مخصص واستدعه من OB1",                      difficulty:"D" },
      { id:"c6",  title:"مشروع HMI كامل",            xp:200, type:"once",   desc:"اربط KTP700 بـ PLC مع Buttons وIndicators",        difficulty:"C" },
      { id:"c7",  title:"نظام ضخ المياه",            xp:300, type:"once",   desc:"مشروع كامل: تشغيل+حماية+Alarms+HMI على PLCSIM",   difficulty:"C" },
      { id:"c8",  title:"Siemens SCE Certification", xp:500, type:"once",   desc:"اجتز اختبار TIA Portal Basics الرسمي",             difficulty:"B" },
      { id:"c9",  title:"جلسة تعلم يومية",           xp:20,  type:"daily",  desc:"ساعتان تعلم تقني صباحاً",                          difficulty:"E" },
      { id:"c10", title:"تقديم وظيفة",               xp:80,  type:"once",   desc:"قدّم على 3 وظائف تقنية على LinkedIn أو Bayt",      difficulty:"D" },
      { id:"c11", title:"مشروع GitHub",              xp:150, type:"once",   desc:"ارفع مشروع PLC موثق على GitHub",                   difficulty:"C" },
      { id:"c12", title:"فيديو LinkedIn",            xp:120, type:"once",   desc:"سجّل فيديو يشرح مشروعك وانشره",                   difficulty:"C" },
      { id:"c13", title:"تحديث LinkedIn أسبوعي",    xp:40,  type:"weekly", desc:"أضف مهارة أو شارك محتوى تقني",                    difficulty:"E" },
      { id:"c14", title:"Analog Signals",            xp:130, type:"once",   desc:"طبّق 4-20mA scaling في TIA Portal",                difficulty:"C" },
      { id:"c15", title:"Modbus Communication",      xp:200, type:"once",   desc:"اربط جهازين عبر Modbus RTU/TCP",                   difficulty:"B" },
    ],
  },
  {
    id:"prayer", label:"الصلاة", icon:"🕌", color:"#f59e0b", darkBg:"#f59e0b08",
    quests:[
      { id:"p1", title:"الصلوات الخمس",   xp:30,  type:"daily",  desc:"أدّ الصلوات الخمس في أوقاتها", difficulty:"E" },
      { id:"p2", title:"صلاة الفجر",      xp:25,  type:"daily",  desc:"صلّ الفجر في وقته",             difficulty:"D" },
      { id:"p3", title:"السنن الرواتب",   xp:15,  type:"daily",  desc:"أدّ السنن الرواتب الاثنتي عشرة",difficulty:"E" },
      { id:"p4", title:"قيام الليل",      xp:40,  type:"daily",  desc:"صلّ ركعتين بعد منتصف الليل",    difficulty:"C" },
      { id:"p5", title:"أسبوع منتظم",     xp:180, type:"weekly", desc:"7 أيام متواصلة بلا تفويت صلاة", difficulty:"D" },
      { id:"p6", title:"شهر الانتظام",    xp:600, type:"once",   desc:"30 يوماً متواصلة بلا تفويت",    difficulty:"B" },
      { id:"p7", title:"ختم القرآن",      xp:800, type:"once",   desc:"اختم القرآن كاملاً",             difficulty:"A" },
    ],
  },
  {
    id:"fitness", label:"اللياقة", icon:"💪", color:"#22c55e", darkBg:"#22c55e08",
    quests:[
      { id:"f1", title:"أول تمرين",       xp:50,  type:"once",   desc:"أكمل أول جلسة تمرين — أي نوع",  difficulty:"E" },
      { id:"f2", title:"تمرين اليوم",     xp:25,  type:"daily",  desc:"30 دقيقة تمرين على الأقل",       difficulty:"E" },
      { id:"f3", title:"10,000 خطوة",     xp:20,  type:"daily",  desc:"امشِ 10,000 خطوة",               difficulty:"E" },
      { id:"f4", title:"50 ضغطة",         xp:150, type:"once",   desc:"50 Push-up في جلسة واحدة",       difficulty:"D" },
      { id:"f5", title:"100 ضغطة",        xp:300, type:"once",   desc:"100 Push-up في جلسة واحدة",      difficulty:"C" },
      { id:"f6", title:"تحدي 5KM",        xp:200, type:"once",   desc:"اركض 5 كيلومترات",               difficulty:"C" },
      { id:"f7", title:"تحدي 10KM",       xp:400, type:"once",   desc:"اركض 10 كيلومترات",              difficulty:"B" },
      { id:"f8", title:"أسبوع نشاط",      xp:120, type:"weekly", desc:"4 جلسات تمرين هذا الأسبوع",      difficulty:"D" },
      { id:"f9", title:"شهر اللياقة",     xp:500, type:"once",   desc:"تمرين 25 يوم من كل 30",          difficulty:"B" },
    ],
  },
  {
    id:"english", label:"الإنجليزية", icon:"🌐", color:"#a855f7", darkBg:"#a855f708",
    quests:[
      { id:"e1", title:"15 دقيقة يومياً", xp:15,  type:"daily",  desc:"Duolingo أو أي تطبيق — 15 دقيقة",       difficulty:"E" },
      { id:"e2", title:"10 مفردات تقنية", xp:20,  type:"daily",  desc:"تعلّم 10 كلمات تقنية جديدة",             difficulty:"E" },
      { id:"e3", title:"فيديو إنجليزي",   xp:25,  type:"daily",  desc:"فيديو تقني كامل بدون ترجمة",             difficulty:"D" },
      { id:"e4", title:"اكتب بالإنجليزية",xp:40,  type:"weekly", desc:"اكتب post أو تعليق تقني بالإنجليزية",    difficulty:"D" },
      { id:"e5", title:"أسبوع إنجليزي",   xp:150, type:"weekly", desc:"7 أيام ممارسة يومية متواصلة",             difficulty:"C" },
      { id:"e6", title:"podcast تقني",     xp:30,  type:"weekly", desc:"استمع لـ podcast تقني بالإنجليزية",      difficulty:"D" },
      { id:"e7", title:"مقابلة تجريبية",   xp:350, type:"once",   desc:"أجرِ مقابلة تجريبية كاملة بالإنجليزية",  difficulty:"B" },
      { id:"e8", title:"IELTS / TOEIC",    xp:600, type:"once",   desc:"احصل على شهادة IELTS أو TOEIC",          difficulty:"A" },
    ],
  },
  {
    id:"mindset", label:"العقلية", icon:"🧠", color:"#06b6d4", darkBg:"#06b6d408",
    quests:[
      { id:"m1", title:"قراءة 20 دقيقة",  xp:20,  type:"daily",  desc:"اقرأ كتاباً مفيداً 20 دقيقة",            difficulty:"E" },
      { id:"m2", title:"تدوين يومي",       xp:15,  type:"daily",  desc:"سجّل 3 أشياء أنجزتها اليوم",             difficulty:"E" },
      { id:"m3", title:"بدون سوشيال ميديا",xp:30,  type:"daily",  desc:"يوم كامل بدون تصفح عشوائي",              difficulty:"C" },
      { id:"m4", title:"ختم كتاب",         xp:200, type:"once",   desc:"أكمل قراءة كتاب تطوير ذاتي أو تقني",     difficulty:"D" },
      { id:"m5", title:"10 كتب في سنة",    xp:800, type:"once",   desc:"اقرأ 10 كتب خلال عام واحد",              difficulty:"A" },
      { id:"m6", title:"تأمل 5 دقائق",     xp:10,  type:"daily",  desc:"5 دقائق تأمل أو تفكير هادئ",             difficulty:"E" },
    ],
  },
];

const DIFF_COLOR = { E:"#6b7280", D:"#22c55e", C:"#3b82f6", B:"#a855f7", A:"#f59e0b", S:"#ef4444" };

function getRank(xp){ let r=RANKS[0]; for(const rk of RANKS){ if(xp>=rk.minXP)r=rk; } return r; }
function getNext(xp){ for(const rk of RANKS){ if(xp<rk.minXP)return rk; } return null; }
function totalXP(done){ return Object.values(done).filter(Boolean).length; }

// ══════════════════════════════════════════════════
//  PARTICLES COMPONENT
// ══════════════════════════════════════════════════
function Particles({ color }) {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      {[...Array(6)].map((_,i)=>(
        <div key={i} style={{
          position:"absolute",
          width: 2+Math.random()*3,
          height: 2+Math.random()*3,
          borderRadius:"50%",
          background: color,
          left:`${10+i*15}%`,
          top:`${20+i*10}%`,
          opacity:.3,
          animation:`float${i} ${3+i}s ease-in-out infinite`,
          boxShadow:`0 0 6px ${color}`,
        }}/>
      ))}
      <style>{`
        ${[...Array(6)].map((_,i)=>`
          @keyframes float${i}{
            0%,100%{transform:translateY(0) scale(1);opacity:.3}
            50%{transform:translateY(-${10+i*5}px) scale(1.5);opacity:.7}
          }
        `).join("")}
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════
export default function App() {
  const [xp, setXp]               = useState(0);
  const [done, setDone]           = useState({});
  const [view, setView]           = useState("home");
  const [domId, setDomId]         = useState("career");
  const [flash, setFlash]         = useState(null);
  const [newAch, setNewAch]       = useState(null);
  const [bossBeaten, setBoss]     = useState({});
  const [achDone, setAchDone]     = useState({});
  const [rankUp, setRankUp]       = useState(null);
  const prevRankRef               = useRef("E");

  const rank  = getRank(xp);
  const next  = getNext(xp);
  const xpPct = next ? Math.round(((xp-rank.minXP)/(next.minXP-rank.minXP))*100) : 100;
  const domain= DOMAINS.find(d=>d.id===domId);

  // Check rank up
  useEffect(()=>{
    if(rank.rank !== prevRankRef.current){
      setRankUp(rank);
      setTimeout(()=>setRankUp(null), 3000);
      prevRankRef.current = rank.rank;
    }
  },[rank]);

  // Check achievements
  useEffect(()=>{
    ACHIEVEMENTS.forEach(a=>{
      if(!achDone[a.id] && a.condition(done)){
        setAchDone(prev=>({...prev,[a.id]:true}));
        setNewAch(a);
        setTimeout(()=>setNewAch(null),3000);
      }
    });
  },[done]);

  function toggle(id, val){
    const already = !!done[id];
    const newDone = {...done,[id]:!already};
    setDone(newDone);
    setXp(x=>Math.max(0, x+(already?-val:val)));
    if(!already){
      setFlash(`+${val} XP`);
      setTimeout(()=>setFlash(null),1400);
    }
  }

  function beatBoss(b){
    if(bossBeaten[b.id]) return;
    setBoss(prev=>({...prev,[b.id]:true}));
    setXp(x=>x+b.reward);
    setFlash(`+${b.reward} XP — BOSS DEFEATED!`);
    setTimeout(()=>setFlash(null),2000);
  }

  const typeLabel={once:"🏆 مهام رئيسية",daily:"🔄 يومية",weekly:"📅 أسبوعية"};
  const totalDone = Object.values(done).filter(Boolean).length;
  const totalQuests = DOMAINS.reduce((a,d)=>a+d.quests.length,0);

  return(
    <div style={{minHeight:"100vh",background:"#04040a",color:"#e0e0f0",fontFamily:"'Cairo',sans-serif",direction:"rtl",position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;700;900&family=Orbitron:wght@400;700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#04040a}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#1a1a2e;border-radius:2px}
        @keyframes xpPop{
          0%{opacity:0;transform:translate(-50%,0) scale(.6)}
          30%{opacity:1;transform:translate(-50%,-30px) scale(1.2)}
          100%{opacity:0;transform:translate(-50%,-80px) scale(.9)}
        }
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rankGlow{0%,100%{opacity:.75;filter:brightness(1)}50%{opacity:1;filter:brightness(1.3)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(200vh)}}
        @keyframes portalPulse{0%,100%{box-shadow:0 0 20px var(--rc),0 0 40px var(--rc2)}50%{box-shadow:0 0 30px var(--rc),0 0 60px var(--rc2)}}
        @keyframes bgShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .fade{animation:fadeUp .35s ease forwards}
        .hov{cursor:pointer;transition:all .18s}
        .hov:hover{transform:translateY(-2px);opacity:.88}
        .qhov{cursor:pointer;transition:all .18s}
        .qhov:hover{transform:translateX(-4px)}
        .glow-btn{transition:all .2s;cursor:pointer;border:none;font-family:'Cairo',sans-serif}
        .glow-btn:hover{filter:brightness(1.2);transform:translateY(-1px)}
        .scanline{position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(0,212,255,.15),transparent);animation:scanline 6s linear infinite;pointer-events:none;z-index:1}
      `}</style>

      {/* Background grid */}
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(0,212,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.03) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none",zIndex:0}}/>
      <div className="scanline"/>

      {/* XP Flash */}
      {flash&&(
        <div style={{position:"fixed",top:"20%",left:"50%",zIndex:9999,pointerEvents:"none",
          fontFamily:"Orbitron,monospace",fontWeight:900,fontSize:flash.includes("BOSS")?22:32,
          color:flash.includes("BOSS")?"#f59e0b":"#00d4ff",
          textShadow:`0 0 30px ${flash.includes("BOSS")?"#f59e0b":"#00d4ff"}`,
          animation:"xpPop 1.6s ease forwards",whiteSpace:"nowrap"}}>{flash}</div>
      )}

      {/* Achievement popup */}
      {newAch&&(
        <div style={{position:"fixed",top:80,right:16,zIndex:9998,
          background:"linear-gradient(135deg,#0d0d1a,#1a0d2e)",
          border:"1px solid #a855f766",borderRadius:14,padding:"14px 18px",maxWidth:260,
          animation:"slideIn .4s ease forwards",boxShadow:"0 0 30px #a855f744"}}>
          <div style={{fontSize:9,color:"#a855f7",letterSpacing:3,marginBottom:6}}>ACHIEVEMENT UNLOCKED</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:28}}>{newAch.icon}</div>
            <div>
              <div style={{fontSize:13,fontWeight:900,color:"#fff"}}>{newAch.title}</div>
              <div style={{fontSize:11,color:"#888"}}>{newAch.desc}</div>
            </div>
          </div>
        </div>
      )}

      {/* Rank Up popup */}
      {rankUp&&(
        <div style={{position:"fixed",inset:0,zIndex:9997,display:"flex",alignItems:"center",justifyContent:"center",
          background:"rgba(0,0,0,.85)",pointerEvents:"none"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"Orbitron,monospace",fontSize:13,color:rankUp.color,letterSpacing:4,marginBottom:16}}>RANK UP</div>
            <div style={{fontFamily:"Orbitron,monospace",fontSize:80,fontWeight:900,color:rankUp.color,
              textShadow:`0 0 40px ${rankUp.color},0 0 80px ${rankUp.shadow}`,
              animation:"rankGlow 1s ease-in-out 3"}}>{rankUp.rank}</div>
            <div style={{fontSize:16,color:rankUp.color,marginTop:12,letterSpacing:2}}>{rankUp.title}</div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{background:"linear-gradient(180deg,#0a0a18 0%,#04040a 100%)",borderBottom:"1px solid #0d1020",padding:"16px 16px 14px",position:"relative",zIndex:10}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <div style={{fontFamily:"Orbitron,monospace",fontSize:8,color:"#00d4ff",letterSpacing:5,marginBottom:6,opacity:.8}}>
                ◈ SYSTEM MESSAGE ◈
              </div>
              <div style={{fontFamily:"Orbitron,monospace",fontSize:20,fontWeight:900,letterSpacing:2,
                background:"linear-gradient(90deg,#fff,#00d4ff,#fff)",backgroundClip:"text",WebkitBackgroundClip:"text",
                WebkitTextFillColor:"transparent",backgroundSize:"200%",animation:"bgShift 4s ease infinite"}}>
                SOLO LEVELING
              </div>
              <div style={{fontSize:11,color:"#444",marginTop:3}}>
                {totalDone} / {totalQuests} مهمة مكتملة
              </div>
            </div>

            {/* Rank Portal */}
            <div style={{"--rc":rank.color,"--rc2":rank.shadow,
              background:`radial-gradient(circle,${rank.bg} 0%,transparent 70%)`,
              border:`2px solid ${rank.color}`,borderRadius:16,
              padding:"10px 18px",textAlign:"center",position:"relative",overflow:"hidden",
              animation:"portalPulse 3s ease-in-out infinite"}}>
              <Particles color={rank.color}/>
              <div style={{fontFamily:"Orbitron,monospace",fontSize:28,fontWeight:900,color:rank.color,
                textShadow:`0 0 20px ${rank.color}`,position:"relative",zIndex:1}}>{rank.rank}</div>
              <div style={{fontSize:8,color:rank.color+"cc",letterSpacing:2,position:"relative",zIndex:1}}>{rank.title}</div>
            </div>
          </div>

          {/* XP Bar */}
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontFamily:"Orbitron,monospace",fontSize:12,color:"#00d4ff"}}>{xp.toLocaleString()} XP</span>
            {next&&<span style={{fontSize:10,color:"#333"}}>→ Rank {next.rank} : {next.minXP.toLocaleString()} XP</span>}
          </div>
          <div style={{height:8,background:"#0a0a18",borderRadius:4,overflow:"hidden",border:"1px solid #0d1020"}}>
            <div style={{height:"100%",width:`${xpPct}%`,borderRadius:4,transition:"width .7s cubic-bezier(.4,0,.2,1)",
              background:`linear-gradient(90deg,${rank.color}88,${rank.color},${rank.color}88)`,
              boxShadow:`0 0 12px ${rank.color}88`}}/>
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <div style={{background:"#06060f",borderBottom:"1px solid #0d1020",position:"sticky",top:0,zIndex:20}}>
        <div style={{maxWidth:680,margin:"0 auto",display:"flex",overflowX:"auto"}}>
          {[
            {id:"home",  l:"الرئيسية", icon:"🏠"},
            {id:"quests",l:"المهام",    icon:"⚔️"},
            {id:"bosses",l:"Boss Raids",icon:"👹"},
            {id:"ranks", l:"الرتب",     icon:"🏆"},
            {id:"ach",   l:"الإنجازات", icon:"🎖️"},
          ].map(n=>(
            <button key={n.id} onClick={()=>setView(n.id)} className="glow-btn" style={{
              flexShrink:0,padding:"11px 14px",background:"none",
              borderBottom:view===n.id?"2px solid #00d4ff":"2px solid transparent",
              color:view===n.id?"#00d4ff":"#3a3a5a",fontSize:11,
              fontWeight:view===n.id?700:400,cursor:"pointer",whiteSpace:"nowrap",
              transition:"color .2s"}}>
              {n.icon} {n.l}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{maxWidth:680,margin:"0 auto",padding:"18px 14px 100px",position:"relative",zIndex:5}}>

        {/* ════ HOME ════ */}
        {view==="home"&&(
          <div className="fade">
            {/* System notice */}
            <div style={{background:"linear-gradient(135deg,#0a0a1a,#0d0d20)",
              border:"1px solid #00d4ff22",borderRadius:14,padding:"14px 18px",marginBottom:20,
              borderRight:"3px solid #00d4ff"}}>
              <div style={{fontSize:9,color:"#00d4ff",letterSpacing:3,marginBottom:6}}>◈ SYSTEM NOTICE ◈</div>
              <div style={{fontSize:12,color:"#8888aa",lineHeight:1.8}}>
                لقد استيقظت قدراتك. المسار أمامك واضح — أكمل مهامك اليومية، واهزم البوسات، وارتقِ في الرتب.
                الـ System يراقب تقدمك.
              </div>
            </div>

            {/* Domain grid */}
            <div style={{fontSize:9,color:"#333",letterSpacing:3,marginBottom:12}}>◈ DAILY DUNGEONS ◈</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:22}}>
              {DOMAINS.map(d=>{
                const daily=d.quests.filter(q=>q.type==="daily");
                const cnt=daily.filter(q=>done[q.id]).length;
                const pct=daily.length?Math.round((cnt/daily.length)*100):0;
                const allDone=cnt===daily.length&&daily.length>0;
                return(
                  <div key={d.id} className="hov" onClick={()=>{setDomId(d.id);setView("quests")}}
                    style={{background:`linear-gradient(135deg,#0a0a18,${d.darkBg})`,
                      border:`1px solid ${allDone?d.color+"88":d.color+"22"}`,
                      borderRadius:14,padding:"16px 14px",position:"relative",overflow:"hidden",
                      boxShadow:allDone?`0 0 20px ${d.color}22`:"none"}}>
                    {allDone&&<div style={{position:"absolute",top:8,left:8,fontSize:10,color:d.color}}>✦ CLEAR</div>}
                    <div style={{fontSize:28,marginBottom:8}}>{d.icon}</div>
                    <div style={{fontSize:12,fontWeight:700,color:"#ccc",marginBottom:10}}>{d.label}</div>
                    <div style={{height:4,background:"#0a0a18",borderRadius:2,marginBottom:6,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:d.color,borderRadius:2,
                        transition:"width .5s",boxShadow:`0 0 8px ${d.color}66`}}/>
                    </div>
                    <div style={{fontSize:11,color:d.color}}>{cnt}/{daily.length} يومي</div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div style={{background:"#0a0a18",border:"1px solid #0d1020",borderRadius:16,padding:"18px 20px",marginBottom:16}}>
              <div style={{fontSize:9,color:"#333",letterSpacing:3,marginBottom:14}}>◈ HUNTER STATUS ◈</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",textAlign:"center",gap:8}}>
                {[
                  {l:"Total XP",   v:xp,       c:"#00d4ff"},
                  {l:"مكتملة",     v:totalDone, c:"#22c55e"},
                  {l:"الرتبة",     v:rank.rank, c:rank.color},
                  {l:"Boss Kills", v:Object.values(bossBeaten).filter(Boolean).length, c:"#ef4444"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"#0d0d20",borderRadius:10,padding:"12px 6px",border:"1px solid #1a1a30"}}>
                    <div style={{fontFamily:"Orbitron,monospace",fontSize:20,fontWeight:900,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:9,color:"#444",marginTop:4}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next boss teaser */}
            {(()=>{
              const nb=BOSSES.find(b=>!bossBeaten[b.id]&&xp>=b.xpReq);
              if(!nb)return null;
              return(
                <div style={{background:`linear-gradient(135deg,#0a0a18,${nb.color}11)`,
                  border:`1px solid ${nb.color}44`,borderRadius:14,padding:"14px 18px"}}>
                  <div style={{fontSize:9,color:nb.color,letterSpacing:3,marginBottom:8}}>◈ NEXT BOSS ◈</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:900,color:"#fff"}}>{nb.name}</div>
                      <div style={{fontSize:11,color:"#666",marginTop:3}}>{nb.desc}</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:"Orbitron,monospace",fontSize:16,fontWeight:900,color:nb.color}}>+{nb.reward}</div>
                      <div style={{fontSize:9,color:"#555"}}>XP Reward</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ════ QUESTS ════ */}
        {view==="quests"&&(
          <div className="fade">
            {/* Domain tabs */}
            <div style={{display:"flex",gap:8,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
              {DOMAINS.map(d=>(
                <button key={d.id} onClick={()=>setDomId(d.id)} className="glow-btn" style={{
                  flexShrink:0,padding:"7px 14px",borderRadius:20,
                  background:domId===d.id?d.color+"22":"transparent",
                  border:`1px solid ${domId===d.id?d.color:"#1a1a2e"}`,
                  color:domId===d.id?d.color:"#444",fontSize:12,transition:"all .2s"}}>
                  {d.icon} {d.label}
                </button>
              ))}
            </div>

            {/* Domain header */}
            {(()=>{
              const earned=domain.quests.filter(q=>done[q.id]).reduce((a,q)=>a+q.xp,0);
              const total=domain.quests.reduce((a,q)=>a+q.xp,0);
              const pct=Math.round((earned/total)*100);
              return(
                <div style={{background:`linear-gradient(135deg,#0a0a18,${domain.darkBg})`,
                  border:`1px solid ${domain.color}33`,borderRadius:14,padding:"16px 18px",marginBottom:18}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div>
                      <div style={{fontSize:18,marginBottom:3}}>{domain.icon} {domain.label}</div>
                      <div style={{fontSize:11,color:"#555"}}>{domain.quests.filter(q=>done[q.id]).length}/{domain.quests.length} مهمة</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontFamily:"Orbitron,monospace",fontSize:22,fontWeight:900,color:domain.color}}>{earned}</div>
                      <div style={{fontSize:9,color:"#555"}}>/ {total} XP</div>
                    </div>
                  </div>
                  <div style={{height:5,background:"#0a0a18",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:domain.color,
                      borderRadius:3,boxShadow:`0 0 8px ${domain.color}66`,transition:"width .5s"}}/>
                  </div>
                </div>
              );
            })()}

            {/* Quest groups */}
            {["once","daily","weekly"].map(type=>{
              const qs=domain.quests.filter(q=>q.type===type);
              if(!qs.length)return null;
              return(
                <div key={type} style={{marginBottom:24}}>
                  <div style={{fontSize:9,color:"#333",letterSpacing:3,marginBottom:12}}>◈ {typeLabel[type].toUpperCase()} ◈</div>
                  {qs.map(q=>{
                    const isDone=!!done[q.id];
                    const dc=DIFF_COLOR[q.difficulty]||"#6b7280";
                    return(
                      <div key={q.id} className="qhov" onClick={()=>toggle(q.id,q.xp)} style={{
                        display:"flex",alignItems:"flex-start",gap:12,
                        padding:"14px 16px",borderRadius:12,marginBottom:8,
                        background:isDone?"#0a0a14":"linear-gradient(135deg,#0c0c1c,#0a0a18)",
                        border:`1px solid ${isDone?"#0d0d20":domain.color+"33"}`,
                        opacity:isDone?.5:1,transition:"all .2s",position:"relative",overflow:"hidden"}}>
                        {/* Rune checkbox */}
                        <div style={{width:24,height:24,borderRadius:6,flexShrink:0,marginTop:1,
                          background:isDone?domain.color:"transparent",
                          border:isDone?"none":`2px solid ${domain.color}44`,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          boxShadow:isDone?`0 0 10px ${domain.color}66`:"none",transition:"all .2s"}}>
                          {isDone&&<span style={{color:"#000",fontSize:12,fontWeight:900}}>✦</span>}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                            <span style={{fontSize:13,fontWeight:700,color:isDone?"#444":"#ddd",
                              textDecoration:isDone?"line-through":"none"}}>{q.title}</span>
                            <span style={{fontSize:9,background:dc+"22",color:dc,padding:"1px 6px",borderRadius:6,
                              border:`1px solid ${dc}44`}}>{q.difficulty}</span>
                          </div>
                          <div style={{fontSize:11,color:"#555"}}>{q.desc}</div>
                        </div>
                        <div style={{fontFamily:"Orbitron,monospace",fontSize:12,fontWeight:700,
                          color:isDone?"#2a2a3a":domain.color,flexShrink:0}}>+{q.xp}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ════ BOSSES ════ */}
        {view==="bosses"&&(
          <div className="fade">
            <div style={{fontSize:9,color:"#333",letterSpacing:3,marginBottom:16}}>◈ BOSS RAIDS ◈</div>
            <div style={{background:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:14,padding:"14px 18px",marginBottom:20}}>
              <div style={{fontSize:11,color:"#555",lineHeight:1.8}}>
                اهزم البوسات بإكمال شرطهم واضغط زر الهجوم. كل Boss يعطيك XP إضافي ضخم.
              </div>
            </div>
            {BOSSES.map(b=>{
              const beaten=!!bossBeaten[b.id];
              const unlocked=xp>=b.xpReq;
              return(
                <div key={b.id} style={{
                  background:beaten?"#0a0a14":`linear-gradient(135deg,#0a0a18,${b.color}08)`,
                  border:`1px solid ${beaten?"#1a1a20":unlocked?b.color+"55":"#1a1a2e"}`,
                  borderRadius:16,padding:"18px",marginBottom:12,
                  boxShadow:beaten?"none":unlocked?`0 0 20px ${b.color}18`:"none",
                  opacity:beaten?.5:unlocked?1:.4,position:"relative",overflow:"hidden"}}>
                  {!unlocked&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)",borderRadius:16,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontFamily:"Orbitron,monospace",fontSize:11,color:"#333",letterSpacing:2}}>
                    LOCKED — {b.xpReq.toLocaleString()} XP REQUIRED
                  </div>}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div>
                      <div style={{fontSize:9,color:b.color,letterSpacing:3,marginBottom:6}}>BOSS RAID</div>
                      <div style={{fontSize:16,fontWeight:900,color:beaten?"#444":"#fff"}}>{b.name}</div>
                      <div style={{fontSize:11,color:"#555",marginTop:4}}>{b.desc}</div>
                    </div>
                    <div style={{textAlign:"center",flexShrink:0,marginRight:8}}>
                      <div style={{fontFamily:"Orbitron,monospace",fontSize:18,fontWeight:900,
                        color:beaten?"#333":b.color}}>+{b.reward}</div>
                      <div style={{fontSize:9,color:"#444"}}>XP</div>
                    </div>
                  </div>
                  {!beaten&&unlocked&&(
                    <button onClick={()=>beatBoss(b)} className="glow-btn" style={{
                      width:"100%",padding:"10px",borderRadius:10,
                      background:`linear-gradient(135deg,${b.color}22,${b.color}44)`,
                      border:`1px solid ${b.color}88`,color:b.color,
                      fontSize:12,fontWeight:700,letterSpacing:2}}>
                      ⚔️ EXECUTE RAID
                    </button>
                  )}
                  {beaten&&(
                    <div style={{textAlign:"center",fontSize:12,color:"#22c55e",letterSpacing:2}}>✦ DEFEATED ✦</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ════ RANKS ════ */}
        {view==="ranks"&&(
          <div className="fade">
            <div style={{fontSize:9,color:"#333",letterSpacing:3,marginBottom:16}}>◈ RANK SYSTEM ◈</div>
            {RANKS.map((r,i)=>{
              const unlocked=xp>=r.minXP;
              const isCurrent=getRank(xp).rank===r.rank;
              const segPct=i<RANKS.length-1
                ?Math.min(100,Math.round(Math.max(0,(xp-r.minXP)/(RANKS[i+1].minXP-r.minXP))*100)):100;
              return(
                <div key={r.rank} style={{
                  background:isCurrent?`linear-gradient(135deg,#0d0d20,${r.bg})`:"#0a0a14",
                  border:`1px solid ${isCurrent?r.color+"66":"#0d0d20"}`,
                  borderRadius:16,padding:"16px 18px",marginBottom:10,
                  boxShadow:isCurrent?`0 0 24px ${r.shadow}`:"none",
                  transition:"all .3s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:unlocked&&i<RANKS.length-1?12:0}}>
                    <div style={{width:50,height:50,borderRadius:12,flexShrink:0,
                      background:unlocked?r.bg:"#0d0d14",
                      border:`2px solid ${unlocked?r.color:"#1a1a2e"}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontFamily:"Orbitron,monospace",fontSize:18,fontWeight:900,
                      color:unlocked?r.color:"#2a2a3a",
                      boxShadow:isCurrent?`0 0 20px ${r.shadow}`:"none"}}>
                      {unlocked?r.rank:"?"}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <span style={{fontSize:14,fontWeight:700,color:unlocked?"#ccc":"#2a2a3a"}}>{r.title}</span>
                        {isCurrent&&<span style={{fontSize:8,background:r.color+"22",color:r.color,
                          padding:"2px 8px",borderRadius:8,border:`1px solid ${r.color}44`,letterSpacing:2}}>CURRENT</span>}
                        {unlocked&&!isCurrent&&<span style={{color:"#22c55e",fontSize:14}}>✦</span>}
                      </div>
                      <div style={{fontSize:10,color:"#333",fontFamily:"Orbitron,monospace"}}>
                        {r.minXP.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                  {unlocked&&i<RANKS.length-1&&(
                    <div style={{height:5,background:"#0a0a14",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${segPct}%`,background:`linear-gradient(90deg,${r.color}88,${r.color})`,
                        borderRadius:3,boxShadow:`0 0 8px ${r.color}66`,transition:"width .5s"}}/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ════ ACHIEVEMENTS ════ */}
        {view==="ach"&&(
          <div className="fade">
            <div style={{fontSize:9,color:"#333",letterSpacing:3,marginBottom:16}}>◈ ACHIEVEMENTS ◈</div>
            <div style={{background:"#0a0a18",border:"1px solid #0d1020",borderRadius:14,
              padding:"12px 16px",marginBottom:20,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:12,color:"#555"}}>مكتمل</span>
              <span style={{fontFamily:"Orbitron,monospace",fontSize:14,color:"#a855f7"}}>
                {Object.values(achDone).filter(Boolean).length} / {ACHIEVEMENTS.length}
              </span>
            </div>
            {ACHIEVEMENTS.map(a=>{
              const isUnlocked=!!achDone[a.id];
              return(
                <div key={a.id} style={{
                  background:isUnlocked?"linear-gradient(135deg,#0d0d20,#1a0d2e)":"#0a0a14",
                  border:`1px solid ${isUnlocked?"#a855f744":"#0d0d20"}`,
                  borderRadius:14,padding:"16px 18px",marginBottom:10,
                  boxShadow:isUnlocked?"0 0 20px #a855f722":"none",
                  opacity:isUnlocked?1:.4}}>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{fontSize:32,filter:isUnlocked?"none":"grayscale(1)"}}>{a.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:isUnlocked?"#fff":"#333",marginBottom:3}}>{a.title}</div>
                      <div style={{fontSize:11,color:"#555"}}>{a.desc}</div>
                    </div>
                    {isUnlocked&&<div style={{fontSize:16,color:"#a855f7"}}>✦</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
