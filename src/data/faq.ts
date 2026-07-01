export type FAQItem = { q: string; a: string; };
export type FAQCategory = { category: string; items: FAQItem[]; };

export const faq: FAQCategory[] = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'Do I need any martial arts experience to join?',
        a: 'None at all. Every program has fundamentals classes designed for complete beginners. You will not be thrown in with experienced fighters on day one. Most members start with zero background and build from there.',
      },
      {
        q: 'What should I wear to my first class?',
        a: 'Comfortable athletic wear is fine for your first visit. For Muay Thai or boxing, shorts and a t-shirt work well. For BJJ, we recommend athletic shorts without pockets or exposed zippers to protect your training partners. Once you join, your gear pack covers the essentials.',
      },
      {
        q: 'What do I need to bring?',
        a: 'Water bottle, a towel, and yourself. Pads and other equipment are provided during class for new members. If you have your own gloves or shin guards, bring them, but it is not required from day one.',
      },
      {
        q: 'How does the free trial work?',
        a: 'Book a free trial through the website or by calling the gym. You will be matched with an appropriate fundamentals class, introduced to the instructor, and given a proper walkthrough of the gym. There is no pressure to sign up on the day.',
      },
      {
        q: 'Which location should I start at?',
        a: 'Both locations offer the full range of programs and have the same standards. Choose whichever is more convenient. Your membership covers both, so you can train at either once you are signed up.',
      },
    ],
  },
  {
    category: 'Training',
    items: [
      {
        q: 'How long before I get good?',
        a: 'That depends on how often you train and what "good" means to you. Most people notice real improvement within three to six months of consistent training. Building a solid foundation in any discipline takes time, but the progress is visible if you show up regularly.',
      },
      {
        q: 'Can I train in more than one discipline?',
        a: 'Yes, and we encourage it. Membership covers your primary program and you can add additional programs for a small monthly fee. Many members train in both striking and grappling, which is the most complete approach to combat sports fitness.',
      },
      {
        q: 'What is the difference between the 1256 and 1133 locations?',
        a: 'Both locations run the full schedule and are staffed by the same coaching team. The facilities are set up for the same programs. Having two locations a short walk apart means more class times to choose from and no excuses for missing a session.',
      },
      {
        q: 'Are classes split by skill level?',
        a: 'Yes. Each program has fundamentals, all-levels, and advanced classes. Beginners start in fundamentals where the pace and curriculum are calibrated for people still learning the basics. Advanced and competition classes are for experienced practitioners with demonstrated technical foundations.',
      },
      {
        q: 'What is the difference between BJJ Gi and No-Gi?',
        a: 'Gi classes use the traditional Brazilian Jiu-Jitsu uniform, which allows for grip-heavy technique including collar and sleeve chokes. No-Gi is done in shorts and a rash guard, with no fabric grips, which changes the dynamic toward wrestling-based control and leg lock attacks. Both are worth training.',
      },
    ],
  },
  {
    category: 'Membership',
    items: [
      {
        q: 'Am I locked into a contract?',
        a: 'We offer 12-month and 6-month commitments at lower monthly rates, as well as a month-to-month option with no fixed term. The commitment plans represent real savings over time. If you are unsure, start month-to-month and lock in a longer term when you are ready.',
      },
      {
        q: 'Can I freeze my membership?',
        a: 'Yes. Life happens. Speak to the front desk about a membership hold if you are travelling, recovering from an injury, or dealing with something outside the gym. Holds are available on a case-by-case basis.',
      },
      {
        q: 'What is included in the gear pack?',
        a: 'Every membership comes with a Lions MMA gear pack covering the essential equipment you need to train. The specifics are covered at sign-up. It is our way of removing the barrier between joining and getting started.',
      },
      {
        q: 'Is there separate pricing for kids?',
        a: 'Yes. Kids memberships are priced separately from adult memberships. Speak to Alex Coles or the front desk for current kids program rates. Family discounts are also available when multiple family members train.',
      },
      {
        q: 'What does a "back-to-back" add-on mean?',
        a: 'A back-to-back lets you attend two consecutive classes in a session, for example a Muay Thai class followed directly by a BJJ class. This is popular with members who want to maximise their training time without upgrading to a full unlimited plan.',
      },
    ],
  },
  {
    category: 'Safety & Culture',
    items: [
      {
        q: 'Is there a high risk of injury?',
        a: 'Every combat sport carries some risk, but our coaches prioritise safety and controlled training. Fundamentals classes avoid live sparring until students have the technical base to handle it safely. When sparring is introduced, it is supervised, controlled, and done with gym partners who are looking after each other.',
      },
      {
        q: 'Is the gym aggressive or intimidating?',
        a: 'No. Lions has been around long enough to have developed a culture that is serious about training and genuinely welcoming to newcomers. Ego-driven behaviour is not tolerated. You will find competitive people who also know how to train with beginners without making them regret walking through the door.',
      },
      {
        q: 'Is it safe for women to train here?',
        a: 'Yes. Lions has an active Women\'s Only program specifically designed to give women a dedicated training environment led by Jessica Wilson. Women also train freely across all other classes. The culture is professional and respectful. The Women\'s Only program is a great starting point for those who prefer to build confidence before joining mixed classes.',
      },
      {
        q: 'What age can kids start training?',
        a: 'Kids classes are generally open from age 5 and up, split into age-appropriate groups. The program focuses on discipline, confidence, anti-bullying awareness, and the fundamentals of martial arts. It is not a competitive fight program, it is about building character through training.',
      },
    ],
  },
];

export default faq;
