import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Save, Loader2, Sparkles, CheckCircle2, Upload, X } from "lucide-react";
import { useGetResume, useSaveResume, getGetResumeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Resume() {
  const { data: resume, isLoading } = useGetResume();
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("upload");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (resume?.content) {
      setContent(resume.content);
      if (activeTab === "upload" && resume.content) {
        setFileName("resume.pdf");
      }
    }
  }, [resume]);

  const saveMutation = useSaveResume({
    mutation: {
      onSuccess: () => {
        toast({ title: "Resume saved successfully", description: "AI will now use this for job matching." });
        queryClient.invalidateQueries({ queryKey: getGetResumeQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to save resume", variant: "destructive" });
      }
    }
  });

  const handleSave = () => {
    if (content.length < 50) {
      toast({
        title: "Resume too short",
        description: "Please enter at least 50 characters so the AI has enough context.",
        variant: "destructive"
      });
      return;
    }
    saveMutation.mutate({ data: { content } });
  };

  const uploadPdf = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast({ title: "Invalid file type", description: "Please upload a PDF file.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload a PDF under 10MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/resume/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setContent(data.content);
      queryClient.invalidateQueries({ queryKey: getGetResumeQueryKey() });
      toast({
        title: "PDF uploaded successfully",
        description: `Extracted ${data.content.length.toLocaleString()} characters from ${file.name}.`
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
      setFileName(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPdf(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadPdf(file);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight mb-4 flex items-center gap-4">
          My Resume
          {resume && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
        </h1>
        <p className="text-lg text-muted-foreground">
          Upload your PDF resume or paste the text. The AI uses this to score and rank every job match.
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-border/50 bg-background/50">
          {(["upload", "paste"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "upload" ? "Upload PDF" : "Paste Text"}
            </button>
          ))}
        </div>

        {activeTab === "upload" && (
          <div className="p-8">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-primary/50 hover:bg-card/50"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-lg font-semibold text-foreground">Parsing PDF...</p>
                  <p className="text-sm text-muted-foreground mt-2">{fileName}</p>
                </>
              ) : fileName && content ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                  <p className="text-lg font-semibold text-foreground">Resume loaded</p>
                  <p className="text-sm text-muted-foreground mt-2">{fileName} · {content.length.toLocaleString()} chars</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Click to replace</p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold text-foreground mb-2">Drop your PDF here</p>
                  <p className="text-sm text-muted-foreground">or click to browse · max 10MB</p>
                </>
              )}
            </div>

            {content && !uploading && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-primary font-medium bg-primary/10 px-4 py-2 rounded-xl">
                  <Sparkles className="w-4 h-4" />
                  Ready for AI job matching
                </div>
                <button
                  onClick={() => { setFileName(null); setContent(""); }}
                  className="text-muted-foreground hover:text-destructive text-sm flex items-center gap-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "paste" && (
          <>
            <div className="relative p-6 bg-background/50">
              {isLoading ? (
                <div className="w-full h-[500px] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your full resume text here. Include your summary, experience, skills, and education..."
                  className="w-full h-[500px] bg-transparent border-none resize-none outline-none text-foreground placeholder:text-muted-foreground/60 leading-relaxed font-mono text-sm"
                  spellCheck={false}
                />
              )}
              {!content && !isLoading && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-20">
                  <FileText className="w-24 h-24 mb-4" />
                  <p className="text-xl font-medium">Waiting for input...</p>
                </div>
              )}
            </div>

            <div className="bg-card border-t border-border/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-primary font-medium bg-primary/10 px-4 py-2 rounded-xl">
                <Sparkles className="w-4 h-4" />
                Used for personalized AI scoring
              </div>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending || isLoading}
                className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_-5px] shadow-primary/30 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Resume
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
