export const portfolioProjects=[
{id:'portfolio-start-stop',title:'PLC Start / Stop Motor',track:'PLC',steps:['الفكرة','المنطق','المحاكاة','التوثيق'],relatedCareer:'project-start-stop'},
{id:'portfolio-tank',title:'Tank Level Control',track:'PLC + SCADA',steps:['الفكرة','PLC Logic','SCADA Screen','التوثيق'],relatedCareer:'project-tank'},
{id:'portfolio-scada',title:'SCADA Dashboard',track:'SCADA',steps:['واجهة','Alarms','Trends','شرح المشروع'],relatedCareer:'scada-dashboard'}]
export function getPortfolioProgress(project,completedCareer){if(completedCareer.includes(project.relatedCareer))return 100;return Math.min(75,Math.max(0,completedCareer.length*8))}
