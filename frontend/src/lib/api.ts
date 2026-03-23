const API = "http://127.0.0.1:8000";

// --- Helpers ---

async function get(path: string) {
    const res = await fetch(`${API}${path}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Request failed");
    }
    return res.json();
}

async function post(path: string, body: object) {
    const res = await fetch(`${API}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || err.detail || "Request failed");
    }
    return res.json();
}

async function postForm(path: string, data: FormData) {
    const res = await fetch(`${API}${path}`, { method: "POST", body: data });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || err.detail || "Request failed");
    }
    return res.json();
}

async function del(path: string) {
    const res = await fetch(`${API}${path}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
}

// --- Core ---

export const getHealth = () => get("/health");
export const getInfo = () => get("/info");

// --- Chat ---

export const sendMessage = (message: string, session = "default") =>
    post("/chat", { message, session });

export const getSessions = () => get("/sessions");
export const getHistory = (session: string) => get(`/history/${session}`);
export const clearHistory = (session: string) => del(`/history/${session}`);

// --- Voice ---

export async function sendVoice(audio: Blob, session = "default") {
    const form = new FormData();
    form.append("audio", audio, "recording.webm");
    form.append("session", session);
    return postForm("/voice", form);
}

export async function textToSpeech(text: string) {
    const form = new FormData();
    form.append("text", text);
    const res = await fetch(`${API}/voice/tts`, { method: "POST", body: form });
    if (!res.ok) throw new Error("TTS failed");
    return res.blob();
}

// --- Image ---

export const generateImage = (prompt: string, model = "sd-1.5", steps = 30, width = 512, height = 512, seed?: number) =>
    post("/image/generate", { prompt, model, steps, width, height, seed });

export async function imageFromImage(image: File, prompt = "", strength = 0.75, steps = 30) {
    const form = new FormData();
    form.append("image", image);
    form.append("prompt", prompt);
    form.append("strength", strength.toString());
    form.append("steps", steps.toString());
    return postForm("/image/from-image", form);
}

export const imageFromTrained = (prompt: string, lora_path: string, trigger_word = "astra_subject") =>
    post("/image/from-trained", { prompt, lora_path, trigger_word });

// --- Video ---

export const generateVideo = (prompt: string, steps = 40, frames = 24) =>
    post("/video/generate", { prompt, steps, frames });

export async function videoFromImage(image: File, prompt = "", steps = 40, frames = 24) {
    const form = new FormData();
    form.append("image", image);
    form.append("prompt", prompt);
    form.append("steps", steps.toString());
    form.append("frames", frames.toString());
    return postForm("/video/from-image", form);
}

// --- Audio ---

export async function enhanceAudio(audio: File, noise_reduce = true, normalize = true) {
    const form = new FormData();
    form.append("audio", audio);
    form.append("noise_reduce", noise_reduce.toString());
    form.append("normalize", normalize.toString());
    const res = await fetch(`${API}/audio/enhance`, { method: "POST", body: form });
    if (!res.ok) throw new Error("Audio enhancement failed");
    return res.blob();
}

export const generateMusic = (prompt: string, duration = 10.0) =>
    post("/audio/generate", { prompt, duration });

// --- Avatar ---

export async function uploadAvatar(image: File) {
    const form = new FormData();
    form.append("image", image);
    return postForm("/avatar/upload", form);
}

export const getAvatarProfile = () => get("/avatar/profile");

export async function animateAvatar(text = "", duration = 5.0) {
    const form = new FormData();
    form.append("text", text);
    form.append("duration", duration.toString());
    return postForm("/avatar/animate", form);
}

// --- Training ---

export async function uploadTrainingData(files: File[], dataset = "default") {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("dataset", dataset);
    return postForm("/train/upload", form);
}

export const startTraining = (opts: { dataset?: string; name?: string; trigger_word?: string; steps?: number } = {}) =>
    post("/train/start", { dataset: "default", name: "my_lora", trigger_word: "astra_subject", steps: 500, ...opts });

export const getTrainingStatus = (jobId: string) => get(`/train/status/${jobId}`);
export const getTrainingJobs = () => get("/train/jobs");
export const getTrainedModels = () => get("/train/models");

// --- Gallery ---

export const getGalleryImages = () => get("/gallery/images");
export const getGalleryVideos = () => get("/gallery/videos");
export const getGalleryAudio = () => get("/gallery/audio");

// --- Storage URL helper ---

export const storageUrl = (path: string) => `${API}${path}`;
