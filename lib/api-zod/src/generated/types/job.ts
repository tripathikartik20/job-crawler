export interface Job {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  description?: string | null;
  url: string;
  matchScore?: number | null;
  matchReason?: string | null;
  postedAt?: string | null;
  saved: boolean;
}
