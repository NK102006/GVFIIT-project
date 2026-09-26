export type LRPair = { r: string; l: string; notes: string };
export type ValPair = { val: string; notes: string };

export function emptyLRPair(): LRPair { return { r: '', l: '', notes: '' }; }
export function emptyValPair(): ValPair { return { val: '', notes: '' }; }

export type SCAssessment = {
  id: string;
  clientId: string;
  clientName: string;
  coachName: string;
  date: string;
  time: string;
  
  // PERSONAL DETAILS
  personalName: string;
  name: string;
  contact: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  sport: string;
  proficiency: string;
  dominancy: string;
  strengthTrainingAge: string;
  conditioningAge: string;
  rhr: string;
  hrv: string;
  injuryHistory: string;
  medicalHistory: string;
  emergencyContact: string;

  // SKINFOLDS
  chestSkin: string;
  abdomenSkin: string;
  subscapulaSkin: string;
  calfSkin: string;
  thighSkin: string;
  suprailliumSkin: string;
  midaxillaSkin: string;
  tricepSkin: string;
  bodyFat: string;

  // GIRTH MEASUREMENTS
  upperArmGirth: string;
  chestGirth: string;
  hipsGirth: string;
  calfGirth: string;
  forearmGirth: string;
  waistGirth: string;
  thighGirth: string;

  // MOVEMENT PROFILE
  overheadSquat: ValPair;
  aslr: LRPair;
  shoulderMobility: LRPair;
  hkAnkleMobility: LRPair;
  rotaryStability: LRPair;
  trunkStabilityPushUp: ValPair;
  slBalance: LRPair;

  // POWER PROFILE
  broadJump: ValPair;
  verticalJump: ValPair;
  hkRotationalThrow: LRPair;
  chestPass: ValPair;
  ohThrow: ValPair;

  // SPEED & PHYSIOLOGY
  speed10m: ValPair;
  speed20m: ValPair;
  speed40m: ValPair;
  flying10m: ValPair;
  speed17_67m: ValPair;
  runA3: ValPair;
  runUpSprint: ValPair;
  speed100m: ValPair;
  shuttle275m: ValPair;
  speed1km: ValPair;
  yoyoIR1: ValPair;
  mas: ValPair;
  mss: ValPair;
  asr: ValPair;

  // STRENGTH PROFILE
  squatRM: ValPair;
  benchPressRM: ValPair;
  deadliftRM: ValPair;
  benchPullRM: ValPair;

  // MUSCLE ENDURANCE
  pushUps: ValPair;
  chinUps: ValPair;
  squats25BW: ValPair;
  slCalfRaises: LRPair;

  // PILLAR PROFILE
  plank: ValPair;
  sidePlank: LRPair;
  copenhagenPlank: LRPair;
  sorensonHold: ValPair;

  createdAt: string;
  updatedAt: string;
};

export function emptySCAssessment(): Omit<SCAssessment, 'id' | 'clientId' | 'clientName' | 'coachName' | 'createdAt' | 'updatedAt'> {
  return {
    date: '', time: '',
    personalName: '', name: '', contact: '', age: '', gender: '', height: '', weight: '',
    sport: '', proficiency: '', dominancy: '', strengthTrainingAge: '', conditioningAge: '',
    rhr: '', hrv: '', injuryHistory: '', medicalHistory: '', emergencyContact: '',
    chestSkin: '', abdomenSkin: '', subscapulaSkin: '', calfSkin: '', thighSkin: '',
    suprailliumSkin: '', midaxillaSkin: '', tricepSkin: '', bodyFat: '',
    upperArmGirth: '', chestGirth: '', hipsGirth: '', calfGirth: '', forearmGirth: '', waistGirth: '', thighGirth: '',
    
    overheadSquat: emptyValPair(), aslr: emptyLRPair(), shoulderMobility: emptyLRPair(), hkAnkleMobility: emptyLRPair(),
    rotaryStability: emptyLRPair(), trunkStabilityPushUp: emptyValPair(), slBalance: emptyLRPair(),
    
    broadJump: emptyValPair(), verticalJump: emptyValPair(), hkRotationalThrow: emptyLRPair(), chestPass: emptyValPair(), ohThrow: emptyValPair(),
    
    speed10m: emptyValPair(), speed20m: emptyValPair(), speed40m: emptyValPair(), flying10m: emptyValPair(), speed17_67m: emptyValPair(),
    runA3: emptyValPair(), runUpSprint: emptyValPair(), speed100m: emptyValPair(), shuttle275m: emptyValPair(), speed1km: emptyValPair(),
    yoyoIR1: emptyValPair(), mas: emptyValPair(), mss: emptyValPair(), asr: emptyValPair(),
    
    squatRM: emptyValPair(), benchPressRM: emptyValPair(), deadliftRM: emptyValPair(), benchPullRM: emptyValPair(),
    
    pushUps: emptyValPair(), chinUps: emptyValPair(), squats25BW: emptyValPair(), slCalfRaises: emptyLRPair(),
    
    plank: emptyValPair(), sidePlank: emptyLRPair(), copenhagenPlank: emptyLRPair(), sorensonHold: emptyValPair(),
  };
}
