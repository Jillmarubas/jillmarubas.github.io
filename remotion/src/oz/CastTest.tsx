// A line-up of the cast at medium and wide sizes, to check proportions and costumes.
import React from 'react';
import {Shot, Plane, OZ, useTw} from './look';
import {Person, Toto, walkCycle} from './human';
import {DOROTHY, DOROTHY_BONNET, EM, HENRY, MUNCH1, OLD_WOMAN} from './cast';

export const OzCastTest: React.FC = () => {
  const t = useTw();
  return (
    <Shot cam={{x: 0, y: 0, z: 0}} bg="#E9E3D6">
      <Plane d={1000}>
        <rect x={0} y={760} width={1920} height={320} fill={OZ.dirt} />
        <Person x={200} y={900} h={660} look={HENRY} expr="stern" t={t} />
        <Person x={520} y={900} h={620} look={EM} expr="worried" t={t} shF={30} elF={70} />
        <Person x={820} y={900} h={440} look={DOROTHY} expr="smile" t={t} {...walkCycle(t)} />
        <Toto x={1000} y={900} h={90} t={t} run={1} />
        <Person x={1180} y={900} h={440} look={MUNCH1} expr="amazed" t={t} />
        <Person x={1420} y={900} h={430} look={OLD_WOMAN} expr="smile" t={t} talk={0.5} />
        {/* far away: the same rig at wide-shot size */}
        <Person x={1640} y={900} h={120} look={HENRY} t={t} {...walkCycle(t)} />
        <Person x={1720} y={900} h={110} look={EM} t={t} />
        <Person x={1790} y={900} h={80} look={DOROTHY_BONNET} t={t} />
        <Person x={1850} y={900} h={40} look={DOROTHY} t={t} />
      </Plane>
    </Shot>
  );
};

import {KansasSky, Prairie, House, Windmill, Shed, Fence, Cow, Horse, Tornado} from './kansas';
export const OzSetTest: React.FC = () => {
  const t = useTw();
  const storm = t > 1 ? 1 : 0;
  return (
    <Shot cam={{x: 0, y: 0, z: 0}}>
      <Plane d={3000}><KansasSky storm={storm} t={t} /></Plane>
      {storm > 0 && <Plane d={2400}><Tornado x={1500} y={620} w={160} h={520} t={t} /></Plane>}
      <Plane d={1600}>
        <Prairie horizon={620} t={t} wind={storm} />
        <Shed x={1250} y={640} ft={5} />
        <Cow x={1380} y={660} ft={5} t={t} />
        <Horse x={1480} y={662} ft={5} t={t} rear={storm} />
      </Plane>
      <Plane d={1000}>
        <Windmill x={1500} y={760} ft={12} t={t} />
        <Fence x0={-100} x1={2100} y={790} ft={12} y1={760} />
        <House x={300} y={820} ft={22} t={t} paint={0.3} />
        <Person x={1000} y={830} h={150} look={HENRY} t={t} expr="stern" />
        <Person x={1060} y={830} h={146} look={EM} t={t} />
        <Person x={1120} y={830} h={100} look={DOROTHY} t={t} {...walkCycle(t)} />
        <Toto x={1170} y={830} h={22} t={t} run={1} />
      </Plane>
    </Shot>
  );
};
