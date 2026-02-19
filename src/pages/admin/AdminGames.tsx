import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, RefreshCw, X, Upload, ToggleLeft, ToggleRight } from "lucide-react";
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
  status: string;
}

interface GameRanking { rank: number; player_id: string; player_name?: string; }

const logActivity = async (action: string, target: string) => {
  await supabase.from("activity_logs").insert({ action, target });
};

function getNextGameId(existing: string[]): string {
  const nums = existing.map((id) => parseInt(id.replace("#G", ""))).filter((n) => !isNaN(n)).sort((a, b) => a - b);
  for (let i = 1; ; i++) {
    if (!nums.includes(i)) return `#G${String(i).padStart(2, "0")}`;
  }
}

const BLANK_GAME: Omit<Game, "id"> = { game_id: "", name: "", bio: null, image_url: null, video_url: null, rules: null, game_date: null, status: "upcoming" };

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

  const openCreate = () => {
    const nextId = getNextGameId(games.map((g) => g.game_id));
    setEditing(null);
    setForm({ ...BLANK_GAME, game_id: nextId });
    setRankings([]);
    setImageFile(null);
    setVideoFile(null);
    setShowForm(true);
  };

  const openEdit = async (g: Game) => {
    setEditing(g);
    setForm({ ...g });
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

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const saveGame = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      let imageUrl = form.image_url;
      let videoUrl = form.video_url;
      if (imageFile) imageUrl = await uploadFile(imageFile, "games", `images/${form.game_id}-${Date.now()}`);
      if (videoFile) videoUrl = await uploadFile(videoFile, "videos", `${form.game_id}-${Date.now()}`);

      const payload = { ...form, image_url: imageUrl, video_url: videoUrl };

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
    } catch (e) {
      toast.error("Error saving game");
    } finally {
      setSaving(false);
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
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--brown-deep))" }}>{g.name}</p>
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
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: "white" }}>
            <div className="sticky top-0 flex items-center justify-between p-6 border-b" style={{ background: "white", borderColor: "hsl(var(--cream-dark))" }}>
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
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} placeholder="Game name" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>DATE</label>
                <input type="date" value={form.game_date ?? ""} onChange={(e) => setForm((f) => ({ ...f, game_date: e.target.value || null }))} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} />
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
                  <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setImageFile(e.target.files[0])} />
                </div>
                <div>
                  <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>BG VIDEO</label>
                  <div className="border-2 border-dashed rounded-xl p-3 text-center cursor-pointer" style={{ borderColor: "hsl(var(--cream-dark))" }} onClick={() => videoRef.current?.click()}>
                    {videoFile ? <p className="text-xs font-medium" style={{ color: "hsl(var(--brown))" }}>{videoFile.name}</p> : form.video_url ? <p className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>Video set</p> : <Upload size={20} className="mx-auto" style={{ color: "hsl(var(--brown-light))" }} />}
                    <p className="text-xs mt-1" style={{ color: "hsl(var(--brown-light))" }}>Click to upload</p>
                  </div>
                  <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && setVideoFile(e.target.files[0])} />
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
    </AdminLayout>
  );
}
