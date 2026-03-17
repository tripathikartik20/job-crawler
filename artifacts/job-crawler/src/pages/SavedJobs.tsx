import { motion } from "framer-motion";
import { Bookmark, Loader2, Download, Database } from "lucide-react";
import { Link } from "wouter";
import { useGetSavedJobs, getGetSavedJobsQueryKey, type Job } from "@workspace/api-client-react";
import { useJobMutations } from "@/hooks/use-job-mutations";
import { JobCard } from "@/components/JobCard";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function SavedJobs() {
  const { data: jobs, isLoading } = useGetSavedJobs();
  const { deleteMutation } = useJobMutations();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleUnsave = (id: string) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSavedJobsQueryKey() });
      }
    });
  };

  const handleSave = () => {};

  const handleExportCsv = () => {
    window.open("/api/jobs/export", "_blank");
    toast({ title: "Downloading CSV", description: "Your jobs are being exported." });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight mb-4">
            Saved Jobs
          </h1>
          <p className="text-lg text-muted-foreground">
            All jobs found during searches are stored here. Export to CSV for offline tracking.
          </p>
        </div>

        {jobs && jobs.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border/50 px-4 py-2 rounded-xl">
              <Database className="w-4 h-4 text-primary" />
              <span><span className="font-bold text-foreground">{jobs.length}</span> jobs in DB</span>
            </div>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] shadow-lg shadow-emerald-900/30"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job: Job) => (
            <JobCard
              key={job.id}
              job={job}
              onSave={handleSave}
              onUnsave={handleUnsave}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center bg-card/20 backdrop-blur-sm border border-border/50 rounded-3xl border-dashed"
        >
          <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <Bookmark className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4 text-foreground">No Jobs Yet</h2>
          <p className="text-muted-foreground max-w-md mb-10 text-lg leading-relaxed">
            Jobs are automatically saved to the database when you search. Run a search and they'll appear here — ready to export as CSV anytime.
          </p>
          <Link href="/search" className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-[0_0_30px_-5px] shadow-primary/30 active:scale-[0.98]">
            Search LinkedIn Jobs
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
