export const locations = [
  {
    id: '1256',
    label: 'Location 1',
    name: '1256 Granville',
    short: '1256',
    address: '1256 Granville St',
    city: 'Vancouver, BC V6Z 1M4',
    full: '1256 Granville St, Vancouver, BC V6Z 1M4',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2603.1!2d-123.1396!3d49.2768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548673e2f2b00001%3A0x1!2s1256+Granville+St%2C+Vancouver%2C+BC!5e0!3m2!1sen!2sca!4v1',
  },
  {
    id: '1133',
    label: 'Location 2',
    name: '1133 Granville',
    short: '1133',
    address: '1133 Granville St',
    city: 'Vancouver, BC V6Z 1M1',
    full: '1133 Granville St, Vancouver, BC V6Z 1M1',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2603.1!2d-123.1396!3d49.2772!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548673e2f2b00002%3A0x2!2s1133+Granville+St%2C+Vancouver%2C+BC!5e0!3m2!1sen!2sca!4v1',
  },
] as const;

export type LocationId = typeof locations[number]['id'];
