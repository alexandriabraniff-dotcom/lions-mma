export type Testimonial = {
  name: string;
  detail: string;
  quote: string;
};

export const testimonials: Testimonial[] = [
  {
    name: 'Johnny Tesoro',
    detail: '19-year member',
    quote: 'Lions MMA is my second family and home away from home. Best training, best classes, most classes, best instructors, best team in Vancouver. I have been a member for 19 years and will never go anywhere else.',
  },
  {
    name: 'Jean Arnold',
    detail: 'Member',
    quote: 'Hands down the best gym in town. Great variety of classes and martial arts, teaching adapted to all levels, and very good value. Me and my daughter have been going for years.',
  },
  {
    name: 'Kyle Lucey',
    detail: 'Visitor',
    quote: 'I took a week trial while visiting Vancouver and received incredible training every day from the world class instructors. This is the place to go. Cannot recommend enough.',
  },
  {
    name: 'Momina Tariq',
    detail: 'Member',
    quote: 'Lions is the best MMA place in town. The staff is exceptionally friendly and professional, fostering a positive atmosphere. The classes are always well structured.',
  },
  {
    name: 'Kristina Toporkova',
    detail: 'Member',
    quote: 'Joining Lions was the best decision I have made recently. I always have amazing workouts, I have learned a lot, and I have met incredible people through the gym.',
  },
  {
    name: 'Marina Nogueira',
    detail: 'Member',
    quote: "The class schedule is very flexible, with morning and evening classes. The women's only program is excellent. Pads are provided during class and the free trial is a great way to start.",
  },
];

export default testimonials;
