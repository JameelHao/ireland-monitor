// Preset keywords optimized for Ireland tech monitoring workflows.
export interface AlertPreset {
  label: string;
  keyword: string;
}

export const ALERT_PRESETS: AlertPreset[] = [
  { label: 'Enterprise Ireland', keyword: 'Enterprise Ireland' },
  { label: 'TCD Research', keyword: 'TCD' },
  { label: 'UCD Research', keyword: 'UCD' },
  { label: 'Funding Rounds', keyword: 'funding' },
  { label: 'Dublin Tech Summit', keyword: 'Dublin Tech Summit' },
  { label: 'SFI Grants', keyword: 'SFI' },
  { label: 'Startups', keyword: 'startup' },
  { label: 'M&A', keyword: 'acquisition' },
];
