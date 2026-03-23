"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GraduationCap, Upload, Play, Loader2, CheckCircle, XCircle, Clock, FolderOpen, Sparkles, RefreshCw } from "lucide-react";
import { uploadTrainingData, startTraining, getTrainingJobs, getTrainedModels } from "@/lib/api";
import clsx from "clsx";

type Tab = "upload" | "jobs" | "models";

interface Job {
    id: string;
    status: string;
    progress?: number;
    name?: string;
    started_at?: number;
}

interface Model {
    name: string;
    path: string;
    created_at?: string;
}

export default function TrainPage() {
    const [tab, setTab] = useState<Tab>("upload");
    const [files, setFiles] = useState<FileList | null>(null);
    const [modelName, setModelName] = useState("");
    const [steps, setSteps] = useState(500);
    const [uploading, setUploading] = useState(false);
    const [training, setTraining] = useState(false);
    const [datasetId, setDatasetId] = useState<string | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [models, setModels] = useState<Model[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const loadJobs = useCallback(async () => {
        try { const d = await getTrainingJobs(); setJobs(Array.isArray(d) ? d : d.jobs ?? []); } catch { }
    }, []);

    const loadModels = useCallback(async () => {
        try { const d = await getTrainedModels(); setModels(Array.isArray(d) ? d : d.models ?? []); } catch { }
    }, []);

    useEffect(() => {
        if (tab === "jobs") loadJobs();
        if (tab === "models") loadModels();
    }, [tab, loadJobs, loadModels]);

    // Auto-refresh jobs every 5s when viewing the jobs tab and there are active jobs
    useEffect(() => {
        if (tab === "jobs") {
            const hasActive = jobs.some((j) => ["training", "loading_model", "starting"].includes(j.status));
            if (hasActive) {
                pollRef.current = setInterval(loadJobs, 5000);
            }
        }
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [tab, jobs, loadJobs]);

    const handleUpload = async () => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setError(null);
        setInfo(null);
        try {
            const res = await uploadTrainingData(files);
            setDatasetId(res.dataset);
            setInfo(`Uploaded ${res.count} file(s) — Dataset: ${res.dataset}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleStartTraining = async () => {
        if (!datasetId || !modelName.trim()) return;
        setTraining(true);
        setError(null);
        try {
            await startTraining(datasetId, modelName, steps);
            setInfo("Training job started! Check the Jobs tab for progress.");
            setTab("jobs");
            loadJobs();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to start training");
        } finally {
            setTraining(false);
        }
    };

    const statusIcon = (s: string) => {
        if (s === "completed") return <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />;
        if (s === "failed") return <XCircle className="h-4 w-4 text-[var(--color-error)]" />;
        if (["training", "loading_model", "starting"].includes(s)) return <Loader2 className="h-4 w-4 animate-spin text-[var(--color-accent)]" />;
        return <Clock className="h-4 w-4 text-[var(--color-muted)]" />;
    };

    const statusLabel = (s: string) => {
        const labels: Record<string, string> = {
            starting: "Starting",
            loading_model: "Loading model",
            training: "Training",
            completed: "Completed",
            failed: "Failed",
        };
        return labels[s] || s;
    };

    const tabs: { key: Tab; label: string; icon: typeof Upload }[] = [
        { key: "upload", label: "Upload & Train", icon: Upload },
        { key: "jobs", label: "Jobs", icon: Clock },
        { key: "models", label: "Models", icon: Sparkles },
    ];

    return (
        <div className="flex h-full flex-col bg-[var(--color-bg)] transition-colors duration-500">
            <header className="page-header">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                        <GraduationCap className="h-4 w-4 text-[var(--color-text)]" />
                    </div>
                    <div>
                        <h1 className="text-[14px] font-semibold tracking-tight text-[var(--color-text)]">Training</h1>
                        <p className="text-[11px] font-medium text-[var(--color-muted)]">Fine-tune models with LoRA</p>
                    </div>
                </div>
                {tab === "jobs" && (
                    <button onClick={loadJobs} className="btn-ghost gap-1.5" title="Refresh jobs">
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                )}
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12">
                <div className="mx-auto max-w-2xl space-y-6 animate-slide-up">
                    <div className="tab-bar">
                        {tabs.map(({ key, label, icon: Icon }) => (
                            <button key={key} onClick={() => setTab(key)} className={clsx("tab-item", tab === key && "tab-active")}>
                                <Icon className="h-4 w-4" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    {info && <div className="alert alert-success">{info}</div>}

                    {tab === "upload" && (
                        <div className="space-y-5">
                            <div className="card space-y-5">
                                <h2 className="text-[14px] font-semibold flex items-center gap-2 text-[var(--color-text)]">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full gradient-accent text-[11px] font-bold text-white">1</span>
                                    Upload Training Data
                                </h2>
                                <input type="file" accept="image/*,video/*" multiple onChange={(e) => setFiles(e.target.files)} className="file-input" />
                                <button onClick={handleUpload} disabled={uploading || !files?.length} className="btn-primary w-full">
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    {uploading ? "Uploading…" : "Upload Data"}
                                </button>
                            </div>

                            <div className={clsx("card space-y-5 transition-opacity duration-300", !datasetId && "opacity-40 pointer-events-none")}>
                                <h2 className="text-[14px] font-semibold flex items-center gap-2 text-[var(--color-text)]">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full gradient-accent text-[11px] font-bold text-white">2</span>
                                    Configure Training
                                </h2>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Model Name</label>
                                        <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="my_custom_model" className="input-base" />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[13px] font-medium text-[var(--color-muted)]">Steps: {steps}</label>
                                        <input type="range" min={100} max={2000} step={100} value={steps} onChange={(e) => setSteps(Number(e.target.value))} className="w-full mt-2" />
                                    </div>
                                </div>
                                <button onClick={handleStartTraining} disabled={training || !modelName.trim()} className="btn-primary w-full">
                                    {training ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                    {training ? "Starting…" : "Start Training"}
                                </button>
                            </div>
                        </div>
                    )}

                    {tab === "jobs" && (
                        <div className="space-y-3">
                            {jobs.length === 0 && (
                                <div className="empty-state">
                                    <Clock className="h-10 w-10 mb-3 opacity-20" />
                                    <p className="text-[14px] font-medium text-[var(--color-text)]">No training jobs yet</p>
                                    <p className="text-[13px] text-[var(--color-muted)] mt-1">Upload data and start a training job first</p>
                                </div>
                            )}
                            {jobs.map((job) => (
                                <div key={job.id} className="card flex items-center gap-4">
                                    {statusIcon(job.status)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-medium truncate text-[var(--color-text)]">{job.name || job.id}</p>
                                        <p className="text-[12px] text-[var(--color-muted)]">{statusLabel(job.status)}{job.progress != null ? ` · ${job.progress}%` : ""}</p>
                                    </div>
                                    {["training", "loading_model", "starting"].includes(job.status) && job.progress != null && (
                                        <div className="w-20 h-1.5 rounded-full overflow-hidden bg-[var(--color-surface-3)]">
                                            <div className="h-full gradient-accent rounded-full transition-all duration-500" style={{ width: `${job.progress}%` }} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === "models" && (
                        <div className="space-y-3">
                            {models.length === 0 && (
                                <div className="empty-state">
                                    <Sparkles className="h-10 w-10 mb-3 opacity-20" />
                                    <p className="text-[14px] font-medium text-[var(--color-text)]">No trained models yet</p>
                                    <p className="text-[13px] text-[var(--color-muted)] mt-1">Complete a training job to see models here</p>
                                </div>
                            )}
                            {models.map((m) => (
                                <div key={m.path} className="card flex items-center gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[var(--color-accent-subtle)]">
                                        <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-medium truncate text-[var(--color-text)]">{m.name}</p>
                                        <p className="text-[11px] truncate text-[var(--color-muted)]">{m.path}</p>
                                    </div>
                                    <FolderOpen className="h-4 w-4 text-[var(--color-muted)]" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
