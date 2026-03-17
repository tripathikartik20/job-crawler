import { motion } from "framer-motion";
import { MapPin, Sparkles, ExternalLink, Bookmark, BookmarkCheck, Building2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Job } from "@workspace/api-client-react";

export function JobCard({
  job,
  onSave,
  onUnsave
}: {
  job: Job;
  onSave: (job: Job) => void;
  onUnsave: (id: string) => void;
}) {
  const getScoreDetails = (score: number) => {
    if (score >= 80) return { colors: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", glow: "shadow-emerald-500/10" };
    if (score >= 60) return { colors: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", glow: "shadow-yellow-500/10" };
    return { colors: "bg-muted text-muted-foreground border-border", glow: "shadow-none" };
  };

  const handleSaveClick = () => {
    if (job.saved) {
      onUnsave(job.id);
    } else {
      onSave(job);
    }
  };

  const scoreDetails = job.matchScore ? getScoreDetails(job.matchScore) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-card/40 backdrop-blur-xl border border-border/60 hover:border-primary/30 rounded-3xl p-6 transition-all duration-500 flex flex-col h-full shadow-lg shadow-black/20 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10 flex justify-between items-start gap-4 mb-5">
        <div className="flex-1">
          <h3 className="text-xl font-display font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
            <Building2 className="w-4 h-4" />
            {job.company}
          </div>
        </div>
        {job.matchScore && scoreDetails && (
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap shadow-lg flex items-center gap-1.5",
            scoreDetails.colors,
            scoreDetails.glow
          )}>
            {job.matchScore}% Match
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-wrap gap-3 text-xs text-muted-foreground/80 mb-6">
        <div className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1.5 rounded-lg border border-border/50">
          <MapPin className="w-3.5 h-3.5" />
          {job.location || "Remote"}
        </div>
        {job.postedAt && (
          <div className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1.5 rounded-lg border border-border/50">
            <Calendar className="w-3.5 h-3.5" />
            {job.postedAt}
          </div>
        )}
      </div>

      {job.matchReason && (
        <div className="relative z-10 bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-6 mt-auto">
          <div className="flex items-center gap-2 text-primary font-medium mb-2 text-sm">
            <Sparkles className="w-4 h-4" />
            AI Insight
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4">
            {job.matchReason}
          </p>
        </div>
      )}

      {!job.matchReason && job.description && (
        <p className="relative z-10 text-sm text-muted-foreground line-clamp-3 mb-6 mt-auto">
          {job.description}
        </p>
      )}

      <div className="relative z-10 flex gap-3 mt-auto pt-2">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          <ExternalLink className="w-4 h-4" />
          View Job
        </a>
        <button
          onClick={handleSaveClick}
          className={cn(
            "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all active:scale-[0.95]",
            job.saved
              ? "bg-primary/20 border-primary/30 text-primary"
              : "bg-background/50 border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/10"
          )}
          title={job.saved ? "Remove from saved" : "Save job"}
        >
          {job.saved ? (
            <BookmarkCheck className="w-5 h-5" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>
    </motion.div>
  );
}
