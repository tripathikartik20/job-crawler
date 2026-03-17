import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, Loader2, MapPin, Sparkles, AlertCircle, Database } from "lucide-react";
import { Link } from "wouter";
import { useSearchJobs, useGetResume, type Job } from "@workspace/api-client-react";
import { useJobMutations } from "@/hooks/use-job-mutations";
import { JobCard } from "@/components/JobCard";

export default function Search() {
  const [results, setResults] = useState<Job[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");

  const { data: resume } = useGetResume();

  const searchMutation = useSearchJobs({
    mutation: {
      onSuccess: (data) => {
        setResults(data);
        setHasSearched(true);
      }
    }
  });

  const { saveMutation, deleteMutation } = useJobMutations();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim()) return;
    setHasSearched(false);
    searchMutation.mutate({
      data: {
        keywords: keywords.trim(),
        location: location.trim() || undefined,
        resumeId: resume?.id
      }
    });
  };

  const handleSave = (job: Job) => {
    saveMutation.mutate({ id: job.id, data: job }, {
      onSuccess: () => setResults(prev => prev.map(j => j.id === job.id ? { ...j, saved: true } : j))
    });
  };

  const handleUnsave = (id: string) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => setResults(prev => prev.map(j => j.id === id ? { ...j, saved: false } : j))
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight mb-4">
          Find Your Next Role
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          We crawl LinkedIn for the latest openings and use AI to score them against your resume. All results are automatically saved to the database.
        </p>
      </div>

      {!resume?.content && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-400 flex items-start gap-4 shadow-lg shadow-yellow-500/5"
        >
          <div className="p-2 bg-yellow-500/20 rounded-lg shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-300 mb-1">Boost your search with AI</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              For personalized AI match scores, <Link href="/resume" className="underline font-medium hover:text-yellow-200 transition-colors">upload your resume first</Link>.
              Jobs will be ranked based on how well your skills align.
            </p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSearch} className="mb-12 bg-card border border-border/50 p-2 md:p-3 rounded-[2rem] shadow-xl flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex items-center bg-background rounded-2xl px-5 py-2 md:py-0 border border-border/50 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <SearchIcon className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
          <input
            type="text"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            placeholder="Job Title, Keywords, or Company"
            className="w-full bg-transparent border-none outline-none py-4 text-foreground placeholder:text-muted-foreground font-medium"
            required
          />
        </div>
        <div className="flex items-center bg-background rounded-2xl px-5 py-2 md:py-0 border border-border/50 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all md:w-64">
          <MapPin className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Location (optional)"
            className="w-full bg-transparent border-none outline-none py-4 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="submit"
          disabled={searchMutation.isPending || !keywords.trim()}
          className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_-10px] shadow-primary/50 active:scale-[0.97] flex items-center justify-center gap-2 md:min-w-[140px]"
        >
          {searchMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <SearchIcon className="w-5 h-5" />
              Search
            </>
          )}
        </button>
      </form>

      {searchMutation.isError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">Search failed. Please try again.</p>
        </motion.div>
      )}

      {searchMutation.isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card/40 border border-border/60 rounded-3xl p-6 h-72 flex flex-col">
              <div className="w-3/4 h-6 bg-muted rounded-md animate-pulse mb-3" />
              <div className="w-1/2 h-4 bg-muted/50 rounded-md animate-pulse mb-6" />
              <div className="w-1/2 h-5 bg-muted rounded-md animate-pulse mb-4" />
              <div className="w-full h-24 bg-muted/50 rounded-xl animate-pulse mt-auto" />
              <div className="flex gap-3 mt-4">
                <div className="flex-1 h-12 bg-muted rounded-xl animate-pulse" />
                <div className="w-12 h-12 bg-muted rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {!searchMutation.isPending && hasSearched && results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 mb-6 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl w-fit">
              <Database className="w-4 h-4" />
              <span>{results.length} jobs found and auto-saved to database</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSave={handleSave}
                  onUnsave={handleUnsave}
                />
              ))}
            </div>
          </motion.div>
        )}

        {!searchMutation.isPending && hasSearched && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-card/20 backdrop-blur-sm border border-border/50 rounded-3xl border-dashed"
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-3">No jobs found</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              We couldn't find any matches for your criteria. Try broadening your search terms or location.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
