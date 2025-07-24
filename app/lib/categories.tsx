export const CATEGORIES = [
  'SUSPENSION',
  'ENGINE',
  'BRAKES',
  'TRANSMISSION',
  'STEERING',
  'BATTERY',
  'FUEL_SYSTEM',
  'COOLING',
  'ELECTRICAL',
  'EXHAUST',
  'TIRES',
  'SENSORS',
  'UNKNOWN',
] as const

export const categoryStyles: Record<DiagnosticCategory, string> = {
  SUSPENSION: 'bg-blue-800/20 text-blue-400',
  ENGINE: 'bg-red-800/20 text-red-400',
  BRAKES: 'bg-rose-800/20 text-rose-400',
  TRANSMISSION: 'bg-indigo-800/20 text-indigo-400',
  STEERING: 'bg-cyan-800/20 text-cyan-400',
  BATTERY: 'bg-yellow-700/20 text-yellow-400',
  FUEL_SYSTEM: 'bg-orange-800/20 text-orange-400',
  COOLING: 'bg-teal-800/20 text-teal-400',
  ELECTRICAL: 'bg-violet-800/20 text-violet-400',
  EXHAUST: 'bg-gray-700/20 text-gray-300',
  TIRES: 'bg-slate-700/20 text-slate-300',
  SENSORS: 'bg-fuchsia-800/20 text-fuchsia-400',
  UNKNOWN: 'bg-neutral-700/20 text-neutral-400',
}

export const categoryLabels: Record<DiagnosticCategory, string> = {
  SUSPENSION: 'Suspension Issue',
  ENGINE: 'Engine Issue',
  BRAKES: 'Brake Issue',
  TRANSMISSION: 'Transmission Issue',
  STEERING: 'Steering Issue',
  BATTERY: 'Battery Issue',
  FUEL_SYSTEM: 'Fuel System Issue',
  COOLING: 'Cooling Issue',
  ELECTRICAL: 'Electrical Issue',
  EXHAUST: 'Exhaust Issue',
  TIRES: 'Tire/Wheel Issue',
  SENSORS: 'Sensor Issue',
  UNKNOWN: 'Unknown Issue',
}

export type DiagnosticCategory = (typeof CATEGORIES)[number]

export function isValidCategory(input: string): input is DiagnosticCategory {
  return CATEGORIES.includes(input as DiagnosticCategory)
}
