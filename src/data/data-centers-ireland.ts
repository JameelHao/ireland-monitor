/**
 * Ireland Data Centers Data
 *
 * Static data for major cloud and data center facilities in Ireland.
 * Ireland hosts ~25% of EU data center capacity.
 */

export interface IrelandDataCenter {
  id: string;
  name: string;
  operator: string;
  location: string;
  lat: number;
  lng: number;
  capacity?: string;
  status: 'operational' | 'under-construction' | 'planned';
  description?: string;
  website?: string;
}

/**
 * Major data center facilities in Ireland
 */
export const IRELAND_DATA_CENTERS: IrelandDataCenter[] = [
  // Google Cloud
  {
    id: 'google-grange-castle',
    name: 'Google Grange Castle',
    operator: 'Google Cloud',
    location: 'Clondalkin, Dublin',
    lat: 53.3122,
    lng: -6.3972,
    capacity: '100 MW+',
    status: 'operational',
    description:
      "One of Google's largest European data centers, supporting Google Cloud, YouTube, and Search.",
    website: 'https://www.google.com/about/datacenters/locations/dublin/',
  },
  {
    id: 'google-profile-park',
    name: 'Google Profile Park',
    operator: 'Google Cloud',
    location: 'Clondalkin, Dublin',
    lat: 53.3175,
    lng: -6.4038,
    status: 'operational',
    description: 'Expansion campus for Google Cloud services in Ireland.',
  },

  // Meta/Facebook
  {
    id: 'meta-clonee',
    name: 'Meta Clonee Data Center',
    operator: 'Meta (Facebook)',
    location: 'Clonee, Co. Meath',
    lat: 53.4119,
    lng: -6.4447,
    capacity: '150 MW+',
    status: 'operational',
    description:
      "Meta's first international data center, serving Facebook, Instagram, and WhatsApp for EMEA.",
    website: 'https://datacenters.fb.com/locations/clonee/',
  },

  // Microsoft Azure
  {
    id: 'microsoft-dublin-dc1',
    name: 'Microsoft Azure Dublin DC1',
    operator: 'Microsoft Azure',
    location: 'Grange Castle, Dublin',
    lat: 53.3089,
    lng: -6.3989,
    capacity: '80 MW+',
    status: 'operational',
    description:
      'Primary Azure region for Western Europe, supporting Microsoft 365, Azure, and Xbox Live.',
    website: 'https://azure.microsoft.com/explore/global-infrastructure/',
  },
  {
    id: 'microsoft-dublin-dc2',
    name: 'Microsoft Azure Dublin DC2',
    operator: 'Microsoft Azure',
    location: 'Profile Park, Dublin',
    lat: 53.3156,
    lng: -6.4012,
    status: 'operational',
    description: 'Secondary Azure facility for North Europe region redundancy.',
  },

  // Amazon AWS
  {
    id: 'aws-dublin-az1',
    name: 'AWS eu-west-1a',
    operator: 'Amazon Web Services',
    location: 'Tallaght, Dublin',
    lat: 53.2859,
    lng: -6.3733,
    status: 'operational',
    description: 'Primary AWS availability zone for eu-west-1 (Ireland) region.',
    website: 'https://aws.amazon.com/about-aws/global-infrastructure/',
  },
  {
    id: 'aws-dublin-az2',
    name: 'AWS eu-west-1b',
    operator: 'Amazon Web Services',
    location: 'Profile Park, Dublin',
    lat: 53.3145,
    lng: -6.4025,
    status: 'operational',
    description: 'Secondary AWS availability zone for eu-west-1 region.',
  },
  {
    id: 'aws-dublin-az3',
    name: 'AWS eu-west-1c',
    operator: 'Amazon Web Services',
    location: 'Grange Castle, Dublin',
    lat: 53.3102,
    lng: -6.3955,
    status: 'operational',
    description: 'Third AWS availability zone for eu-west-1 region.',
  },

  // Equinix
  {
    id: 'equinix-db1',
    name: 'Equinix DB1',
    operator: 'Equinix',
    location: 'Blanchardstown, Dublin',
    lat: 53.3889,
    lng: -6.3778,
    capacity: '20 MW',
    status: 'operational',
    description:
      "Carrier-neutral colocation facility, part of Equinix's global interconnection platform.",
    website: 'https://www.equinix.com/data-centers/europe-colocation/ireland-colocation/',
  },
  {
    id: 'equinix-db2',
    name: 'Equinix DB2',
    operator: 'Equinix',
    location: 'Kilcarbery, Dublin',
    lat: 53.3445,
    lng: -6.3889,
    capacity: '15 MW',
    status: 'operational',
    description: 'Second Equinix colocation facility in Dublin.',
  },

  // Digital Realty
  {
    id: 'digital-realty-dub1',
    name: 'Digital Realty DUB10',
    operator: 'Digital Realty',
    location: 'Clonshaugh, Dublin',
    lat: 53.3956,
    lng: -6.2178,
    capacity: '25 MW',
    status: 'operational',
    description: 'Enterprise-grade colocation and interconnection services.',
    website: 'https://www.digitalrealty.com/data-centers/emea/dublin',
  },
];
