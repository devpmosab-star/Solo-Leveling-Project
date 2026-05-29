export const timelineStages=[
{id:'foundation',title:'Foundation',subtitle:'كهرباء صناعية + مخططات'},
{id:'plc',title:'PLC Basics',subtitle:'IO + Ladder Logic'},
{id:'projects',title:'Projects',subtitle:'Start/Stop + Tank Control'},
{id:'scada',title:'SCADA',subtitle:'HMI + Dashboard'},
{id:'interview',title:'Interview',subtitle:'شرح المشاريع والأساسيات'},
{id:'job',title:'Job Ready',subtitle:'جاهزية أول وظيفة'}]
export function getTimelineActiveStage(r){if(r>=85)return'job';if(r>=70)return'interview';if(r>=50)return'scada';if(r>=30)return'projects';if(r>=15)return'plc';return'foundation'}
