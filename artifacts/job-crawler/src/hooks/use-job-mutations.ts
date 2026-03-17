import { useSaveJob, useDeleteJob } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export function useJobMutations() {
  const { toast } = useToast();

  const saveMutation = useSaveJob({
    mutation: {
      onSuccess: () => {
        toast({ title: "Job saved", description: "Job has been saved to your list." });
      },
      onError: () => {
        toast({ title: "Failed to save job", variant: "destructive" });
      }
    }
  });

  const deleteMutation = useDeleteJob({
    mutation: {
      onSuccess: () => {
        toast({ title: "Job removed", description: "Job has been removed from your list." });
      },
      onError: () => {
        toast({ title: "Failed to remove job", variant: "destructive" });
      }
    }
  });

  return { saveMutation, deleteMutation };
}
