/**
 * Ireland Tech Companies Static Data
 *
 * Manually curated list of major tech companies in Ireland.
 * This serves as the initial data source before external API integration.
 */

import type { Company } from '@/types/company';

/**
 * Static company data for Ireland tech ecosystem
 */
export const IRELAND_COMPANIES: Company[] = [
  // Unicorns & Major Tech HQs
  {
    id: 'stripe',
    slug: 'stripe',
    name: 'Stripe',
    description: 'Financial infrastructure platform for the internet. Founded in Ireland, now a global fintech leader.',
    founded: 2010,
    headquarters: 'Dublin, Ireland',
    industry: 'Fintech',
    employeeCount: '5001-10000',
    website: 'https://stripe.com',
    linkedin: 'https://linkedin.com/company/stripe',
    twitter: 'stripe',
    funding: {
      total: '€2.5B',
      lastRound: 'Series H',
      lastRoundDate: '2021-03',
      investors: ['Sequoia', 'Andreessen Horowitz', 'Tiger Global'],
    },
    people: [
      { name: 'Patrick Collison', title: 'CEO', linkedin: 'https://linkedin.com/in/patrickcollison' },
      { name: 'John Collison', title: 'President', linkedin: 'https://linkedin.com/in/johncollison' },
    ],
    tags: ['unicorn', 'irish-founded', 'tech-hq'],
    coordinates: [-6.2603, 53.3498],
    address: 'Grand Canal Dock, Dublin 2',
    updatedAt: '2026-03-24',
  },
  {
    id: 'intercom',
    slug: 'intercom',
    name: 'Intercom',
    description: 'Customer messaging platform that helps businesses connect with customers.',
    founded: 2011,
    headquarters: 'Dublin, Ireland',
    industry: 'SaaS',
    employeeCount: '501-1000',
    website: 'https://intercom.com',
    linkedin: 'https://linkedin.com/company/intercom',
    funding: {
      total: '€240M',
      lastRound: 'Series D',
      lastRoundDate: '2018-09',
    },
    people: [
      { name: 'Eoghan McCabe', title: 'CEO' },
    ],
    tags: ['unicorn', 'irish-founded'],
    coordinates: [-6.2489, 53.3389],
    updatedAt: '2026-03-24',
  },

  // Semiconductor
  {
    id: 'intel-ireland',
    slug: 'intel-ireland',
    name: 'Intel Ireland',
    description: 'Intel\'s largest manufacturing site outside the US, producing advanced chips.',
    founded: 1989,
    headquarters: 'Leixlip, Co. Kildare',
    industry: 'Semiconductor',
    employeeCount: '5001-10000',
    website: 'https://intel.ie',
    linkedin: 'https://linkedin.com/company/intel-corporation',
    people: [
      { name: 'Eamonn Sinnott', title: 'VP & GM Intel Ireland' },
    ],
    relatedCompanies: [
      { slug: 'intel', name: 'Intel Corporation', relation: 'parent' },
    ],
    tags: ['semiconductor', 'multinational'],
    coordinates: [-6.4967, 53.3631],
    address: 'Collinstown Industrial Park, Leixlip',
    updatedAt: '2026-03-24',
  },
  {
    id: 'analog-devices',
    slug: 'analog-devices',
    name: 'Analog Devices',
    description: 'Global semiconductor company with major R&D and manufacturing in Ireland.',
    founded: 1976,
    headquarters: 'Limerick, Ireland',
    industry: 'Semiconductor',
    employeeCount: '1001-5000',
    website: 'https://analog.com',
    linkedin: 'https://linkedin.com/company/analog-devices',
    tags: ['semiconductor', 'multinational'],
    coordinates: [-8.6305, 52.6638],
    updatedAt: '2026-03-24',
  },

  // Big Tech EMEA HQs
  {
    id: 'google-ireland',
    slug: 'google-ireland',
    name: 'Google Ireland',
    description: 'Google\'s EMEA headquarters, handling operations across Europe, Middle East, and Africa.',
    founded: 2003,
    headquarters: 'Dublin, Ireland',
    industry: 'Cloud',
    employeeCount: '5001-10000',
    website: 'https://google.ie',
    linkedin: 'https://linkedin.com/company/google',
    relatedCompanies: [
      { slug: 'alphabet', name: 'Alphabet Inc.', relation: 'parent' },
    ],
    tags: ['tech-hq', 'multinational'],
    coordinates: [-6.2376, 53.3392],
    address: 'Barrow Street, Dublin 4',
    updatedAt: '2026-03-24',
  },
  {
    id: 'meta-ireland',
    slug: 'meta-ireland',
    name: 'Meta Ireland',
    description: 'Meta\'s EMEA headquarters, managing Facebook, Instagram, and WhatsApp operations.',
    founded: 2008,
    headquarters: 'Dublin, Ireland',
    industry: 'Consumer',
    employeeCount: '5001-10000',
    website: 'https://meta.com',
    linkedin: 'https://linkedin.com/company/meta',
    relatedCompanies: [
      { slug: 'meta', name: 'Meta Platforms Inc.', relation: 'parent' },
    ],
    tags: ['tech-hq', 'multinational', 'data-center'],
    coordinates: [-6.2297, 53.3400],
    address: 'Merrion Road, Dublin 4',
    updatedAt: '2026-03-24',
  },
  {
    id: 'apple-ireland',
    slug: 'apple-ireland',
    name: 'Apple Ireland',
    description: 'Apple\'s European operations hub, including AppleCare and iTunes.',
    founded: 1980,
    headquarters: 'Cork, Ireland',
    industry: 'Consumer',
    employeeCount: '5001-10000',
    website: 'https://apple.com/ie',
    linkedin: 'https://linkedin.com/company/apple',
    relatedCompanies: [
      { slug: 'apple', name: 'Apple Inc.', relation: 'parent' },
    ],
    tags: ['tech-hq', 'multinational'],
    coordinates: [-8.4958, 51.8985],
    address: 'Hollyhill Industrial Estate, Cork',
    updatedAt: '2026-03-24',
  },
  {
    id: 'microsoft-ireland',
    slug: 'microsoft-ireland',
    name: 'Microsoft Ireland',
    description: 'Microsoft\'s EMEA operations center and engineering hub.',
    founded: 1985,
    headquarters: 'Dublin, Ireland',
    industry: 'Cloud',
    employeeCount: '1001-5000',
    website: 'https://microsoft.com/ie',
    linkedin: 'https://linkedin.com/company/microsoft',
    relatedCompanies: [
      { slug: 'microsoft', name: 'Microsoft Corporation', relation: 'parent' },
    ],
    tags: ['tech-hq', 'multinational', 'data-center'],
    coordinates: [-6.2220, 53.2860],
    address: 'Leopardstown, Dublin 18',
    updatedAt: '2026-03-24',
  },
  {
    id: 'amazon-ireland',
    slug: 'amazon-ireland',
    name: 'Amazon Ireland',
    description: 'Amazon\'s European operations including AWS and retail.',
    founded: 2004,
    headquarters: 'Dublin, Ireland',
    industry: 'Cloud',
    employeeCount: '5001-10000',
    website: 'https://amazon.ie',
    linkedin: 'https://linkedin.com/company/amazon',
    relatedCompanies: [
      { slug: 'amazon', name: 'Amazon.com Inc.', relation: 'parent' },
    ],
    tags: ['tech-hq', 'multinational', 'data-center'],
    coordinates: [-6.2389, 53.3331],
    address: 'Burlington Plaza, Dublin 4',
    updatedAt: '2026-03-24',
  },

  // Data Centers
  {
    id: 'equinix-dublin',
    slug: 'equinix-dublin',
    name: 'Equinix Dublin',
    description: 'Major colocation data center provider serving Ireland\'s tech industry.',
    founded: 2007,
    headquarters: 'Dublin, Ireland',
    industry: 'Data Center',
    employeeCount: '201-500',
    website: 'https://equinix.ie',
    linkedin: 'https://linkedin.com/company/equinix',
    tags: ['data-center', 'multinational'],
    coordinates: [-6.2749, 53.3494],
    updatedAt: '2026-03-24',
  },

  // Fintech
  {
    id: 'fenergo',
    slug: 'fenergo',
    name: 'Fenergo',
    description: 'Client lifecycle management software for financial institutions.',
    founded: 2009,
    headquarters: 'Dublin, Ireland',
    industry: 'Fintech',
    employeeCount: '501-1000',
    website: 'https://fenergo.com',
    linkedin: 'https://linkedin.com/company/fenergo',
    funding: {
      total: '€80M',
      lastRound: 'Growth',
      lastRoundDate: '2020-06',
    },
    tags: ['irish-founded', 'startup'],
    coordinates: [-6.2654, 53.3448],
    updatedAt: '2026-03-24',
  },

  // Healthcare/Pharma Tech
  {
    id: 'icon-plc',
    slug: 'icon-plc',
    name: 'ICON plc',
    description: 'Global provider of outsourced drug development and commercialisation services.',
    founded: 1990,
    headquarters: 'Dublin, Ireland',
    industry: 'Healthcare',
    employeeCount: '10000+',
    website: 'https://iconplc.com',
    linkedin: 'https://linkedin.com/company/icon-plc',
    tags: ['irish-founded', 'multinational'],
    coordinates: [-6.2297, 53.3145],
    updatedAt: '2026-03-24',
  },
];

/**
 * Get company by slug
 */
export function getCompanyBySlug(slug: string): Company | undefined {
  return IRELAND_COMPANIES.find((c) => c.slug === slug);
}

/**
 * Get company by ID
 */
export function getCompanyById(id: string): Company | undefined {
  return IRELAND_COMPANIES.find((c) => c.id === id);
}

/**
 * Search companies by query
 */
export function searchCompanies(query: string): Company[] {
  const q = query.toLowerCase();
  return IRELAND_COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q)
  );
}

/**
 * Get companies by tag
 */
export function getCompaniesByTag(tag: string): Company[] {
  return IRELAND_COMPANIES.filter((c) => c.tags?.includes(tag as NonNullable<Company['tags']>[number]));
}

/**
 * Get companies by industry
 */
export function getCompaniesByIndustry(industry: string): Company[] {
  return IRELAND_COMPANIES.filter((c) => c.industry === industry);
}

/**
 * Get all company slugs
 */
export function getAllCompanySlugs(): string[] {
  return IRELAND_COMPANIES.map((c) => c.slug);
}
