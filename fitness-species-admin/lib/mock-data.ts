export type ProductStatus = "pending" | "approved" | "rejected";

export interface Product {
  id: string;
  name: string;
  brand: string;
  seller: string;
  sellerEmail: string;
  sellerStatus: "approved" | "pending" | "suspended";
  category: string;
  subcategory: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  submitted: string;
  approvedDate?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  status: ProductStatus;
  sku: string;
  image: string;
  gallery: string[];
  description: string;
  specifications: Record<string, string>;
  variants: Array<{ label: string; value: string }>;
  sellerInfo: {
    business: string;
    contact: string;
    address: string;
  };
}

export interface Seller {
  id: string;
  name: string;
  business: string;
  email: string;
  products: number;
  status: "approved" | "pending" | "rejected" | "suspended";
  joined: string;
}

export const dashboardStats = [
  { label: "Pending Reviews", value: 42, tone: "warning", action: "Review Products" },
  { label: "Approved Products", value: 1843, tone: "success", action: "View Catalog" },
  { label: "Rejected Products", value: 89, tone: "danger", action: "Inspect" },
  { label: "Active Sellers", value: 316, tone: "info", action: "Manage Sellers" },
];

export const products: Product[] = [
  {
    id: "ALK-1221",
    name: "VitaFuel Whey Protein",
    brand: "Fitness Species",
    seller: "ABC Nutrition",
    sellerEmail: "hello@abcnutrition.co",
    sellerStatus: "approved",
    category: "Supplements",
    subcategory: "Protein",
    price: 49.99,
    stock: 128,
    lowStockThreshold: 30,
    submitted: "2026-10-03",
    status: "pending",
    sku: "FS-WHEY-500",
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Premium whey protein blend designed for muscle recovery, lean gain support, and daily performance nutrition. Clean formulation with vanilla bean flavoring and no artificial fillers.",
    specifications: {
      Protein: "24g per serving",
      Serving: "30 servings",
      Flavor: "Vanilla Bean",
      Sweetener: "Stevia + monk fruit",
      Certifications: "NSF Certified",
    },
    variants: [
      { label: "Flavor", value: "Vanilla Bean" },
      { label: "Size", value: "2 lb" },
      { label: "Mixability", value: "Excellent" },
    ],
    sellerInfo: {
      business: "ABC Nutrition Ltd.",
      contact: "Aisha Khan",
      address: "Bengaluru, Karnataka",
    },
  },
  {
    id: "ALK-1188",
    name: "HydratePro Electrolyte",
    brand: "ALK Labs",
    seller: "Peak Form Co",
    sellerEmail: "ops@peakform.com",
    sellerStatus: "approved",
    category: "Supplements",
    subcategory: "Hydration",
    price: 24.5,
    stock: 18,
    lowStockThreshold: 25,
    submitted: "2026-10-02",
    status: "pending",
    sku: "FS-HYDR-350",
    image:
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee0c4e1?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee0c4e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Rapid hydration blend for post-workout refreshment, endurance support, and daily electrolyte balance. Includes sodium, potassium, magnesium, and trace minerals.",
    specifications: {
      Sodium: "250 mg",
      Potassium: "180 mg",
      Magnesium: "60 mg",
      Calories: "0",
      Flavor: "Lime Citrus",
    },
    variants: [
      { label: "Flavor", value: "Lime Citrus" },
      { label: "Pack", value: "30 sachets" },
      { label: "Goal", value: "Hydration" },
    ],
    sellerInfo: {
      business: "Peak Form Co.",
      contact: "Rohit Das",
      address: "Pune, Maharashtra",
    },
  },
  {
    id: "ALK-9034",
    name: "CoreFlex Resistance Bands",
    brand: "TrainSmart",
    seller: "Urban Strength",
    sellerEmail: "care@urbanstrength.in",
    sellerStatus: "pending",
    category: "Fitness Equipment",
    subcategory: "Mobility",
    price: 39.0,
    stock: 200,
    lowStockThreshold: 40,
    submitted: "2026-09-28",
    status: "approved",
    approvedDate: "2026-09-30",
    sku: "FS-BAND-SET",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Premium latex resistance band set for strength training, recovery, and mobility routines with varied tension options for progressive training.",
    specifications: {
      Material: "Natural latex",
      Tension: "Medium to heavy",
      Includes: "5 bands",
      Use: "Home gym + travel",
      Warranty: "90 days",
    },
    variants: [
      { label: "Set", value: "5 band set" },
      { label: "Color", value: "Black/Orange" },
      { label: "Goal", value: "Strength" },
    ],
    sellerInfo: {
      business: "Urban Strength",
      contact: "Nisha Reddy",
      address: "Hyderabad, Telangana",
    },
  },
  {
    id: "ALK-7416",
    name: "PowerLift Knee Sleeve",
    brand: "FlexForge",
    seller: "StrongEdge",
    sellerEmail: "team@strongedge.io",
    sellerStatus: "approved",
    category: "Gym Wear",
    subcategory: "Support",
    price: 29.99,
    stock: 74,
    lowStockThreshold: 15,
    submitted: "2026-09-22",
    status: "rejected",
    rejectedDate: "2026-09-24",
    rejectionReason: "Poor image quality",
    sku: "FS-KNEE-PRV",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Compression knee sleeve with ergonomic support and targeted pressure distribution, ideal for stability and pain management during intense training.",
    specifications: {
      Material: "Nylon + spandex",
      Compression: "Medium",
      Sizes: "S to XL",
      Use: "Weightlifting + rehab",
      Color: "Black/Gray",
    },
    variants: [
      { label: "Size", value: "M" },
      { label: "Color", value: "Black" },
      { label: "Fit", value: "Compression" },
    ],
    sellerInfo: {
      business: "StrongEdge",
      contact: "Meera Shah",
      address: "Ahmedabad, Gujarat",
    },
  },
  {
    id: "ALK-8754",
    name: "RallyGrip Foam Roller",
    brand: "MotionPrime",
    seller: "CalmMotion",
    sellerEmail: "team@calmmotion.com",
    sellerStatus: "approved",
    category: "Fitness Equipment",
    subcategory: "Recovery",
    price: 32.0,
    stock: 60,
    lowStockThreshold: 20,
    submitted: "2026-10-01",
    status: "pending",
    sku: "FS-ROLLER-42",
    image:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "High-density foam roller for deep tissue massage, muscle recovery, and mobility drills that keep performance routines consistent and pain-free.",
    specifications: {
      Density: "High",
      Length: "36 cm",
      Material: "Eva foam",
      Weight: "0.8 kg",
      Use: "Recovery + mobility",
    },
    variants: [
      { label: "Length", value: "36 cm" },
      { label: "Color", value: "Black" },
      { label: "Bundle", value: "Includes strap" },
    ],
    sellerInfo: {
      business: "CalmMotion",
      contact: "Vikram Iyer",
      address: "Chennai, Tamil Nadu",
    },
  },
  {
    id: "ALK-4412",
    name: "MuscleFuel BCAA",
    brand: "SportLine",
    seller: "WellCore Labs",
    sellerEmail: "sales@wellcorelabs.in",
    sellerStatus: "approved",
    category: "Supplements",
    subcategory: "Amino acids",
    price: 44.0,
    stock: 92,
    lowStockThreshold: 25,
    submitted: "2026-09-25",
    status: "approved",
    approvedDate: "2026-09-26",
    sku: "FS-BCAA-30",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Performance-focused BCAA formula built to support endurance, reduce fatigue, and aid in post-workout recovery during demanding training blocks.",
    specifications: {
      BCAA: "7g per serving",
      Electrolytes: "Added",
      Flavor: "Citrus Burst",
      Freeform: "Sugar-free",
      Batch: "Lot 21A",
    },
    variants: [
      { label: "Flavor", value: "Citrus Burst" },
      { label: "Size", value: "30 servings" },
      { label: "Goal", value: "Recovery" },
    ],
    sellerInfo: {
      business: "WellCore Labs",
      contact: "Deepa Nair",
      address: "Kochi, Kerala",
    },
  },
];

export const sellers: Seller[] = [
  { id: "S-1001", name: "Aisha Khan", business: "ABC Nutrition", email: "hello@abcnutrition.co", products: 14, status: "approved", joined: "2026-02-10" },
  { id: "S-1002", name: "Rohit Das", business: "Peak Form Co", email: "ops@peakform.com", products: 9, status: "pending", joined: "2026-03-18" },
  { id: "S-1003", name: "Nisha Reddy", business: "Urban Strength", email: "care@urbanstrength.in", products: 6, status: "approved", joined: "2026-01-04" },
  { id: "S-1004", name: "Meera Shah", business: "StrongEdge", email: "team@strongedge.io", products: 11, status: "rejected", joined: "2025-12-15" },
  { id: "S-1005", name: "Vikram Iyer", business: "CalmMotion", email: "team@calmmotion.com", products: 8, status: "suspended", joined: "2026-04-01" },
];

export const categories = [
  { name: "Supplements", count: 648, status: "active" },
  { name: "Medicines / Wellness", count: 221, status: "active" },
  { name: "Gym Wear", count: 413, status: "active" },
  { name: "Fitness Equipment", count: 286, status: "review" },
  { name: "Footwear", count: 177, status: "draft" },
  { name: "Snacks", count: 333, status: "active" },
];

export const notifications = [
  { title: "New product submitted", details: "VitaFuel Whey Protein was submitted by ABC Nutrition", time: "2 min ago", unread: true },
  { title: "Product approved", details: "MuscleFuel BCAA moved to approved catalog", time: "26 min ago", unread: true },
  { title: "Product rejected", details: "PowerLift Knee Sleeve rejected for poor image quality", time: "1 hr ago", unread: false },
  { title: "New seller registration", details: "FitForge Labs requested verification", time: "3 hrs ago", unread: false },
  { title: "System alert", details: "API latency is trending above normal thresholds", time: "Today", unread: true },
];
