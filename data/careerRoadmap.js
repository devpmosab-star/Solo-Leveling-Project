export const careerItems=[
{id:'industrial-electrical-basics',type:'skill',stage:1,title:'أساسيات الكهرباء الصناعية',track:'Foundation',weight:8,guide:'افهم الفرق بين الأحمال، القواطع، الكونتاكتور، الريليه، والحماية الأساسية.'},
{id:'control-components',type:'skill',stage:1,title:'مكونات دوائر التحكم',track:'Foundation',weight:8,guide:'تعرف على Push Buttons, Relays, Contactors, Overload, Sensors.'},
{id:'control-drawings',type:'skill',stage:1,title:'قراءة مخططات التحكم الكهربائي',track:'Foundation',weight:12,guide:'تعلم قراءة الرموز والتوصيلات ومسار الإشارة داخل لوحة التحكم.'},
{id:'plc-concept',type:'skill',stage:2,title:'مفهوم PLC',track:'PLC',weight:8,guide:'افهم لماذا نستخدم PLC وكيف يقرأ المدخلات ويتحكم بالمخرجات.'},
{id:'plc-io',type:'skill',stage:2,title:'PLC Inputs / Outputs',track:'PLC',weight:10,guide:'اربط بين الحساسات والمفاتيح كمداخل، والمحركات واللمبات كمخرجات.'},
{id:'ladder-logic',type:'skill',stage:2,title:'Ladder Logic Basics',track:'PLC',weight:14,guide:'ابدأ بمنطق Start/Stop و Seal-in circuit قبل أي شيء متقدم.'},
{id:'project-start-stop',type:'project',stage:3,title:'مشروع Start / Stop Motor',track:'PLC Project',weight:18,guide:'ابنِ أول مشروع محاكاة لمحرك يعمل ويتوقف مع حماية بسيطة.'},
{id:'project-tank',type:'project',stage:3,title:'مشروع Tank Level Control',track:'PLC Project',weight:22,guide:'نظام خزان ماء بحساس مستوى وتشغيل مضخة، ممتاز للـ Portfolio.'},
{id:'hmi-basics',type:'skill',stage:4,title:'HMI / SCADA Basics',track:'SCADA',weight:12,guide:'افهم كيف تظهر حالة النظام على شاشة مراقبة وتحكم.'},
{id:'scada-dashboard',type:'project',stage:4,title:'مشروع SCADA Dashboard',track:'SCADA Project',weight:22,guide:'صمم شاشة تعرض حالة المضخة، مستوى الخزان، والتنبيهات.'},
{id:'bms-overview',type:'skill',stage:5,title:'BMS / Building Automation Overview',track:'BMS',weight:10,guide:'افهم أنظمة المباني: HVAC, Lighting, Sensors, Energy Monitoring.'},
{id:'interview-prep',type:'career',stage:6,title:'تحضير مقابلات Junior Automation',track:'Career',weight:18,guide:'جهز شرح مشاريعك، أساسيات PLC، والمخططات، وأسئلة المقابلات.'}]
export function isCareerItemAvailable(item,completedCareer){if(item.stage===1)return true;const prev=careerItems.filter(x=>x.stage<item.stage);const done=prev.filter(x=>completedCareer.includes(x.id));return done.length>=Math.ceil(prev.length*.65)}
export function getNextCareerItem(completedCareer){return careerItems.find(i=>!completedCareer.includes(i.id)&&isCareerItemAvailable(i,completedCareer))||null}
export function getCareerMissingItems(completedCareer){return careerItems.filter(i=>!completedCareer.includes(i.id)).slice(0,6)}
export function getCareerReadiness(completedCareer){const total=careerItems.reduce((a,x)=>a+x.weight,0);const done=careerItems.filter(x=>completedCareer.includes(x.id)).reduce((a,x)=>a+x.weight,0);return Math.round(done/total*100)}
