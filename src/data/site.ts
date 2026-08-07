export const site = {
  name: "Spin & Dry",
  tagline: "Professional fabric care studio",
  description:
    "Spin & Dry is a professional fabric care and laundry company specialising in curtains, carpets, blankets, sofa covers, quilts and commercial linen, with free pickup and delivery within 10 km of the studio.",
  phone: "+91 98765 43210",
  phoneHref: "tel:+919876543210",
  whatsapp: "https://wa.me/919876543210",
  email: "care@spinanddry.com",
  address: "Spin & Dry Fabric Care Studio, 24 Linen Lane, Indiranagar, Bengaluru 560038",
  hours: [
    { days: "Monday – Saturday", time: "8:00 – 20:00" },
    { days: "Sunday", time: "9:00 – 14:00 (pickup only)" },
  ],
  /** Studio coordinates used for the 10 km pickup radius calculation. */
  coords: { lat: 12.9784, lng: 77.6408 },
  pickupRadiusKm: 10,
  founded: 2013,
  stats: [
    { value: "12 yrs", label: "In professional fabric care" },
    { value: "10 km", label: "Free pickup & delivery radius" },
    { value: "48 hrs", label: "Standard turnaround" },
    { value: "180+", label: "Hotel & office accounts served" },
  ],
} as const;

export const timeSlots = [
  "08:00 – 10:00",
  "10:00 – 12:00",
  "12:00 – 14:00",
  "14:00 – 16:00",
  "16:00 – 18:00",
  "18:00 – 20:00",
] as const;

export const testimonials = [
  {
    quote:
      "Our 14-foot living room drapes came back with the pleats intact and no shrinkage. The pickup team re-hung them the same evening.",
    name: "Ananya R.",
    role: "Villa owner, Whitefield",
  },
  {
    quote:
      "We move 400 pieces of linen a week. Spin & Dry has never missed a delivery window in two years of service.",
    name: "Rakesh Menon",
    role: "Housekeeping Manager, boutique hotel",
  },
  {
    quote:
      "They inspected the carpet, told me exactly which stains would lift and which would not, then delivered on that. Rare honesty.",
    name: "Priya Kulkarni",
    role: "Interior designer",
  },
  {
    quote:
      "Comforters and quilts return dry, lofted and odour free. Booking takes under two minutes.",
    name: "Sandeep V.",
    role: "Apartment resident, Koramangala",
  },
] as const;

export const generalFaqs = [
  {
    q: "Which areas do you cover for pickup and delivery?",
    a: "Spin & Dry offers free pickup and delivery within a 10 km radius of our studio. You can confirm your address instantly during booking — the address is checked against the 10 km service radius before you confirm. Outside 10 km, we still accept consultations, bulk commercial contracts and special requests.",
  },
  {
    q: "How long does an order take?",
    a: "Standard turnaround is 48 hours for household linen and blankets. Curtains, carpets, sofa covers and quilts typically take 72 hours because they require inspection, controlled drying and finishing. Express handling is available on request.",
  },
  {
    q: "Do you offer wet cleaning?",
    a: "No. Spin & Dry does not provide wet cleaning. We use professional laundering, fabric-specific detergent programmes, controlled temperature drying and finishing equipment.",
  },
  {
    q: "How is pricing decided?",
    a: "Pricing depends on the item type, size, fabric and soil level. Every booking is inspected on arrival at the studio and you receive a confirmed quote before processing begins. Nothing is cleaned without your approval.",
  },
  {
    q: "Is my booking payment collected online?",
    a: "Today, payment is collected on delivery by card, UPI or bank transfer. The booking system is built to add online payment at checkout, so prepaid orders can be enabled without changing your booking flow.",
  },
  {
    q: "Do you handle commercial and hotel volumes?",
    a: "Yes. We service hotels, restaurants, corporate offices, salons, property managers and interior designers with scheduled collection routes, itemised manifests and contracted rates.",
  },
] as const;

export const journey = [
  {
    step: "01",
    title: "Book a collection",
    body: "Choose your services, a date and a two-hour slot. We validate your address against the 10 km pickup radius as you type.",
  },
  {
    step: "02",
    title: "Doorstep pickup",
    body: "A uniformed team member counts and tags every piece with you, photographs pre-existing damage and issues a digital manifest.",
  },
  {
    step: "03",
    title: "Inspection & quote",
    body: "At the studio each item is graded for fibre, colour fastness and soil level. You approve the confirmed quote before processing.",
  },
  {
    step: "04",
    title: "Professional care",
    body: "Items run on a fabric-specific programme: pre-treatment, calibrated wash chemistry, controlled drying and finishing.",
  },
  {
    step: "05",
    title: "Quality check",
    body: "A second technician checks every piece against the manifest for stain lift, odour, shrinkage and finish before packing.",
  },
  {
    step: "06",
    title: "Delivery & re-fit",
    body: "Packed in breathable covers and returned in your chosen slot. Curtains and sofa covers can be re-hung and re-fitted on site.",
  },
] as const;