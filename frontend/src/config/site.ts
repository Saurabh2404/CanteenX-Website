export const site = {
  name: "ARDH SAINIK CANTEEN",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001",
  indexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true",
  address:
    "1st Floor, SS-Complex, Station Road, opposite Block Gate, Kanti, Muzaffarpur, Bihar 843109",
  phone: "+91 73559 73262",
  mapsUrl: "https://www.google.com/maps?cid=1937612327649874251",
  reviewUrl: "https://www.google.com/maps?cid=1937612327649874251",
  hours: "",
};
export const categories = [
  {
    slug: "food",
    name: "Food & snacks",
    hindi: "खाद्य पदार्थ और नाश्ता",
    detail: "Dates, muesli and packaged foods",
    tone: "peach",
  },
  {
    slug: "beverages",
    name: "Beverages",
    hindi: "चाय और पेय पदार्थ",
    detail: "Tea, coffee and everyday drinks",
    tone: "cream",
  },
  {
    slug: "cooking-foods",
    name: "Cooking essentials",
    hindi: "रसोई का राशन",
    detail: "Rice, flour, pulses and oils",
    tone: "sage",
  },
  {
    slug: "cleaning",
    name: "Cleaning items",
    hindi: "सफाई का सामान",
    detail: "Laundry and home care",
    tone: "blue",
  },
  {
    slug: "cooking-items",
    name: "Kitchen & cookware",
    hindi: "रसोई के उपकरण",
    detail: "Cooktops and kitchen appliances",
    tone: "sand",
  },
  {
    slug: "personal-care",
    name: "Personal care",
    hindi: "व्यक्तिगत देखभाल",
    detail: "Soap, shampoo and skin care",
    tone: "rose",
  },
  {
    slug: "daily-items",
    name: "Daily items",
    hindi: "रोज़मर्रा की ज़रूरतें",
    detail: "Family and household essentials",
    tone: "lavender",
  },
];
