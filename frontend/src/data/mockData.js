/* ─────────────────────────────────────────────────────────────────────────────
   mockData.js
   Static demo data that simulates the Django + MySQL backend responses.
   In production these would be fetched via Django REST Framework API calls.
───────────────────────────────────────────────────────────────────────────── */

export const CARS = [
  {
    id: 1,
    make: 'BMW', model: '5 Series', year: 2020,
    vin: 'WBA53BH0XM7G80001',
    category: 'Sedan', mileage: '42,000 km',
    fuel: 'Diesel', transmission: 'Automatic',
    condition: 'Good', damage: 'Minor rear dent', color: 'Jet Black',
    startingBid: 18500, currentBid: 21800,
    highestBidder: 'aleksas_p',
    auctionEnd: Date.now() + 1000 * 60 * 60 * 3.4,
    status: 'live',
    description:
      'Ex-lease BMW 5 Series in excellent condition with full service history. ' +
      'Recently inspected by certified technicians. All major components verified. ' +
      'Non-smoking, single previous owner.',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80',
    ],
    bids: [
      { user: 'marta_k',   amount: 19000, time: '14:02' },
      { user: 'jonas_v',   amount: 20500, time: '14:18' },
      { user: 'aleksas_p', amount: 21800, time: '14:47' },
    ],
    comments: [
      { user: 'marta_k', text: 'Is the full service book available?',                  time: '13:55', likes: 2 },
      { user: 'admin',   text: 'Yes, full dealer service history is included!',         time: '14:01', likes: 5 },
    ],
  },
  {
    id: 2,
    make: 'Volkswagen', model: 'Tiguan', year: 2021,
    vin: 'WVGZZZ5NZMW100002',
    category: 'SUV', mileage: '31,000 km',
    fuel: 'Petrol', transmission: 'Automatic',
    condition: 'Excellent', damage: 'None', color: 'Deep Black Pearl',
    startingBid: 22000, currentBid: 26400,
    highestBidder: 'rasa_j',
    auctionEnd: Date.now() + 1000 * 60 * 60 * 1.2,
    status: 'live',
    description:
      'One-owner Tiguan sourced directly from leasing company. No accidents, all original parts. ' +
      'Ideal family SUV. Includes roof rails, navigation system, and front/rear parking sensors.',
    images: [
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80',
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80',
    ],
    bids: [
      { user: 'tomas_b', amount: 23000, time: '10:15' },
      { user: 'rasa_j',  amount: 26400, time: '11:30' },
    ],
    comments: [
      { user: 'tomas_b', text: 'Any hidden rust underneath?',        time: '10:05', likes: 1 },
      { user: 'rasa_j',  text: 'Looks pristine from all photos!',    time: '10:20', likes: 3 },
    ],
  },
  {
    id: 3,
    make: 'Mercedes-Benz', model: 'C-Class', year: 2019,
    vin: 'WDDWF8EB2KR400003',
    category: 'Sedan', mileage: '68,000 km',
    fuel: 'Diesel', transmission: 'Automatic',
    condition: 'Good', damage: 'Front bumper scratch', color: 'Polar White',
    startingBid: 21000, currentBid: 23500,
    highestBidder: 'vilius_m',
    auctionEnd: Date.now() + 1000 * 60 * 60 * 6.8,
    status: 'live',
    description:
      'C220d AMG Line. Minor cosmetic scratch on front bumper — easily repaired. ' +
      'Well maintained with full dealer service records. All warning-free on diagnostic check.',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    ],
    bids: [
      { user: 'vilius_m', amount: 23500, time: '09:40' },
    ],
    comments: [],
  },
  {
    id: 4,
    make: 'Audi', model: 'A4', year: 2022,
    vin: 'WAUZZZ8V5NA500004',
    category: 'Sedan', mileage: '18,000 km',
    fuel: 'Petrol', transmission: 'Automatic',
    condition: 'Excellent', damage: 'None', color: 'Glacier White',
    startingBid: 31000, currentBid: 34200,
    highestBidder: 'egle_s',
    auctionEnd: Date.now() + 1000 * 60 * 60 * 11.5,
    status: 'live',
    description:
      'Nearly new A4 from corporate lease. Under factory warranty until 2025. ' +
      'All optional extras: Bang & Olufsen sound system, virtual cockpit, adaptive cruise control.',
    images: [
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80',
    ],
    bids: [
      { user: 'darius_k', amount: 32000, time: '08:10' },
      { user: 'egle_s',   amount: 34200, time: '09:25' },
    ],
    comments: [
      { user: 'darius_k', text: 'Is this still under manufacturer warranty?', time: '08:00', likes: 4 },
    ],
  },
  {
    id: 5,
    make: 'Toyota', model: 'Camry', year: 2020,
    vin: '4T1B11HK9LU500005',
    category: 'Sedan', mileage: '55,000 km',
    fuel: 'Hybrid', transmission: 'CVT',
    condition: 'Good', damage: 'Minor door ding', color: 'Midnight Black',
    startingBid: 16500, currentBid: 18100,
    highestBidder: 'paulius_a',
    auctionEnd: Date.now() + 1000 * 60 * 60 * 24,
    status: 'upcoming',
    description:
      'Hybrid Camry. Excellent fuel economy at 5.5L/100km. Perfect for daily commuting. ' +
      'Minor ding on driver door. Otherwise in excellent shape.',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
    ],
    bids: [],
    comments: [],
  },
  {
    id: 6,
    make: 'Ford', model: 'Focus', year: 2018,
    vin: '1FADP3F20JL600006',
    category: 'Hatchback', mileage: '88,000 km',
    fuel: 'Petrol', transmission: 'Manual',
    condition: 'Fair', damage: 'Rear bumper crack, missing trim', color: 'Race Red',
    startingBid: 7200, currentBid: 8900,
    highestBidder: 'neringa_v',
    auctionEnd: Date.now() - 1000 * 60 * 60 * 5,
    status: 'ended',
    description:
      'Salvage title. Solid engine and gearbox in good condition. ' +
      'Needs bodywork on rear bumper. Good project car or repair-and-resell opportunity.',
    images: [
      'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&q=80',
    ],
    bids: [
      { user: 'neringa_v', amount: 8900, time: 'Yesterday' },
    ],
    comments: [],
  },
  {
    id: 7,
    make: 'Škoda', model: 'Octavia', year: 2021,
    vin: 'TMBEA7NE0M0700007',
    category: 'Sedan', mileage: '37,000 km',
    fuel: 'Diesel', transmission: 'Manual',
    condition: 'Excellent', damage: 'None', color: 'Quartz Grey',
    startingBid: 14500, currentBid: 16800,
    highestBidder: 'giedrius_r',
    auctionEnd: Date.now() + 1000 * 60 * 60 * 18,
    status: 'upcoming',
    description:
      'Lithuanian-registered Octavia IV from leasing company. ' +
      'One careful driver. Full service history at authorized Škoda dealer.',
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0729?w=800&q=80',
    ],
    bids: [],
    comments: [],
  },
  {
    id: 8,
    make: 'Volvo', model: 'XC60', year: 2020,
    vin: 'YV4A22PK3L1800008',
    category: 'SUV', mileage: '49,000 km',
    fuel: 'Hybrid', transmission: 'Automatic',
    condition: 'Good', damage: 'None', color: 'Crystal White Pearl',
    startingBid: 28000, currentBid: 31600,
    highestBidder: 'inga_m',
    auctionEnd: Date.now() + 1000 * 60 * 60 * 8,
    status: 'live',
    description:
      'Plug-in hybrid XC60 Momentum. Family-oriented luxury SUV with panoramic roof, ' +
      'leather seats, and Volvo Pilot Assist semi-autonomous driving system.',
    images: [
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80',
    ],
    bids: [
      { user: 'inga_m', amount: 29000, time: '07:30' },
      { user: 'inga_m', amount: 31600, time: '08:55' },
    ],
    comments: [
      { user: 'inga_m', text: 'Does it come with a charging cable?', time: '07:10', likes: 2 },
    ],
  },
];

export const USERS_DB = [
  { id: 1, name: 'Aleksas P.', email: 'aleksas@mail.lt', joined: 'Jan 2025', bids: 12, won: 2, status: 'active' },
  { id: 2, name: 'Marta K.',   email: 'marta@mail.lt',   joined: 'Feb 2025', bids: 8,  won: 1, status: 'active' },
  { id: 3, name: 'Jonas V.',   email: 'jonas@mail.lt',   joined: 'Mar 2025', bids: 5,  won: 0, status: 'active' },
  { id: 4, name: 'Rasa J.',    email: 'rasa@mail.lt',    joined: 'Mar 2025', bids: 3,  won: 1, status: 'active' },
  { id: 5, name: 'Eglė S.',    email: 'egle@mail.lt',    joined: 'Apr 2025', bids: 7,  won: 2, status: 'blocked' },
];

export const NOTIFICATIONS = [
  { id: 1, text: 'You were outbid on BMW 5 Series!',       type: 'warning', time: '2 min ago'   },
  { id: 2, text: 'VW Tiguan auction ends in 1 hour',        type: 'info',    time: '58 min ago'  },
  { id: 3, text: 'Your bid on Audi A4 was approved ✓',     type: 'success', time: '2 hours ago' },
];

export const PENDING_BIDS_INITIAL = [
  { id: 1, car: '2020 BMW 5 Series',       user: 'aleksas_p', amount: 21800, submitted: '14:47', status: 'pending' },
  { id: 2, car: '2021 VW Tiguan',          user: 'rasa_j',    amount: 26400, submitted: '11:30', status: 'pending' },
  { id: 3, car: '2022 Audi A4',            user: 'egle_s',    amount: 34200, submitted: '09:25', status: 'pending' },
  { id: 4, car: '2019 Mercedes C-Class',   user: 'vilius_m',  amount: 23500, submitted: '09:40', status: 'pending' },
];
