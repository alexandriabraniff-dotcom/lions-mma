export type PricingPlan = {
  id: string;
  name: string;
  commitment: string;
  price: number;
  perMonth: boolean;
  includes: string;
  access: string;
  highlight: boolean;
};

export type AddOn = {
  name: string;
  description: string;
  price: number;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: 'unlimited-12',
    name: 'Unlimited',
    commitment: '12 months',
    price: 135,
    perMonth: true,
    includes: 'Gear pack included',
    access: 'All classes, both locations',
    highlight: true,
  },
  {
    id: 'unlimited-6',
    name: 'Unlimited',
    commitment: '6 months',
    price: 145,
    perMonth: true,
    includes: 'Gear pack included',
    access: 'All classes, both locations',
    highlight: false,
  },
  {
    id: 'unlimited-mtm',
    name: 'Unlimited',
    commitment: 'Month to month',
    price: 160,
    perMonth: true,
    includes: 'Gear pack included',
    access: 'All classes, both locations',
    highlight: false,
  },
  {
    id: '2days-12',
    name: '2 Days / Week',
    commitment: '12 months',
    price: 125,
    perMonth: true,
    includes: 'Gear pack included',
    access: '2 classes per week',
    highlight: false,
  },
  {
    id: '2days-6',
    name: '2 Days / Week',
    commitment: '6 months',
    price: 135,
    perMonth: true,
    includes: 'Gear pack included',
    access: '2 classes per week',
    highlight: false,
  },
  {
    id: '2days-mtm',
    name: '2 Days / Week',
    commitment: 'Month to month',
    price: 150,
    perMonth: true,
    includes: 'Gear pack included',
    access: '2 classes per week',
    highlight: false,
  },
];

export const addOns: AddOn[] = [
  { name: 'Additional Grappling Program', description: 'BJJ, No-Gi', price: 15 },
  { name: 'Additional Striking Program', description: 'Muay Thai, Boxing', price: 15 },
  { name: 'Back-to-Back Classes', description: '', price: 25 },
  { name: 'Program + Back-to-Back', description: '', price: 30 },
];

export default pricingPlans;
