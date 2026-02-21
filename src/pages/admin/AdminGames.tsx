import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, RefreshCw, X, Upload, ToggleLeft, ToggleRight, CalendarDays } from "lucide-react";
import { Calendar as DateCalendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Game {
  id: string;
  game_id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  video_url: string | null;
  rules: string | null;
  game_date: string | null;
  game_time: string | null;
  game_datetime: string | null;
  status: string;
}

interface GameRanking { rank: number; player_id: string; player_name?: string; }

interface ImageCropDraft {
  open: boolean;
  src: string;
  fileName: string;
  imageWidth: number;
  imageHeight: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

interface VideoTrimDraft {
  open: boolean;
  src: string;
  file: File | null;
  fileName: string;
  duration: number;
  start: number;
  end: number;
  processing: boolean;
}

const logActivity = async (action: string, target: string) => {
  await supabase.from("activity_logs").insert({ action, target });
};

function getNextGameId(existing: string[]): string {
  const nums = existing.map((id) => parseInt(id.replace("#G", ""))).filter((n) => !isNaN(n)).sort((a, b) => a - b);
  for (let i = 1; ; i++) {
    if (!nums.includes(i)) return `#G${String(i).padStart(2, "0")}`;
  }
}

const BLANK_GAME: Omit<Game, "id"> = { game_id: "", name: "", bio: null, image_url: null, video_url: null, rules: null, game_date: null, game_time: null, game_datetime: null, status: "upcoming" };

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const GAME_IMAGE_FRAME = { width: 300, height: 400, outWidth: 900, outHeight: 1200 };
const MAX_VIDEO_SECONDS = 60;

const formatSeconds = (total: number) => {
  const safe = Math.max(0, total);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const getFileExtension = (fileName: string) => {
  const clean = fileName.split("?")[0].split("#")[0];
  const idx = clean.lastIndexOf(".");
  return idx >= 0 ? clean.slice(idx + 1).toLowerCase() : "";
};

const buildUploadPath = (folder: string, gameId: string, ext: string) => {
  const safeId = (gameId || "game").replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase() || "game";
  const unique = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${folder}/${safeId}-${Date.now()}-${unique}.${ext}`;
};

const toDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseGameDateTime = (game: Pick<Game, "game_datetime" | "game_date" | "game_time">): Date | null => {
  if (game.game_datetime) {
    const parsed = new Date(game.game_datetime);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    const fallback = new Date(game.game_datetime.replace(" ", "T"));
    if (!Number.isNaN(fallback.getTime())) return fallback;
  }
  if (!game.game_date) return null;
  const base = new Date(`${game.game_date}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;
  if (!game.game_time) return base;
  const match = game.game_time.trim().toUpperCase().match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/);
  if (!match) return base;
  const [, hourRaw, minute, period] = match;
  const hour12 = parseInt(hourRaw, 10);
  const hour24 = (hour12 % 12) + (period === "PM" ? 12 : 0);
  base.setHours(hour24, parseInt(minute, 10), 0, 0);
  return base;
};

const formatDateTimeLabel = (value: string | null) => {
  if (!value) return "Pick date and time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pick date and time";
  return date.toLocaleString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const clampCropOffsets = (imageWidth: number, imageHeight: number, zoom: number, offsetX: number, offsetY: number) => {
  const scale = Math.max(GAME_IMAGE_FRAME.width / imageWidth, GAME_IMAGE_FRAME.height / imageHeight) * zoom;
  const renderedWidth = imageWidth * scale;
  const renderedHeight = imageHeight * scale;
  const maxX = Math.max((renderedWidth - GAME_IMAGE_FRAME.width) / 2, 0);
  const maxY = Math.max((renderedHeight - GAME_IMAGE_FRAME.height) / 2, 0);
  return {
    x: Math.min(Math.max(offsetX, -maxX), maxX),
    y: Math.min(Math.max(offsetY, -maxY), maxY),
  };
};

const seekVideo = (video: HTMLVideoElement, seconds: number) =>
  new Promise<void>((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = seconds;
  });

const pickRecorderMimeType = () => {
  const candidates = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];
  return candidates.find((type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type));
};

const trimVideoFile = async (file: File, start: number, end: number): Promise<File> => {
  const src = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "auto";
    video.src = src;
    video.muted = true;
    video.playsInline = true;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Could not open video"));
    });

    const stream = (video as any).captureStream?.() || (video as any).mozCaptureStream?.();
    if (!stream) throw new Error("Browser does not support video trimming");

    const mimeType = pickRecorderMimeType();
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    const stopPromise = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });

    await seekVideo(video, start);
    recorder.start();
    await video.play();

    await new Promise<void>((resolve) => {
      const stopRecording = () => {
        video.pause();
        if (recorder.state !== "inactive") recorder.stop();
        resolve();
      };
      const onTimeUpdate = () => {
        if (video.currentTime >= end) {
          cleanup();
          stopRecording();
        }
      };
      const fallback = window.setTimeout(() => {
        cleanup();
        stopRecording();
      }, Math.max(250, (end - start + 0.25) * 1000));
      const cleanup = () => {
        window.clearTimeout(fallback);
        video.removeEventListener("timeupdate", onTimeUpdate);
      };
      video.addEventListener("timeupdate", onTimeUpdate);
    });

    await stopPromise;
    const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
    const ext = blob.type.includes("mp4") ? "mp4" : "webm";
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-trimmed.${ext}`, { type: blob.type || "video/webm" });
  } finally {
    URL.revokeObjectURL(src);
  }
};

export default function AdminGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [form, setForm] = useState<Omit<Game, "id">>(BLANK_GAME);
  const [rankings, setRankings] = useState<GameRanking[]>([]);
  const [players, setPlayers] = useState<{ id: string; name: string; player_id: string }[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Game | null>(null);
  const [imageCropDraft, setImageCropDraft] = useState<ImageCropDraft>({
    open: false,
    src: "",
    fileName: "",
    imageWidth: 0,
    imageHeight: 0,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [videoTrimDraft, setVideoTrimDraft] = useState<VideoTrimDraft>({
    open: false,
    src: "",
    file: null,
    fileName: "",
    duration: 0,
    start: 0,
    end: 0,
    processing: false,
  });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStartOffset, setDragStartOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pickerDate, setPickerDate] = useState<Date | undefined>(undefined);
  const [pickerHour, setPickerHour] = useState("09");
  const [pickerMinute, setPickerMinute] = useState("30");
  const [pickerPeriod, setPickerPeriod] = useState<"AM" | "PM">("PM");
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const fetchGames = async () => {
    const { data } = await supabase.from("games").select("*").order("game_id");
    if (data) setGames(data);
    setLoading(false);
  };

  const fetchPlayers = async () => {
    const { data } = await supabase.from("players").select("id, name, player_id");
    if (data) setPlayers(data);
  };

  useEffect(() => { fetchGames(); fetchPlayers(); }, []);

  useEffect(() => {
    return () => {
      if (imageCropDraft.src) URL.revokeObjectURL(imageCropDraft.src);
    };
  }, [imageCropDraft.src]);

  useEffect(() => {
    return () => {
      if (videoTrimDraft.src) URL.revokeObjectURL(videoTrimDraft.src);
    };
  }, [videoTrimDraft.src]);

  const setDateTimeParts = (baseDate: Date | null) => {
    if (!baseDate) {
      setPickerDate(undefined);
      setPickerHour("09");
      setPickerMinute("30");
      setPickerPeriod("PM");
      return;
    }
    const hours24 = baseDate.getHours();
    const hour12 = hours24 % 12 || 12;
    setPickerDate(baseDate);
    setPickerHour(String(hour12).padStart(2, "0"));
    setPickerMinute(String(baseDate.getMinutes()).padStart(2, "0"));
    setPickerPeriod(hours24 >= 12 ? "PM" : "AM");
  };

  const updateFormDateTime = (dateValue: Date | undefined, hourValue = pickerHour, minuteValue = pickerMinute, periodValue = pickerPeriod) => {
    if (!dateValue) {
      setForm((f) => ({ ...f, game_datetime: null, game_date: null, game_time: null }));
      return;
    }
    const hour12 = parseInt(hourValue, 10);
    const minute = parseInt(minuteValue, 10);
    const hour24 = (hour12 % 12) + (periodValue === "PM" ? 12 : 0);
    const dateTime = new Date(dateValue);
    dateTime.setHours(hour24, minute, 0, 0);
    setForm((f) => ({
      ...f,
      game_datetime: dateTime.toISOString(),
      game_date: toDateString(dateValue),
      game_time: `${hourValue}:${minuteValue} ${periodValue}`,
    }));
  };

  const openCreate = () => {
    const nextId = getNextGameId(games.map((g) => g.game_id));
    setEditing(null);
    const now = new Date();
    const hours24 = now.getHours();
    const hour12 = String(hours24 % 12 || 12).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const period: "AM" | "PM" = hours24 >= 12 ? "PM" : "AM";
    setPickerDate(now);
    setPickerHour(hour12);
    setPickerMinute(minute);
    setPickerPeriod(period);
    setForm({
      ...BLANK_GAME,
      game_id: nextId,
      game_datetime: now.toISOString(),
      game_date: toDateString(now),
      game_time: `${hour12}:${minute} ${period}`,
    });
    setRankings([]);
    setImageFile(null);
    setVideoFile(null);
    setShowForm(true);
  };

  const openEdit = async (g: Game) => {
    setEditing(g);
    setForm({ ...g });
    setDateTimeParts(parseGameDateTime(g));
    if (g.status === "completed") {
      const { data } = await supabase.from("player_game_stats").select("rank, player_id, players(name, player_id)").eq("game_id", g.id).order("rank");
      if (data) setRankings((data as any).map((d: any) => ({ rank: d.rank, player_id: d.player_id, player_name: d.players?.name })));
    } else {
      setRankings([]);
    }
    setImageFile(null);
    setVideoFile(null);
    setShowForm(true);
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const saveGame = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      let imageUrl = form.image_url;
      let videoUrl = form.video_url;
      if (imageFile) {
        const imageExt = getFileExtension(imageFile.name) || "jpg";
        imageUrl = await uploadFile(imageFile, "games", buildUploadPath("images", form.game_id, imageExt));
      }
      if (videoFile) {
        const videoExt = getFileExtension(videoFile.name) || (videoFile.type.includes("mp4") ? "mp4" : "webm");
        videoUrl = await uploadFile(videoFile, "videos", buildUploadPath("clips", form.game_id, videoExt));
      }

      const payload = {
        ...form,
        name: form.name.trim().toUpperCase(),
        game_time: form.game_time ? form.game_time.trim().toUpperCase().replace(/\s+/g, " ") : null,
        image_url: imageUrl,
        video_url: videoUrl
      };

      if (editing) {
        await supabase.from("games").update(payload).eq("id", editing.id);

        if (form.status === "completed") {
          await supabase.from("player_game_stats").delete().eq("game_id", editing.id);
          const validRanks = rankings.filter((r) => r.player_id);
          if (validRanks.length > 0) {
            await supabase.from("player_game_stats").insert(validRanks.map((r) => ({ game_id: editing.id, player_id: r.player_id, rank: r.rank })));
          }
        }

        await logActivity("EDIT_GAME", form.name);
        toast.success("Game updated!");
      } else {
        const { data } = await supabase.from("games").insert(payload).select().single();
        await logActivity("CREATE_GAME", form.name);
        toast.success("Game created!");
      }

      setShowForm(false);
      fetchGames();
    } catch (e: any) {
      const message = e?.message || "Error saving game";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const openImageCropper = async (file: File) => {
    const src = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = src;
      await image.decode();
      setImageCropDraft({
        open: true,
        src,
        fileName: file.name,
        imageWidth: image.naturalWidth,
        imageHeight: image.naturalHeight,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      });
    } catch {
      URL.revokeObjectURL(src);
      toast.error("Could not open this image");
    }
  };

  const closeImageCropper = () => {
    if (imageCropDraft.src) URL.revokeObjectURL(imageCropDraft.src);
    setImageCropDraft({
      open: false,
      src: "",
      fileName: "",
      imageWidth: 0,
      imageHeight: 0,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });
    setIsDraggingCrop(false);
  };

  const applyImageCrop = async () => {
    if (!imageCropDraft.open) return;
    const { src, imageWidth, imageHeight, zoom, offsetX, offsetY, fileName } = imageCropDraft;
    const scale = Math.max(GAME_IMAGE_FRAME.width / imageWidth, GAME_IMAGE_FRAME.height / imageHeight) * zoom;
    const sourceWidth = GAME_IMAGE_FRAME.width / scale;
    const sourceHeight = GAME_IMAGE_FRAME.height / scale;
    const sourceX = imageWidth / 2 - sourceWidth / 2 - offsetX / scale;
    const sourceY = imageHeight / 2 - sourceHeight / 2 - offsetY / scale;

    const canvas = document.createElement("canvas");
    canvas.width = GAME_IMAGE_FRAME.outWidth;
    canvas.height = GAME_IMAGE_FRAME.outHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast.error("Could not crop image");
      return;
    }

    const image = new Image();
    image.src = src;
    await image.decode();
    ctx.drawImage(
      image,
      Math.max(0, sourceX),
      Math.max(0, sourceY),
      Math.min(imageWidth, sourceWidth),
      Math.min(imageHeight, sourceHeight),
      0,
      0,
      GAME_IMAGE_FRAME.outWidth,
      GAME_IMAGE_FRAME.outHeight,
    );

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) {
      toast.error("Could not crop image");
      return;
    }

    setImageFile(new File([blob], `${fileName.replace(/\.[^.]+$/, "")}-cropped.jpg`, { type: "image/jpeg" }));
    closeImageCropper();
  };

  const openVideoTrimmer = async (file: File) => {
    const src = URL.createObjectURL(file);
    try {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = src;
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Could not open video"));
      });
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (duration <= 0) {
        URL.revokeObjectURL(src);
        toast.error("Could not read video duration");
        return;
      }
      setVideoTrimDraft({
        open: true,
        src,
        file,
        fileName: file.name,
        duration,
        start: 0,
        end: Math.min(duration, MAX_VIDEO_SECONDS),
        processing: false,
      });
    } catch {
      URL.revokeObjectURL(src);
      toast.error("Could not open this video");
    }
  };

  const closeVideoTrimmer = () => {
    if (videoTrimDraft.src) URL.revokeObjectURL(videoTrimDraft.src);
    setVideoTrimDraft({
      open: false,
      src: "",
      file: null,
      fileName: "",
      duration: 0,
      start: 0,
      end: 0,
      processing: false,
    });
  };

  const applyVideoTrim = async () => {
    if (!videoTrimDraft.file) return;
    if (videoTrimDraft.end <= videoTrimDraft.start) return toast.error("End time must be after start time");
    if (videoTrimDraft.end - videoTrimDraft.start > MAX_VIDEO_SECONDS + 0.01) return toast.error("Maximum clip length is 1 minute");

    if (videoTrimDraft.duration <= MAX_VIDEO_SECONDS && videoTrimDraft.start <= 0.01 && videoTrimDraft.end >= videoTrimDraft.duration - 0.01) {
      setVideoFile(videoTrimDraft.file);
      closeVideoTrimmer();
      return;
    }

    setVideoTrimDraft((d) => ({ ...d, processing: true }));
    try {
      const trimmed = await trimVideoFile(videoTrimDraft.file, videoTrimDraft.start, videoTrimDraft.end);
      setVideoFile(trimmed);
      closeVideoTrimmer();
      toast.success("Video trimmed and ready");
    } catch {
      if (videoTrimDraft.duration <= MAX_VIDEO_SECONDS) {
        setVideoFile(videoTrimDraft.file);
        closeVideoTrimmer();
        toast.success("Original video selected");
        return;
      }
      toast.error("Could not trim this video in browser. Try a different format (MP4 preferred).");
      setVideoTrimDraft((d) => ({ ...d, processing: false }));
    }
  };

  const deleteGame = async (g: Game) => {
    await supabase.from("games").delete().eq("id", g.id);
    await logActivity("DELETE_GAME", g.name);
    toast.success("Game deleted");
    setConfirmDelete(null);
    fetchGames();
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-cinzel font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Cinzel, serif" }}>Games</h1>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--brown-light))" }}>{games.length} configured</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-cinzel text-sm tracking-wider" style={{ background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))", color: "hsl(var(--cream))", fontFamily: "Cinzel, serif" }}>
            <Plus size={16} /> ADD GAME
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><RefreshCw size={24} className="animate-spin" style={{ color: "hsl(var(--brown-light))" }} /></div>
        ) : (
          <div className="space-y-3">
            {games.map((g) => (
              <div key={g.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "white", border: "1px solid hsl(var(--cream-dark))" }}>
                <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "hsl(var(--cream))" }}>
                  {g.image_url ? <img src={g.image_url} alt={g.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🎮</div>}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--brown-deep))" }}>{g.name.toUpperCase()}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>{g.game_id}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs" style={{
                      background: g.status === "completed" ? "hsl(120 60% 92%)" : "hsl(45 80% 92%)",
                      color: g.status === "completed" ? "hsl(120 50% 35%)" : "hsl(35 80% 35%)",
                    }}>{g.status}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(g)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--cream))", color: "hsl(var(--brown))" }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setConfirmDelete(g)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(0 80% 96%)", color: "hsl(var(--destructive))" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {games.length === 0 && <div className="text-center py-20 text-sm" style={{ color: "hsl(var(--brown-light) / 0.5)" }}>No games yet</div>}
          </div>
        )}
      </div>

      {/* Game Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsla(var(--brown-deep) / 0.5)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid hsl(var(--cream-dark))" }}>
            <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
              <div className="sticky top-0 z-20 flex items-center justify-between p-6 border-b" style={{ background: "white", borderColor: "hsl(var(--cream-dark))" }}>
                <h2 className="text-lg font-cinzel font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Cinzel, serif" }}>
                  {editing ? "Edit Game" : "Create Game"}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ color: "hsl(var(--brown-light))" }}><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>GAME ID</label>
                  <input value={form.game_id} readOnly className="w-full px-4 py-2.5 rounded-xl text-sm outline-none opacity-60" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} />
                </div>
                <div>
                  <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>NAME *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value.toUpperCase() }))} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none uppercase" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} placeholder="Game name" />
                </div>
              </div>

              <div>
                <div>
                  <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>DATE & TIME</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none flex items-center justify-between"
                        style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
                      >
                        <span>{formatDateTimeLabel(form.game_datetime)}</span>
                        <CalendarDays size={16} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[360px] p-0" align="start">
                      <div className="p-3 border-b">
                        <DateCalendar
                          mode="single"
                          selected={pickerDate}
                          onSelect={(d) => {
                            setPickerDate(d);
                            updateFormDateTime(d);
                          }}
                          initialFocus
                        />
                      </div>
                      <div className="p-3 grid grid-cols-3 gap-2">
                        <Select
                          value={pickerHour}
                          onValueChange={(value) => {
                            setPickerHour(value);
                            updateFormDateTime(pickerDate, value, pickerMinute, pickerPeriod);
                          }}
                        >
                          <SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger>
                          <SelectContent>{HOURS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select
                          value={pickerMinute}
                          onValueChange={(value) => {
                            setPickerMinute(value);
                            updateFormDateTime(pickerDate, pickerHour, value, pickerPeriod);
                          }}
                        >
                          <SelectTrigger><SelectValue placeholder="Minute" /></SelectTrigger>
                          <SelectContent>{MINUTES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select
                          value={pickerPeriod}
                          onValueChange={(value: "AM" | "PM") => {
                            setPickerPeriod(value);
                            updateFormDateTime(pickerDate, pickerHour, pickerMinute, value);
                          }}
                        >
                          <SelectTrigger><SelectValue placeholder="AM/PM" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>BIO</label>
                <textarea rows={2} value={form.bio ?? ""} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} />
              </div>

              <div>
                <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>RULES</label>
                <textarea rows={3} value={form.rules ?? ""} onChange={(e) => setForm((f) => ({ ...f, rules: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>GAME IMAGE</label>
                  <div className="border-2 border-dashed rounded-xl p-3 text-center cursor-pointer" style={{ borderColor: "hsl(var(--cream-dark))" }} onClick={() => imageRef.current?.click()}>
                    {imageFile ? <img src={URL.createObjectURL(imageFile)} alt="" className="h-16 object-cover mx-auto rounded" /> : form.image_url ? <img src={form.image_url} alt="" className="h-16 object-cover mx-auto rounded" /> : <Upload size={20} className="mx-auto" style={{ color: "hsl(var(--brown-light))" }} />}
                    <p className="text-xs mt-1" style={{ color: "hsl(var(--brown-light))" }}>Click to upload</p>
                  </div>
                  <input
                    ref={imageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await openImageCropper(file);
                      e.target.value = "";
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>BG VIDEO</label>
                  <div className="border-2 border-dashed rounded-xl p-3 text-center cursor-pointer" style={{ borderColor: "hsl(var(--cream-dark))" }} onClick={() => videoRef.current?.click()}>
                    {videoFile ? (
                      <video src={URL.createObjectURL(videoFile)} autoPlay loop muted playsInline className="h-16 mx-auto rounded object-cover" />
                    ) : form.video_url ? (
                      <video src={form.video_url} autoPlay loop muted playsInline className="h-16 mx-auto rounded object-cover" />
                    ) : (
                      <Upload size={20} className="mx-auto" style={{ color: "hsl(var(--brown-light))" }} />
                    )}
                    <p className="text-xs mt-1" style={{ color: "hsl(var(--brown-light))" }}>Click to upload</p>
                  </div>
                  <input
                    ref={videoRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await openVideoTrimmer(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>

              {/* Status toggle */}
              <div>
                <label className="block text-xs font-cinzel tracking-widest mb-2" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>STATUS</label>
                <button
                  onClick={() => setForm((f) => ({ ...f, status: f.status === "upcoming" ? "completed" : "upcoming" }))}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all"
                  style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
                >
                  {form.status === "completed" ? <ToggleRight size={20} style={{ color: "hsl(120 50% 40%)" }} /> : <ToggleLeft size={20} style={{ color: "hsl(var(--brown-light))" }} />}
                  {form.status === "upcoming" ? "Upcoming" : "Completed"}
                </button>
              </div>

              {/* Rankings (if completed) */}
              {form.status === "completed" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-cinzel tracking-widest" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>GAME RANKINGS</label>
                    {rankings.length < 10 && (
                      <button onClick={() => setRankings((r) => [...r, { rank: r.length + 1, player_id: "" }])} className="text-xs font-cinzel" style={{ color: "hsl(var(--brown-light))", fontFamily: "Cinzel, serif" }}>+ Add</button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {rankings.map((r, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <span className="w-8 text-center text-sm font-bold" style={{ color: "hsl(var(--brown))" }}>#{r.rank}</span>
                        <select
                          value={r.player_id}
                          onChange={(e) => setRankings((ranks) => ranks.map((x, j) => j === i ? { ...x, player_id: e.target.value } : x))}
                          className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                          style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
                        >
                          <option value="">Select player...</option>
                          {players.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.player_id})</option>)}
                        </select>
                        <button onClick={() => setRankings((ranks) => ranks.filter((_, j) => j !== i))} style={{ color: "hsl(var(--destructive))" }}><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                <button onClick={saveGame} disabled={saving} className="w-full py-3 rounded-xl font-cinzel text-sm tracking-widest flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))", color: "hsl(var(--cream))", fontFamily: "Cinzel, serif" }}>
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : null}
                  {saving ? "SAVING..." : editing ? "UPDATE GAME" : "CREATE GAME"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsla(var(--brown-deep) / 0.5)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-8 max-w-sm w-full text-center" style={{ background: "white" }}>
            <Trash2 size={32} className="mx-auto mb-4" style={{ color: "hsl(var(--destructive))" }} />
            <h3 className="font-cinzel font-bold text-lg mb-2" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Cinzel, serif" }}>Delete Game?</h3>
            <p className="text-sm mb-6" style={{ color: "hsl(var(--brown-light))" }}>Delete <strong>{confirmDelete.name}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: "hsl(var(--cream))", color: "hsl(var(--brown))", border: "1px solid hsl(var(--cream-dark))" }}>Cancel</button>
              <button onClick={() => deleteGame(confirmDelete)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "hsl(var(--destructive))", color: "white" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {imageCropDraft.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: "rgba(0, 0, 0, 0.8)" }}>
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden" style={{ background: "#0b0b0b", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              <button onClick={closeImageCropper} className="text-sm px-3 py-1.5 rounded-lg" style={{ color: "#f2f2f2", background: "rgba(255,255,255,0.08)" }}>
                Back
              </button>
              <h3 className="text-lg font-semibold" style={{ color: "#fff" }}>Crop game image</h3>
              <button onClick={applyImageCrop} className="text-sm px-4 py-1.5 rounded-full font-semibold" style={{ color: "#0b0b0b", background: "#f0f4f8" }}>
                Apply
              </button>
            </div>

            <div className="p-6">
              <div
                className="mx-auto relative overflow-hidden select-none"
                style={{
                  width: `${GAME_IMAGE_FRAME.width}px`,
                  height: `${GAME_IMAGE_FRAME.height}px`,
                  borderRadius: "12px",
                  border: "3px solid #1fb6ff",
                  cursor: isDraggingCrop ? "grabbing" : "grab",
                  background: "#050505",
                  touchAction: "none",
                }}
                onPointerDown={(e) => {
                  (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                  setIsDraggingCrop(true);
                  setDragStart({ x: e.clientX, y: e.clientY });
                  setDragStartOffset({ x: imageCropDraft.offsetX, y: imageCropDraft.offsetY });
                }}
                onPointerMove={(e) => {
                  if (!isDraggingCrop) return;
                  const nextX = dragStartOffset.x + (e.clientX - dragStart.x);
                  const nextY = dragStartOffset.y + (e.clientY - dragStart.y);
                  const clamped = clampCropOffsets(imageCropDraft.imageWidth, imageCropDraft.imageHeight, imageCropDraft.zoom, nextX, nextY);
                  setImageCropDraft((d) => ({ ...d, offsetX: clamped.x, offsetY: clamped.y }));
                }}
                onPointerUp={() => setIsDraggingCrop(false)}
                onPointerCancel={() => setIsDraggingCrop(false)}
              >
                <img
                  src={imageCropDraft.src}
                  alt="Crop preview"
                  draggable={false}
                  className="absolute top-1/2 left-1/2 pointer-events-none"
                  style={{
                    transform: `translate(calc(-50% + ${imageCropDraft.offsetX}px), calc(-50% + ${imageCropDraft.offsetY}px))`,
                    width: `${imageCropDraft.imageWidth * Math.max(GAME_IMAGE_FRAME.width / imageCropDraft.imageWidth, GAME_IMAGE_FRAME.height / imageCropDraft.imageHeight) * imageCropDraft.zoom}px`,
                    height: `${imageCropDraft.imageHeight * Math.max(GAME_IMAGE_FRAME.width / imageCropDraft.imageWidth, GAME_IMAGE_FRAME.height / imageCropDraft.imageHeight) * imageCropDraft.zoom}px`,
                    maxWidth: "none",
                  }}
                />
              </div>

              <div className="max-w-md mx-auto mt-5">
                <label className="block text-xs mb-2" style={{ color: "#b7c4d1" }}>Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={imageCropDraft.zoom}
                  onChange={(e) => {
                    const nextZoom = parseFloat(e.target.value);
                    const clamped = clampCropOffsets(imageCropDraft.imageWidth, imageCropDraft.imageHeight, nextZoom, imageCropDraft.offsetX, imageCropDraft.offsetY);
                    setImageCropDraft((d) => ({ ...d, zoom: nextZoom, offsetX: clamped.x, offsetY: clamped.y }));
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {videoTrimDraft.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: "rgba(0, 0, 0, 0.8)" }}>
          <div className="w-full max-w-4xl rounded-2xl overflow-hidden" style={{ background: "#0b0b0b", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              <button onClick={closeVideoTrimmer} className="text-sm px-3 py-1.5 rounded-lg" style={{ color: "#f2f2f2", background: "rgba(255,255,255,0.08)" }}>
                Back
              </button>
              <h3 className="text-lg font-semibold" style={{ color: "#fff" }}>Trim video (max 1:00)</h3>
              <button
                onClick={applyVideoTrim}
                disabled={videoTrimDraft.processing}
                className="text-sm px-4 py-1.5 rounded-full font-semibold disabled:opacity-60"
                style={{ color: "#0b0b0b", background: "#f0f4f8" }}
              >
                {videoTrimDraft.processing ? "Processing..." : "Apply"}
              </button>
            </div>

            <div className="p-6 space-y-4">
              <video
                src={videoTrimDraft.src}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-full max-h-[360px] rounded-xl bg-black"
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  if (v.currentTime >= videoTrimDraft.end) {
                    v.currentTime = videoTrimDraft.start;
                    void v.play();
                  }
                }}
              />

              <div className="text-sm" style={{ color: "#d2dae3" }}>
                Total: <strong>{formatSeconds(videoTrimDraft.duration)}</strong> | Selected: <strong>{formatSeconds(videoTrimDraft.end - videoTrimDraft.start)}</strong> (max 01:00)
              </div>

              <div>
                <label className="block text-xs mb-2" style={{ color: "#b7c4d1" }}>Start: {formatSeconds(videoTrimDraft.start)}</label>
                <input
                  type="range"
                  min={0}
                  max={videoTrimDraft.duration}
                  step={0.1}
                  value={videoTrimDraft.start}
                  onChange={(e) => {
                    const nextStart = parseFloat(e.target.value);
                    let nextEnd = videoTrimDraft.end;
                    if (nextEnd - nextStart > MAX_VIDEO_SECONDS) nextEnd = Math.min(videoTrimDraft.duration, nextStart + MAX_VIDEO_SECONDS);
                    if (nextStart >= nextEnd) nextEnd = Math.min(videoTrimDraft.duration, nextStart + 0.1);
                    setVideoTrimDraft((d) => ({ ...d, start: nextStart, end: nextEnd }));
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs mb-2" style={{ color: "#b7c4d1" }}>End: {formatSeconds(videoTrimDraft.end)}</label>
                <input
                  type="range"
                  min={0}
                  max={videoTrimDraft.duration}
                  step={0.1}
                  value={videoTrimDraft.end}
                  onChange={(e) => {
                    let nextEnd = parseFloat(e.target.value);
                    if (nextEnd <= videoTrimDraft.start) nextEnd = Math.min(videoTrimDraft.duration, videoTrimDraft.start + 0.1);
                    if (nextEnd - videoTrimDraft.start > MAX_VIDEO_SECONDS) nextEnd = videoTrimDraft.start + MAX_VIDEO_SECONDS;
                    setVideoTrimDraft((d) => ({ ...d, end: nextEnd }));
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
