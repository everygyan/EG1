import type { Article } from '../types';

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'hero-ai-chip',
    title: "AI's Fastest Chip Has a Dirty Secret: It Needs Its Own Power Plant",
    subtitle: '1,500 watts per GPU, 120 kW per rack, roughly 100 American homes',
    excerpt: 'The newest generation of AI compute accelerators demands so much power that tech hyperscalers are acquiring dedicated nuclear and geothermal plants just to keep datacenters cool.',
    content: `Silicon Valley’s insatiable hunger for compute has reached an unprecedented energy threshold. The latest generation of tensor processors and multi-die accelerators draws over 1,500 watts per package. When clustered into standard 72-GPU compute racks, a single cabinet consumes upwards of 120 kilowatts—equivalent to the continuous power demand of nearly 100 average suburban households.

### The Nuclear Option
Major cloud providers are no longer just building server racks near existing power grids. In recent months, multi-billion-dollar power purchase agreements have been inked directly with nuclear reactors and advanced geothermal startups.

"We have hit the thermal wall and the grid wall simultaneously," explains Dr. Elena Rostova, principal compute architect at Apex Systems. "Ten years ago, efficiency improvements kept pace with model scaling. Now, raw model parameters are growing faster than Dennard scaling ever allowed. You cannot train a 10-trillion parameter multimodal frontier model on municipal grid slack."

### Liquid Cooling is No Longer Optional
Traditional forced-air cooling towers are obsolete in these hyper-density clusters. Direct-to-chip liquid micro-channels and two-phase dielectric submersion tanks are quickly becoming standard datacenter architecture.

Yet even with optimal cooling, the local environmental impact is sparking heated debates in municipal councils from Northern Virginia to the outskirts of Dublin. Energy regulators are now weighing whether AI training runs should be restricted during peak summer grid demand hours.`,
    category: 'TECH',
    subCategory: 'AI',
    author: {
      name: 'Devansh',
      role: 'Founder & FullStack Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    date: 'Oct 18, 2026',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=85',
    isTopStory: true,
    isBreaking: true,
    claps: 1420,
    commentsCount: 84,
    tags: ['AI', 'Datacenters', 'Hardware', 'Energy', 'Semiconductors'],
    comments: [
      {
        id: 'c1',
        author: 'Marcus Vance',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        timestamp: '2 hours ago',
        content: 'The move to SMRs (Small Modular Reactors) seems like the only viable path forward if compute demands continue this exponential curve.',
        likes: 19
      },
      {
        id: 'c2',
        author: 'Dr. Sarah Lin',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        timestamp: '4 hours ago',
        content: 'Fascinating report. But we also need algorithmic efficiency gains—not just brute-forcing trillion-parameter dense models.',
        likes: 31
      }
    ]
  },
  {
    id: 'hero-neural-core',
    title: 'The Biomorphic Computing Era: Synthetic Synapses Outperform Silicon in Real-Time Logic',
    subtitle: 'Zero idle power dissipation and near-instantaneous pattern recognition',
    excerpt: 'Neuromorphic chips that mimic biological neuronal firing rates are officially leaving the laboratory and entering consumer aerospace systems.',
    content: `Biomorphic computing has achieved its defining industrial benchmark. In controlled field testing across automated navigation systems, asynchronous neuromorphic sensor cores responded to edge anomalies 40 times faster than state-of-the-art GPU edge modules while drawing less than 3 percent of the electrical wattage.

By encoding inputs as spike trains rather than continuous 32-bit floating point vectors, these chips do not consume static energy when idle. The development promises to revolutionize everything from planetary rovers to wearable health monitors.`,
    category: 'TECH',
    subCategory: 'Gadgets',
    author: {
      name: 'Devansh',
      role: 'AI & Systems Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    date: 'Oct 17, 2026',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85',
    isTopStory: true,
    claps: 890,
    commentsCount: 42,
    tags: ['Neuromorphic', 'Silicon', 'Robotics', 'Innovation'],
  },
  {
    id: 'hero-space-flight',
    title: 'Orbital Living Reaches Inflection Point as Private Space Stations Clear Final Safety Tests',
    subtitle: 'Inflatable pressurized modules prepare for life after the International Space Station',
    excerpt: 'Commercial habitats featuring modular artificial gravity sections are scheduled to welcome their first multinational science crews early next year.',
    content: `With the decommissioning timeline for the International Space Station officially locked in, commercial aerospace consortia are racing to deploy the next generation of orbital infrastructure.

Recent vacuum and high-velocity debris tests for multi-layered Vectran inflatable modules yielded zero integrity failures across 1,000 hours of continuous pressurization. The private stations feature dedicated cleanroom laboratory berths designed specifically for microgravity pharmaceutical crystallization and high-purity optical fiber manufacturing.`,
    category: 'TECH',
    subCategory: 'Innovation',
    author: {
      name: 'Devansh',
      role: 'Deep Tech & Science Columnist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    date: 'Oct 16, 2026',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=85',
    isTopStory: true,
    claps: 615,
    commentsCount: 29,
    tags: ['Space', 'Aerospace', 'Science', 'Engineering'],
  },

  // TRENDING ARTICLES (Exact from screenshot 01 - 05)
  {
    id: 'trend-01',
    title: 'Beyond the Glow: How Bipasha Basu is Redefining Postpartum Fitness and Resilience',
    excerpt: 'A raw, candid conversation on breaking unrealistic maternal beauty stereotypes, embracing mental equilibrium, and returning to functional athletics.',
    content: `In an era dominated by hyper-filtered social media depictions of post-pregnancy 'snapbacks', Bollywood icon Bipasha Basu has taken a refreshingly transparent path. 

"Motherhood is an internal rewiring of your biological and emotional architecture," Basu shares in an exclusive interview. "The obsession with getting back to a pre-baby waistline in six weeks is toxic and spiritually damaging. My journey has been about rebuilding core stability, respecting recovery timelines, and prioritizing mental clarity."

Experts and fitness trainers praise her holistic philosophy, which emphasizes restorative mobility, pelvic floor rehabilitation, and balanced Ayurvedic nutrition over aggressive calorie restriction. Her advocacy has sparked a viral conversation among modern parents seeking authenticity in maternal health.`,
    category: 'HEALTH',
    subCategory: 'Wellness',
    author: {
      name: 'Rhea Sen',
      role: 'Lifestyle & Wellness Editor',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    },
    date: 'Oct 18, 2026',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80',
    isTrending: true,
    trendingRank: 1,
    claps: 2310,
    commentsCount: 112,
    tags: ['Health', 'Fitness', 'Wellness', 'Culture'],
  },
  {
    id: 'trend-02',
    title: "The Revolving Door at OpenAI: Why Barret Zoph's Rapid Exit Signals Growing Pains",
    excerpt: 'Key technical architects and safety leads continue their departure to rival research hubs, sparking intense debates on governance and research velocity.',
    content: `The departure of veteran AI architect Barret Zoph marks yet another critical chapter in the talent realignment sweeping leading foundation model labs. As commercial product deadlines tighten and corporate partnerships demand accelerated monetization, researchers who spearheaded fundamental pre-training breakthroughs are evaluating alternatives.

Insiders report an emerging philosophical division between pure exploratory research teams and product-focused delivery units. While executives maintain that restructuring is a natural phase of growth for a multi-thousand employee enterprise, competitor labs are aggressively offering unconstrained compute budgets and equity packages to attract departed talent.`,
    category: 'TECH',
    subCategory: 'AI',
    author: {
      name: 'Kavita Menon',
      role: 'Silicon Valley Correspondent',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    },
    date: 'Oct 17, 2026',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    isTrending: true,
    trendingRank: 2,
    claps: 1845,
    commentsCount: 94,
    tags: ['OpenAI', 'Tech', 'AI', 'Silicon Valley'],
  },
  {
    id: 'trend-03',
    title: "The Telegram Dilemma: Why India's Looming Ban Could Change Digital Freedom Forever",
    excerpt: 'Regulatory scrutiny over content moderation and law enforcement cooperation puts the messaging giant in a high-stakes standoff with telecommunications authorities.',
    content: `India’s cybersecurity agencies and ministry of electronics have issued an ultimatum regarding compliance protocols for peer-to-peer encrypted communications networks. At the epicenter of this confrontation is Telegram, with over 150 million active Indian users who rely on the platform for educational channels, small business operations, and community groups.

Civil liberties advocates caution that an outright blockade would disrupt legitimate commerce and set a troubling precedent for end-to-end encrypted protocols. Meanwhile, state authorities insist that unregulated broadcast channels facilitate cyber-extortion schemes and pirated intellectual property with near impunity. The coming judicial hearings could redefine digital privacy frameworks across South Asia.`,
    category: 'TECH',
    subCategory: 'Mobile',
    author: {
      name: 'Aditya Nair',
      role: 'Legal & Tech Analyst',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    },
    date: 'Oct 17, 2026',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80',
    isTrending: true,
    trendingRank: 3,
    claps: 1420,
    commentsCount: 78,
    tags: ['Telegram', 'Privacy', 'India', 'Policy', 'Tech'],
  },
  {
    id: 'trend-04',
    title: 'Faf du Plessis Shatters Records in Electrifying T20 Masterclass: A Tactical Breakdown',
    excerpt: 'An exhibition of bat-speed, field manipulation, and biological peak performance at age 41 leaves analysts stunned and franchises recalculating veteran valuations.',
    content: `Age continues to look like a mere clerical technicality for Faf du Plessis. In a breathtaking 52-ball masterclass, the veteran captain dismantled one of the tournament's most revered pace attacks, combining wristy scoops with authoritative pull shots that defied aerodynamic expectations.

A granular tactical review of his innings reveals how du Plessis pre-meditated length variations by capitalizing on the bowler's release angles. His rotational strike rate against finger spin stood at a clinical 188%, ensuring zero score stagnancy during the middle overs. Modern sports science protocols and hyperbaric recovery therapies are clearly extending athletic longevity in premier franchise cricket.`,
    category: 'SPORTS',
    subCategory: 'Cricket',
    author: {
      name: 'Sunil Rao',
      role: 'Senior Cricket Analyst',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    },
    date: 'Oct 16, 2026',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=400&q=80',
    isTrending: true,
    trendingRank: 4,
    claps: 1102,
    commentsCount: 56,
    tags: ['Cricket', 'T20', 'Sports', 'Faf du Plessis'],
  },
  {
    id: 'trend-05',
    title: "Black Caps Dominate: Phillips' Century and Henry's Spell Power New Zealand Past England",
    excerpt: 'A disciplined exhibition of seam bowling in overcast conditions complemented by blistering lower-order hitting seals a historic series triumph.',
    content: `Matt Henry bowled with vicious seam movement under heavy clouds, dismantling England’s top order in a ferocious opening ten overs that yielded four wickets for just nineteen runs.

When Glenn Phillips walked into bat under pressure, he transformed an otherwise precarious chase into an aggressive counter-punching clinic, racing to his third international century in just 78 deliveries. The victory solidifies New Zealand’s commanding position atop the World Championship standings and prompts serious soul-searching for the English coaching staff.`,
    category: 'SPORTS',
    subCategory: 'Cricket',
    author: {
      name: 'Liam Crawford',
      role: 'International Cricket Correspondent',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    },
    date: 'Oct 16, 2026',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=400&q=80',
    isTrending: true,
    trendingRank: 5,
    claps: 980,
    commentsCount: 45,
    tags: ['Cricket', 'New Zealand', 'England', 'World Cup'],
  },

  // BREAKING & ADDITIONAL NEWS CUM BLOG ARTICLES
  {
    id: 'break-kochi',
    title: 'Kochi Cracks Down: 30 Wayside Eateries Face Action Over Food Safety Violations',
    excerpt: 'District health inspection squads seize stale meat and unhygienic cooking oils across major transport corridors in coordinated dawn raids.',
    content: `Following multiple citizen complaints regarding foodborne illnesses, enforcement squads from the Food Safety Department initiated surprise crackdowns across 45 roadside food establishments in the greater Kochi metropolitan area.

More than 30 venues were served closure notices or hefty monetary penalties after inspectors uncovered substandard storage facilities, absence of mandatory statutory licenses, and repeated usage of degraded frying oils. Municipal health officers announced that routine spot checks will now operate seven days a week with digital transparency portals for public grievance lodging.`,
    category: 'LATEST NEWS',
    author: {
      name: 'Devansh',
      role: 'Managing Editor',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    date: 'Oct 18, 2026',
    readTime: '2 min read',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    isBreaking: true,
    tags: ['Kochi', 'Food Safety', 'Public Health', 'Civic'],
  },
  {
    id: 'travel-kyoto',
    title: 'The Hidden Alleyways of Kyoto: How Slow Travel Revived Century-Old Tea Houses',
    excerpt: 'Beyond the crowded shrines of Gion lies an intentional cultural renaissance where travelers book artisan tea rituals months in advance.',
    content: `Wandering through the stone-paved lanes of Higashiyama at dawn offers a glimpse into an aesthetic world that rapid overtourism threatened to extinguish. Over the past three years, local craft councils and multigenerational families have pioneered a community-first hospitality charter.

Instead of fleeting photo-stops, visitors partake in immersive two-hour ceremonial tastings of Uji matcha paired with wagashi confectioneries made with heirloom red bean cultivars. The result is a thriving sustainable micro-economy preserving wooden machiya architecture for generations to come.`,
    category: 'TRAVEL',
    subCategory: 'Heritage',
    author: {
      name: 'Kenji Sato',
      role: 'Travel & Cultural Columnist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    date: 'Oct 09, 2026',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    tags: ['Kyoto', 'Japan', 'Travel', 'Culture', 'Tea'],
  },
  {
    id: 'health-sleep',
    title: 'The Glymphatic Reset: Why Sleep Architecture Dictates Cognitive Longevity',
    excerpt: 'Groundbreaking neuroimaging unveils how deep slow-wave sleep actively rinses neurotoxic tau and amyloid buildup from the cerebral cortex.',
    content: `We often view sleep through the passive lens of physical rest, but neuroscientists now recognize it as the brain’s most vigorous biochemical cleansing cycle. Utilizing advanced real-time two-photon microscopy, researchers observed how cerebrospinal fluid surges through brain parenchyma during non-REM stage 3 sleep.

This glymphatic flow functions like an automated municipal sanitation system, washing away misfolded peptides associated with neurodegenerative conditions. Maintaining consistent sleep hygiene, minimizing late-night blue-spectrum radiation, and stabilizing circadian rhythms may well be the most potent preventative health intervention accessible to modern humans.`,
    category: 'HEALTH',
    subCategory: 'Science',
    author: {
      name: 'Dr. Anita Desai',
      role: 'Neuroscience Fellow',
      avatar: 'https://images.unsplash.com/photo-1594824813572-98c474965213?auto=format&fit=crop&w=150&q=80',
    },
    date: 'Oct 15, 2026',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=800&q=80',
    tags: ['Health', 'Sleep', 'Neuroscience', 'Longevity', 'Wellness'],
  },
  {
    id: 'blog-creative-ai',
    title: 'The Renaissance of the Craftsperson: Why High-Touch Human Artistry is Thriving in the Algorithmic Age',
    excerpt: 'As synthetic imagery floods digital feeds, physical bookbinding, bespoke pottery, and analog photography command record valuation.',
    content: `When generative synthesis models made it possible to render flawless digital paintings in six seconds, critics predicted the death of human artistry. What transpired instead was an extraordinary counter-cultural resurgence.

From Tokyo to Brooklyn, waiting lists for hand-bound leather journals, studio ceramics, and medium-format film development workshops have swelled. People crave the tangible friction of imperfect reality—the thumbprint left in clay, the scent of linseed oil, the subtle irregularities of letterpress typography. Technology has not replaced craft; it has sharpened our appreciation for authentic human intentionality.`,
    category: 'OPINION',
    subCategory: 'Culture',
    author: {
      name: 'Julian Thorne',
      role: 'Cultural Essayist',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    },
    date: 'Oct 14, 2026',
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    tags: ['Art', 'Philosophy', 'Craft', 'Culture', 'AI'],
  }
];

export const BREAKING_NEWS_ITEMS = [
  { id: 'b1', text: 'Kochi Cracks Down: 30 Wayside Eateries Face Action Over Food Safety Violations', date: 'Oct 18, 2026' },
  { id: 'b2', text: "AI's Fastest Chip Has a Dirty Secret: It Needs Its Own Power Plant", date: 'Oct 18, 2026' },
  { id: 'b3', text: 'Sensex & Nifty Hit Historic All-Time Highs Amid Strong Domestic Institutional Inflows', date: 'Oct 18, 2026' },
  { id: 'b4', text: 'ISRO Completes Key Cryogenic Engine Endurance Test for Next-Gen Human Spaceflight', date: 'Oct 17, 2026' },
  { id: 'b5', text: 'WHO Issues Updated Guidelines on Global Microplastics Mitigation in Drinking Water', date: 'Oct 17, 2026' },
];

export const NAV_DROPDOWNS: Record<string, { col1: string[]; col2: string[]; linkText: string; linkCat: string }> = {
  TECH: {
    col1: ['AI', 'Gadgets', 'Reviews'],
    col2: ['Mobile', 'Apps', 'How-To'],
    linkText: 'LATEST IN TECH →',
    linkCat: 'TECH',
  },
  HEALTH: {
    col1: ['Fitness', 'Nutrition', 'Mental Health'],
    col2: ['Longevity', 'Sleep Science', 'Medical Breakthroughs'],
    linkText: 'EXPLORE HEALTH DESK →',
    linkCat: 'HEALTH',
  },
  TRAVEL: {
    col1: ['Destinations', 'Solo Travel', 'Eco Tourism'],
    col2: ['Food & Wine', 'Hotel Reviews', 'Travel Hacks'],
    linkText: 'DISCOVER TRAVEL GUIDES →',
    linkCat: 'TRAVEL',
  },
  SPORTS: {
    col1: ['Cricket', 'Football', 'Formula 1'],
    col2: ['Tennis', 'Athletics', 'Tactical Analysis'],
    linkText: 'VIEW SPORTS CENTER →',
    linkCat: 'SPORTS',
  },
};
