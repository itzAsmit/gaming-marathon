import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import { adminMutation } from "@/lib/adminMutation";
import { raceUpload } from "@/lib/adminUpload";
import { withTimeout } from "@/lib/withTimeout";
import { useTextareaResize } from "@/hooks/use-textarea-resize";
import SmartImage from "@/components/SmartImage";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, X, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";

interface Player {
  id: string;
  player_id: string;
  name: string;
  bio: string | null;
  image_url: string | null;
  portrait_url: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  is_active: boolean;
}

type PlayerRow = Omit<Player, "is_active"> & { is_active?: boolean | null };

interface Proficiency { game_name: string; proficiency_percent: number; }
interface GameOption { id: string; name: string; }

const BLANK: Omit<Player, "id"> = { player_id: "", name: "", bio: null, image_url: null, portrait_url: null, instagram: null, twitter: null, linkedin: null, is_active: true };
const AVATAR_OUTPUT_SIZE = 600;
const PORTRAIT_WIDTH = 900;
const PORTRAIT_HEIGHT = 1200;

type CropKind = "avatar" | "portrait";

interface CropDraft {
  open: boolean;
  kind: CropKind | null;
  src: string;
  fileName: string;
  imageWidth: number;
  imageHeight: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

const logActivity = async (action: string, target: string) => {
  try {
    await adminMutation.insert("activity_logs", { action, target });
  } catch {
    // Non-critical, don't block on logging failure
  }
};

function getNextPlayerId(existing: string[]): string {
  const nums = existing.map((id) => parseInt(id.replace("#P", ""))).filter((n) => !isNaN(n)).sort((a, b) => a - b);
  for (let i = 1; ; i++) {
    if (!nums.includes(i)) return `#P${String(i).padStart(2, "0")}`;
  }
}

export default function AdminPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState<Omit<Player, "id">>(BLANK);
  const [proficiencies, setProficiencies] = useState<Proficiency[]>([{ game_name: "", proficiency_percent: 50 }]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Player | null>(null);
  const [gameOptions, setGameOptions] = useState<GameOption[]>([]);
  const [cropDraft, setCropDraft] = useState<CropDraft>({
    open: false,
    kind: null,
    src: "",
    fileName: "",
    imageWidth: 0,
    imageHeight: 0,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStartOffset, setDragStartOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const avatarRef = useRef<HTMLInputElement>(null);
  const portraitRef = useRef<HTMLInputElement>(null);
  const bioRef = useTextareaResize(form.bio ?? "", 3);

  const fetchPlayers = async () => {
    try {
      const data = await raceDataFetch<PlayerRow[]>(
        () => supabase.from("players").select("*").order("player_id"),
        "admin_players",
      );
      setPlayers(data.map((p) => ({ ...p, is_active: p.is_active ?? true })));
    } catch {
      toast.error("Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const data = await raceDataFetch<GameOption[]>(
        () => supabase.from("games").select("id, name").order("game_id"),
        "admin_games",
      );
      setGameOptions(data);
    } catch {
      // Non-critical, games are for proficiency dropdown
    }
  };

  useEffect(() => { fetchPlayers(); fetchGames(); }, []);

  useEffect(() => {
    return () => {
      if (cropDraft.src) URL.revokeObjectURL(cropDraft.src);
    };
  }, [cropDraft.src]);

  const openCreate = () => {
    const nextId = getNextPlayerId(players.map((p) => p.player_id));
    setEditing(null);
    setForm({ ...BLANK, player_id: nextId });
    setProficiencies([{ game_name: "", proficiency_percent: 50 }]);
    setAvatarFile(null);
    setPortraitFile(null);
    setShowForm(true);
  };

  const openEdit = async (p: Player) => {
    setEditing(p);
    setForm({ ...p });
    try {
      const { data: profs, error } = await withTimeout(
        supabase.from("player_proficiencies").select("game_name, proficiency_percent").eq("player_id", p.id),
        8000,
        "Proficiencies fetch timed out",
      );
      if (error) throw error;
      setProficiencies(profs && profs.length > 0 ? (profs as Proficiency[]) : [{ game_name: "", proficiency_percent: 50 }]);
    } catch {
      setProficiencies([{ game_name: "", proficiency_percent: 50 }]);
    }
    setAvatarFile(null);
    setPortraitFile(null);
    setShowForm(true);
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    try {
      return await raceUpload(bucket as any, path, file);
    } catch {
      return null;
    }
  };

  const getCropFrame = (kind: CropKind) => {
    if (kind === "avatar") return { width: 320, height: 320, outWidth: AVATAR_OUTPUT_SIZE, outHeight: AVATAR_OUTPUT_SIZE };
    return { width: 300, height: 400, outWidth: PORTRAIT_WIDTH, outHeight: PORTRAIT_HEIGHT };
  };

  const clampOffsets = (kind: CropKind, imageWidth: number, imageHeight: number, zoom: number, offsetX: number, offsetY: number) => {
    const frame = getCropFrame(kind);
    const scale = Math.max(frame.width / imageWidth, frame.height / imageHeight) * zoom;
    const renderedWidth = imageWidth * scale;
    const renderedHeight = imageHeight * scale;
    const maxX = Math.max((renderedWidth - frame.width) / 2, 0);
    const maxY = Math.max((renderedHeight - frame.height) / 2, 0);

    return {
      x: Math.min(Math.max(offsetX, -maxX), maxX),
      y: Math.min(Math.max(offsetY, -maxY), maxY),
    };
  };

  const openCropper = async (file: File, kind: CropKind) => {
    const src = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = src;
      await img.decode();
      setCropDraft({
        open: true,
        kind,
        src,
        fileName: file.name,
        imageWidth: img.naturalWidth,
        imageHeight: img.naturalHeight,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      });
    } catch {
      URL.revokeObjectURL(src);
      toast.error("Could not open this image");
    }
  };

  const closeCropper = () => {
    if (cropDraft.src) URL.revokeObjectURL(cropDraft.src);
    setCropDraft({
      open: false,
      kind: null,
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

  const applyCrop = async () => {
    if (!cropDraft.open || !cropDraft.kind) return;
    const { kind, src, imageWidth, imageHeight, zoom, offsetX, offsetY, fileName } = cropDraft;
    const frame = getCropFrame(kind);
    const scale = Math.max(frame.width / imageWidth, frame.height / imageHeight) * zoom;
    const sourceWidth = frame.width / scale;
    const sourceHeight = frame.height / scale;
    const sourceX = imageWidth / 2 - sourceWidth / 2 - offsetX / scale;
    const sourceY = imageHeight / 2 - sourceHeight / 2 - offsetY / scale;

    const canvas = document.createElement("canvas");
    canvas.width = frame.outWidth;
    canvas.height = frame.outHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast.error("Could not crop image");
      return;
    }

    const img = new Image();
    img.src = src;
    await img.decode();

    ctx.drawImage(
      img,
      Math.max(0, sourceX),
      Math.max(0, sourceY),
      Math.min(imageWidth, sourceWidth),
      Math.min(imageHeight, sourceHeight),
      0,
      0,
      frame.outWidth,
      frame.outHeight,
    );

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) {
      toast.error("Could not crop image");
      return;
    }

    const croppedFile = new File([blob], fileName.replace(/\.[^.]+$/, "") + "-cropped.jpg", { type: "image/jpeg" });
    if (kind === "avatar") setAvatarFile(croppedFile);
    if (kind === "portrait") setPortraitFile(croppedFile);
    closeCropper();
  };

  const savePlayer = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    const validProfs = proficiencies.filter((p) => p.game_name);
    if (validProfs.length === 0) return toast.error("Add at least 1 game proficiency");
    setSaving(true);

    try {
      let avatarUrl = form.image_url;
      let portraitUrl = form.portrait_url;

      const safeId = form.player_id.replace(/[^a-zA-Z0-9-_]/g, "");
      if (avatarFile) {
        avatarUrl = await uploadFile(avatarFile, "players", `avatars/${safeId}-${Date.now()}`);
      }
      if (portraitFile) {
        portraitUrl = await uploadFile(portraitFile, "players", `portraits/${safeId}-${Date.now()}`);
      }

      const payload = { ...form, image_url: avatarUrl, portrait_url: portraitUrl };

      if (editing) {
        await adminMutation.update("players", payload, { id: editing.id });
        await adminMutation.delete("player_proficiencies", { player_id: editing.id });
        if (validProfs.length > 0) {
          await adminMutation.insert("player_proficiencies", validProfs.map((p) => ({ ...p, player_id: editing.id })));
        }
        await logActivity("EDIT_PLAYER", form.name);
        toast.success("Player updated!");
      } else {
        const [newPlayer] = await adminMutation.insert<Player>("players", payload);
        if (newPlayer && validProfs.length > 0) {
          await adminMutation.insert("player_proficiencies", validProfs.map((p) => ({ ...p, player_id: newPlayer.id })));
        }
        await logActivity("CREATE_PLAYER", form.name);
        toast.success("Player created!");
      }

      setShowForm(false);
      fetchPlayers();
    } catch (e) {
      toast.error("Error saving player");
    } finally {
      setSaving(false);
    }
  };

  const deletePlayer = async (p: Player) => {
    await adminMutation.delete("players", { id: p.id });
    await logActivity("DELETE_PLAYER", p.name);
    toast.success("Player deleted");
    setConfirmDelete(null);
    fetchPlayers();
  };

  const usedGames = proficiencies.map((p) => p.game_name).filter(Boolean);

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="md:sticky md:top-0 z-20 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl  font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>Players</h1>
              <p className="text-sm mt-1" style={{ color: "hsl(var(--brown-light))" }}>{players.length} registered</p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl  text-xs md:text-sm tracking-wider"
              style={{ background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))", color: "hsl(var(--cream))", fontFamily: "Electrolize, sans-serif" }}
            >
              <Plus size={16} /> ADD PLAYER
            </button>
          </div>
        </div>

        {/* Player list */}
        {loading ? (
          <div className="flex justify-center py-20"><RefreshCw size={24} className="animate-spin" style={{ color: "hsl(var(--brown-light))" }} /></div>
        ) : (
          <div className="rounded-2xl p-3 md:p-4 overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}>
            <div className="relative md:max-h-[calc(100dvh-11.5rem)] overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-7 scroll-fade-edge" style={{ background: "linear-gradient(180deg, hsl(var(--card)), transparent)" }} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-7 scroll-fade-edge" style={{ background: "linear-gradient(0deg, hsl(var(--card)), transparent)" }} />
              <div className="space-y-3 max-h-none md:max-h-[calc(100dvh-11.5rem)] overflow-y-visible md:overflow-y-auto animated-scroll-area py-1 pr-1">
                {players.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl transition-all animated-scroll-item" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}>
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{ background: "hsl(var(--input))" }}>
                      {p.image_url ? <SmartImage url={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold" style={{ color: "hsl(var(--brown))" }}>{p.name[0]}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: "hsl(var(--brown-deep))" }}>{p.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(var(--brown-light))" }}>{p.player_id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          background: p.is_active ? "rgb(34, 197, 94)" : "rgb(60, 60, 60)",
                          boxShadow: p.is_active 
                            ? "0 0 8px rgba(34, 197, 94, 0.8), 0 0 16px rgba(34, 197, 94, 0.4)" 
                            : "0 0 8px rgba(60, 60, 60, 0.8), 0 0 16px rgba(60, 60, 60, 0.4)",
                        }}
                      />
                      <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" style={{ background: "hsl(var(--input))", color: "hsl(var(--brown))" }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setConfirmDelete(p)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" style={{ background: "hsl(0 80% 96%)", color: "hsl(var(--destructive))" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {players.length === 0 && (
                  <div className="text-center py-20 text-sm" style={{ color: "hsl(var(--brown-light) / 0.5)" }}>No players yet. Add your first player!</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Player Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsla(var(--brown-deep) / 0.5)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}>
            <div className="max-h-[90dvh] overflow-y-auto animated-scroll-area no-scrollbar">
              <div className="sticky top-0 z-20 flex items-center justify-between p-6 border-b" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--cream-dark))" }}>
                <h2 className="text-lg  font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>
                  {editing ? "Edit Player" : "Create Player"}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ color: "hsl(var(--brown-light))" }}><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5">
              {/* ID (read-only) */}
              <div>
                <label className="block text-xs  tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}>PLAYER ID</label>
                <input value={form.player_id} readOnly className="w-full px-4 py-2.5 rounded-xl text-sm outline-none opacity-60" style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} />
              </div>

              {/* Active Status */}
              <div>
                <label className="block text-xs  tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}>STATUS</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, is_active: true }))}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    style={{
                      background: "transparent",
                      color: form.is_active ? "rgb(34, 197, 94)" : "hsl(var(--brown-light))",
                      border: form.is_active ? "2px solid rgb(34, 197, 94)" : "1px solid hsl(var(--cream-dark))",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: form.is_active ? "rgb(34, 197, 94)" : "transparent",
                        boxShadow: form.is_active ? "0 0 6px rgba(34, 197, 94, 0.8)" : "none",
                        border: form.is_active ? "none" : "1px solid hsl(var(--brown-light))",
                      }}
                    />
                    ACTIVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, is_active: false }))}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    style={{
                      background: "transparent",
                      color: !form.is_active ? "rgb(100, 100, 100)" : "hsl(var(--brown-light))",
                      border: !form.is_active ? "2px solid rgb(100, 100, 100)" : "1px solid hsl(var(--cream-dark))",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: !form.is_active ? "rgb(150, 150, 150)" : "transparent",
                        border: !form.is_active ? "none" : "1px solid hsl(var(--brown-light))",
                      }}
                    />
                    INACTIVE
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs  tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}>NAME *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} placeholder="Player name" />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs  tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}>BIO</label>
                <textarea ref={bioRef} rows={3} value={form.bio ?? ""} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none overflow-hidden" style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} placeholder="Short bio..." />
              </div>

              {/* Image uploads */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs  tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}>AVATAR (circle)</label>
                  <div
                    className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ borderColor: "hsl(var(--cream-dark))" }}
                    onClick={() => avatarRef.current?.click()}
                  >
                    {avatarFile ? (
                      <img src={URL.createObjectURL(avatarFile)} alt="" className="w-16 h-16 rounded-full object-cover mx-auto" />
                    ) : form.image_url ? (
                      <SmartImage url={form.image_url} alt="" className="w-16 h-16 rounded-full object-cover mx-auto" />
                    ) : (
                      <Upload size={20} className="mx-auto mb-1" style={{ color: "hsl(var(--brown-light))" }} />
                    )}
                    <p className="text-xs mt-1" style={{ color: "hsl(var(--brown-light))" }}>Upload</p>
                  </div>
                  <input
                    ref={avatarRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await openCropper(file, "avatar");
                      e.target.value = "";
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs  tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}>PORTRAIT (3:4)</label>
                  <div
                    className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ borderColor: "hsl(var(--cream-dark))" }}
                    onClick={() => portraitRef.current?.click()}
                  >
                    {portraitFile ? (
                      <img src={URL.createObjectURL(portraitFile)} alt="" className="w-12 h-16 object-cover mx-auto rounded" />
                    ) : form.portrait_url ? (
                      <SmartImage url={form.portrait_url} alt="" className="w-12 h-16 object-cover mx-auto rounded" />
                    ) : (
                      <Upload size={20} className="mx-auto mb-1" style={{ color: "hsl(var(--brown-light))" }} />
                    )}
                    <p className="text-xs mt-1" style={{ color: "hsl(var(--brown-light))" }}>Upload</p>
                  </div>
                  <input
                    ref={portraitRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await openCropper(file, "portrait");
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>

              {/* Social */}
              <div className="grid grid-cols-3 gap-3">
                {(["instagram", "twitter", "linkedin"] as const).map((s) => (
                  <div key={s}>
                    <label className="block text-xs  tracking-widest mb-1.5 capitalize" style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}>{s.toUpperCase()}</label>
                    <input value={(form as any)[s] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [s]: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} placeholder={`https://www.example.com`} />
                  </div>
                ))}
              </div>

              {/* Proficiencies */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs  tracking-widest" style={{ color: "hsl(var(--brown))", fontFamily: "Electrolize, sans-serif" }}>GAME PROFICIENCY (1-3)</label>
                  {proficiencies.length < 3 && (
                    <button onClick={() => setProficiencies((p) => [...p, { game_name: "", proficiency_percent: 50 }])} className="text-xs " style={{ color: "hsl(var(--brown-light))", fontFamily: "Electrolize, sans-serif" }}>+ Add</button>
                  )}
                </div>
                <div className="space-y-3">
                  {proficiencies.map((prof, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <select
                        value={prof.game_name}
                        onChange={(e) => setProficiencies((p) => p.map((x, j) => j === i ? { ...x, game_name: e.target.value } : x))}
                        className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                        style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
                      >
                        <option value="">Select game...</option>
                        {gameOptions.map((game) => game.name.toUpperCase()).filter((g) => !usedGames.includes(g) || g === prof.game_name).map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={prof.proficiency_percent}
                        onFocus={(e) => e.currentTarget.select()}
                        onChange={(e) => setProficiencies((p) => p.map((x, j) => j === i ? { ...x, proficiency_percent: parseInt(e.target.value) || 0 } : x))}
                        className="w-16 px-2 py-2 rounded-xl text-xs outline-none text-center"
                        style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
                      />
                      <span className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>%</span>
                      {proficiencies.length > 1 && (
                        <button onClick={() => setProficiencies((p) => p.filter((_, j) => j !== i))} style={{ color: "hsl(var(--destructive))" }}><X size={14} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

                {/* Save */}
                <button
                  onClick={savePlayer}
                  disabled={saving}
                  className="w-full py-3 rounded-xl  text-sm tracking-widest flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))", color: "hsl(var(--cream))", fontFamily: "Electrolize, sans-serif" }}
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : null}
                  {saving ? "SAVING..." : editing ? "UPDATE PLAYER" : "CREATE PLAYER"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crop modal */}
      {cropDraft.open && cropDraft.kind && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: "hsla(var(--brown-deep) / 0.45)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "hsl(var(--cream-dark))" }}>
              <button onClick={closeCropper} className="text-sm px-3 py-1.5 rounded-lg" style={{ color: "hsl(var(--brown-deep))", background: "hsl(var(--input))" }}>
                Back
              </button>
              <h3 className="text-lg font-semibold" style={{ color: "hsl(var(--brown-deep))" }}>Edit media</h3>
              <button onClick={applyCrop} className="text-sm px-4 py-1.5 rounded-full font-semibold" style={{ color: "hsl(var(--cream))", background: "hsl(var(--brown))" }}>
                Apply
              </button>
            </div>

            <div className="p-6">
              <div
                className="mx-auto relative overflow-hidden select-none"
                style={{
                  width: `${getCropFrame(cropDraft.kind).width}px`,
                  height: `${getCropFrame(cropDraft.kind).height}px`,
                  borderRadius: cropDraft.kind === "avatar" ? "9999px" : "12px",
                  border: "3px solid hsl(var(--brown))",
                  cursor: isDraggingCrop ? "grabbing" : "grab",
                  background: "hsl(var(--input))",
                  touchAction: "none",
                }}
                onPointerDown={(e) => {
                  (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                  setIsDraggingCrop(true);
                  setDragStart({ x: e.clientX, y: e.clientY });
                  setDragStartOffset({ x: cropDraft.offsetX, y: cropDraft.offsetY });
                }}
                onPointerMove={(e) => {
                  if (!isDraggingCrop) return;
                  const nextX = dragStartOffset.x + (e.clientX - dragStart.x);
                  const nextY = dragStartOffset.y + (e.clientY - dragStart.y);
                  const clamped = clampOffsets(cropDraft.kind!, cropDraft.imageWidth, cropDraft.imageHeight, cropDraft.zoom, nextX, nextY);
                  setCropDraft((d) => ({ ...d, offsetX: clamped.x, offsetY: clamped.y }));
                }}
                onPointerUp={() => setIsDraggingCrop(false)}
                onPointerCancel={() => setIsDraggingCrop(false)}
              >
                <img
                  src={cropDraft.src}
                  alt="Crop preview"
                  draggable={false}
                  className="absolute top-1/2 left-1/2 pointer-events-none"
                  style={{
                    transform: `translate(calc(-50% + ${cropDraft.offsetX}px), calc(-50% + ${cropDraft.offsetY}px))`,
                    width: `${cropDraft.imageWidth * Math.max(getCropFrame(cropDraft.kind).width / cropDraft.imageWidth, getCropFrame(cropDraft.kind).height / cropDraft.imageHeight) * cropDraft.zoom}px`,
                    height: `${cropDraft.imageHeight * Math.max(getCropFrame(cropDraft.kind).width / cropDraft.imageWidth, getCropFrame(cropDraft.kind).height / cropDraft.imageHeight) * cropDraft.zoom}px`,
                    maxWidth: "none",
                  }}
                />
              </div>

              <div className="max-w-md mx-auto mt-5">
                <label className="block text-xs mb-2" style={{ color: "hsl(var(--brown-light))" }}>Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={cropDraft.zoom}
                  onChange={(e) => {
                    const nextZoom = parseFloat(e.target.value);
                    const clamped = clampOffsets(cropDraft.kind!, cropDraft.imageWidth, cropDraft.imageHeight, nextZoom, cropDraft.offsetX, cropDraft.offsetY);
                    setCropDraft((d) => ({ ...d, zoom: nextZoom, offsetX: clamped.x, offsetY: clamped.y }));
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsla(var(--brown-deep) / 0.5)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-8 max-w-sm w-full text-center" style={{ background: "hsl(var(--card))" }}>
            <Trash2 size={32} className="mx-auto mb-4" style={{ color: "hsl(var(--destructive))" }} />
            <h3 className=" font-bold text-lg mb-2" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Electrolize, sans-serif" }}>Delete Player?</h3>
            <p className="text-sm mb-6" style={{ color: "hsl(var(--brown-light))" }}>This will permanently delete <strong>{confirmDelete.name}</strong> and all their data.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: "hsl(var(--input))", color: "hsl(var(--brown))", border: "1px solid hsl(var(--cream-dark))" }}>Cancel</button>
              <button onClick={() => deletePlayer(confirmDelete)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "hsl(var(--destructive))", color: "white" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

