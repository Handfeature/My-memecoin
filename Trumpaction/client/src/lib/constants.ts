export const COIN_NAME = "Coin Trump and Elon";
export const COIN_SYMBOL = "T&E";
export const COIN_CONTRACT = "quwRZWAnL2rmDuMhXGWZm9qaaUCsVfLLKYdU9bupump";
export const TOTAL_SUPPLY = "1,000,000,000,000";
export const NETWORK = "Solana";
export const PLATFORM = "Pump Fun";
export const LISTING_PRICE = "$0.0000127";
export const INITIAL_MARKET_CAP = "$4.2M";

export const CURRENT_PRICE = "$0.0000327";
export const MARKET_CAP = "$14.5M";
export const HOLDERS = "24,731";
export const LIQUIDITY = "$2.73M";

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  socials: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    telegram?: string;
    discord?: string;
    instagram?: string;
  };
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Alex Satoshi",
    role: "Founder & CEO",
    bio: "Former blockchain developer at a major exchange with 8+ years experience.",
    socials: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Sarah Wei",
    role: "CTO",
    bio: "Smart contract specialist with focus on security and optimization.",
    socials: {
      twitter: "#",
      linkedin: "#",
      github: "#"
    }
  },
  {
    name: "Mike Hodler",
    role: "Marketing Lead",
    bio: "Crypto influencer and marketing strategist with deep community connections.",
    socials: {
      twitter: "#",
      telegram: "#",
      instagram: "#"
    }
  },
  {
    name: "Jessica Moon",
    role: "Community Manager",
    bio: "Growing and nurturing communities across Discord, Telegram, and Twitter.",
    socials: {
      twitter: "#",
      discord: "#",
      telegram: "#"
    }
  }
];

export type RoadmapPhase = {
  number: number;
  title: string;
  items: {
    name: string;
    completed: boolean;
  }[];
  progress: number;
};

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    number: 1,
    title: "Phase 1: Launch",
    items: [
      { name: "Website Launch", completed: true },
      { name: "Community Building", completed: true },
      { name: "Token Launch on Uniswap", completed: true },
      { name: "CoinGecko & CoinMarketCap Listing", completed: true }
    ],
    progress: 100
  },
  {
    number: 2,
    title: "Phase 2: Growth",
    items: [
      { name: "Expanded Marketing Campaign", completed: true },
      { name: "Influencer Partnerships", completed: true },
      { name: "CEX Listings (Tier 2 Exchanges)", completed: false },
      { name: "Community Governance System", completed: false }
    ],
    progress: 50
  },
  {
    number: 3,
    title: "Phase 3: Expansion",
    items: [
      { name: "Major CEX Listings", completed: false },
      { name: "NFT Collection Launch", completed: false },
      { name: "Staking Platform", completed: false },
      { name: "Cross-Chain Integration", completed: false }
    ],
    progress: 0
  },
  {
    number: 4,
    title: "Phase 4: Metaverse",
    items: [
      { name: "Metaverse Integration", completed: false },
      { name: "Virtual Trump & Elon World", completed: false },
      { name: "Play-to-Earn Game Launch", completed: false },
      { name: "Global Brand Partnerships", completed: false }
    ],
    progress: 0
  }
];

export type FAQ = {
  question: string;
  answer: string;
};

export const FAQS: FAQ[] = [
  {
    question: "What is TRUMP&ELON Coin?",
    answer: "TRUMP&ELON is a community-driven meme coin that celebrates the influence of two of the most powerful personalities in the crypto and business world. Our goal is to create a vibrant ecosystem that rewards holders while contributing to the broader crypto community."
  },
  {
    question: "How can I buy TRUMP&ELON?",
    answer: "You can purchase TRUMP&ELON on Uniswap by connecting your wallet and swapping ETH for $TELCOIN. Always verify the contract address to ensure you're buying the authentic token. Check our \"How to Buy\" section for detailed instructions."
  },
  {
    question: "Is the token contract audited?",
    answer: "Yes, the TRUMP&ELON smart contract has been audited by CertiK, a leading blockchain security firm. The audit report can be found on our website, providing transparency and security for all our holders."
  },
  {
    question: "What are the tokenomics?",
    answer: "TRUMP&ELON has a total supply of 1 trillion tokens. 40% is allocated to public sale, 25% to liquidity, 15% to marketing, 10% to the team, and 10% split between reserve and ecosystem development. A 4% buy tax and 6% sell tax are used to fund marketing, add liquidity, and reward holders."
  },
  {
    question: "How is liquidity secured?",
    answer: "Liquidity is locked for 1 year using a trusted third-party service. This ensures price stability and prevents rug pulls, giving our community confidence in the project's long-term viability."
  }
];

export type TokenDistribution = {
  name: string;
  value: number;
  color: string;
};

export const TOKEN_DISTRIBUTION: TokenDistribution[] = [
  { name: "Public Sale", value: 40, color: "hsl(24, 100%, 50%)" },
  { name: "Liquidity", value: 25, color: "hsl(263, 87%, 33%)" },
  { name: "Marketing", value: 15, color: "hsl(196, 85%, 62%)" },
  { name: "Team", value: 10, color: "hsl(142, 71%, 45%)" },
  { name: "Reserve", value: 5, color: "hsl(260, 88%, 63%)" },
  { name: "Ecosystem", value: 5, color: "hsl(336, 78%, 64%)" }
];

export type TransactionTax = {
  name: string;
  value: number;
};

export const BUY_TAX: TransactionTax[] = [
  { name: "Marketing", value: 2 },
  { name: "Liquidity", value: 2 }
];

export const SELL_TAX: TransactionTax[] = [
  { name: "Marketing", value: 2 },
  { name: "Liquidity", value: 2 },
  { name: "Development", value: 1 },
  { name: "Rewards", value: 1 }
];

export const BUY_TAX_TOTAL = BUY_TAX.reduce((acc, tax) => acc + tax.value, 0);
export const SELL_TAX_TOTAL = SELL_TAX.reduce((acc, tax) => acc + tax.value, 0);
