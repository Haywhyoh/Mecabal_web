/**
 * Business constants and data
 */

export const SERVICE_AREAS = [
  {
    id: 'estate-only',
    name: 'Estate Only',
    description: 'Services within your estate only',
    radius: 0,
  },
  {
    id: 'neighborhood',
    name: 'Neighborhood',
    description: 'Services within your neighborhood (2-5km)',
    radius: 5,
  },
  {
    id: 'district',
    name: 'District',
    description: 'Services within your district (5-10km)',
    radius: 10,
  },
  {
    id: 'city-wide',
    name: 'City Wide',
    description: 'Services throughout the city',
    radius: 50,
  },
  {
    id: 'state-wide',
    name: 'State Wide',
    description: 'Services throughout the state',
    radius: -1,
  },
];

export const PRICING_MODELS = [
  {
    id: 'fixed-rate',
    name: 'Fixed Rate',
    description: 'Fixed price for the service',
    example: 'e.g., ₦5,000 for plumbing repair',
  },
  {
    id: 'hourly-rate',
    name: 'Hourly Rate',
    description: 'Charged per hour of work',
    example: 'e.g., ₦2,500/hour for cleaning',
  },
  {
    id: 'project-based',
    name: 'Project Based',
    description: 'Price quoted per project',
    example: 'e.g., ₦50,000 for full home renovation',
  },
  {
    id: 'negotiable',
    name: 'Negotiable',
    description: 'Price discussed based on requirements',
    example: 'Contact for quote',
  },
];

export const AVAILABILITY_SCHEDULES = [
  {
    id: 'business-hours',
    name: 'Business Hours',
    description: 'Monday to Friday, 9am - 5pm',
  },
  {
    id: 'extended-hours',
    name: 'Extended Hours',
    description: 'Monday to Friday, 8am - 8pm',
  },
  {
    id: 'weekend-available',
    name: 'Weekend Available',
    description: 'Available on weekends',
  },
  {
    id: 'twenty-four-seven',
    name: '24/7 Available',
    description: 'Available round the clock',
  },
  {
    id: 'flexible',
    name: 'Flexible',
    description: 'Flexible schedule based on client needs',
  },
];

export const PAYMENT_METHODS = [
  {
    id: 'cash',
    name: 'Cash',
    description: 'Cash payments',
    icon: 'money',
    popular: true,
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    description: 'Direct bank transfer',
    icon: 'bank',
    popular: true,
  },
  {
    id: 'mobile-money',
    name: 'Mobile Money',
    description: 'Mobile money transfers (OPay, Palmpay, etc.)',
    icon: 'smartphone',
    popular: true,
  },
  {
    id: 'pos',
    name: 'POS',
    description: 'Point of Sale terminal',
    icon: 'credit-card',
  },
  {
    id: 'online-payment',
    name: 'Online Payment',
    description: 'Online payment gateways',
    icon: 'globe',
  },
];

