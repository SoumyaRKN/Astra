"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Upload, Loader2, Play, CheckCircle, XCircle, Clock, FolderOpen } from "lucide-react";
import { uploadTrainingData, startTraining, getTrainingJobs, getTrainedModels } from "@/lib/api";

interface Job {
    id: string;
    name: string;
    status: string;
    progress: number;
    steps: number;
    image_count: number;
    error?: string;
}

interface Model {
    name: string;
    trigger_word?: string;
    steps?: number;
    path: string;
}

export default function TrainPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [dataset, setDataset] = useState("default");
    const [name, setName] = useState("my_lora");
    const [triggerWord, setTriggerWord] = useState("astra_subject");
    const [steps, setSteps] = useState(500);
    const [uploading, setUploading] = useState(false);
    const [training, setTraining] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ count: number } | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [models, setModels] = useState<Model[]>([]);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        try {
            const [j, m] = await Promise.all([getTrainingJobs(), getTrainedModels()]);
            setJobs(j.jobs || []);
            setModels(m.models || []);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        setError(null);
        try {
            const result = await uploadTrainingData(files, dataset);
            setUploadResult(result);
            setFiles([]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleTrain = async () => {
        setTraining(true);
        setError(null);
        try {
            await startTraining({ dataset, name, trigger_word: triggerWord, steps });
            await refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Training failed to start");
        } finally {
            setTraining(false);
        }
    };

    const statusIcon = (status: string) => {
        switch (status) {
            case "completed": return <CheckCircle className="h-4 w-4 text-success" />;
            case "failed": return <XCircle className="h-4 w-4 text-error" />;
            default: return <Loader2 className="h-4 w-4 animate-spin text-accent" />;
        }
    };

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center gap-3 border-b border-border px-6 py-3">
                <GraduationCap className="h-5 w-5 text-accent" />
                <div>
                    <h1 className="text-lg font-semibold">Training</h1>
                    <p className="text-xs text-muted">Train AI on your images for personalized generation</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="mx-auto max-w-2xl space-y-6">
                    {/* Upload Data */}
                    <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
                        <h2 className="text-sm font-medium">1. Upload Training Data</h2>
                        <div>
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text file:mr-3 file:rounded file:border-0 file:bg-accent/10 file:px-3 file:py-1 file:text-accent file:text-sm"
                            />
                            <p className="mt-1 text-xs text-muted">Upload at least 3 images (PNG, JPG). More images = better results.</p>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-muted">Dataset Name</label>
                            <input
                                type="text"
                                value={dataset}
                                onChange={(e) => setDataset(e.target.value)}
                                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent/50"
                            />
                        </div>
                        <button
                            onClick={handleUpload}
                            disabled={uploading || files.length === 0}
                            className="flex items-center gap-2 rounded-lg bg-accent/15 px-4 py-2 text-sm text-accent transition-colors hover:bg-accent/25 disabled:opacity-50"
                        >
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {uploading ? "Uploading..." : `Upload ${files.length} file(s)`}
                        </button>
                        {uploadResult && (
                            <p className="text-sm text-success">Uploaded {uploadResult.count} files to dataset &quot;{dataset}&quot;</p>
                        )}
                    </div>

                    {/* Training Config */}
                    <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
                        <h2 className="text-sm font-medium">2. Start Training</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm text-muted">Model Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent/50"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm text-muted">Trigger Word</label>
                                <input
                                    type="text"
                                    value={triggerWord}
                                    onChange={(e) => setTriggerWord(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent/50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-muted">Training Steps: {steps}</label>
                            <input
                                type="range"
                                min={100}
                                max={2000}
                                step={100}
                                value={steps}
                                onChange={(e) => setSteps(Number(e.target.value))}
                                className="w-full accent-accent"
                            />
                        </div>
                        <button
                            onClick={handleTrain}
                            disabled={training}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                        >
                            {training ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                            {training ? "Starting..." : "Start Training"}
                        </button>
                    </div>

                    {error && <p className="text-sm text-error">{error}</p>}

                    {/* Active Jobs */}
                    {jobs.length > 0 && (
                        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
                            <h2 className="text-sm font-medium">Training Jobs</h2>
                            {jobs.map((job) => (
                                <div key={job.id} className="flex items-center gap-3 rounded-lg bg-bg px-4 py-3">
                                    {statusIcon(job.status)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{job.name}</p>
                                        <p className="text-xs text-muted">
                                            {job.status} • {job.image_count} images • {job.progress}%
                                        </p>
                                    </div>
                                    {job.status === "training" && (
                                        <div className="w-24 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-accent transition-all"
                                                style={{ width: `${job.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Trained Models */}
                    {models.length > 0 && (
                        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
                            <h2 className="text-sm font-medium">Trained Models</h2>
                            {models.map((m, i) => (
                                <div key={i} className="flex items-center gap-3 rounded-lg bg-bg px-4 py-3">
                                    <FolderOpen className="h-4 w-4 text-accent" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{m.name}</p>
                                        <p className="text-xs text-muted">
                                            {m.trigger_word && `Trigger: ${m.trigger_word}`}
                                            {m.steps && ` • ${m.steps} steps`}
                                        </p>
                                        <p className="text-xs text-muted/60 truncate">{m.path}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
