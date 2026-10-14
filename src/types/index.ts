export type Category = 'TECH' | 'LATEST NEWS' | 'HEALTH' | 'TRAVEL' | 'SPORTS' | 'OPINION' | 'BUSINESS';

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  timestamp: string;
  content: string;
  likes: number;
}

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  category: Category;
  subCategory?: string;
  author: {
    name: string;
    role?: string;
    avatar?: string;
  };
  date: string;
  readTime: string;
  imageUrl: string;
  isTopStory?: boolean;
  isBreaking?: boolean;
  isTrending?: boolean;
  trendingRank?: number;
  claps?: number;
  commentsCount?: number;
  comments?: Comment[];
  tags: string[];
}
