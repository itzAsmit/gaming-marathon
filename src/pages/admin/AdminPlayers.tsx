import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, Eye, X, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";

const GAMES_LIST = ["AMONG US", "BGMI", "SCRIBBL", "CARROM", "CHESS", "UNO", "LUDO", "SMASH KARTS", "STUMBLE GUYS", "BOBBLE LEAGUE", "CODENAMES"];

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
}

interface Proficiency { game_name: string; proficiency_percent: number; }

const BLANK: Omit<Player, "id"> = { player_id: "", name: "", bio: null, image_url: null, portrait_url: null, instagram: null, twitter: null, linkedin: null };

const logActivity = async (action: string, target: string) => {
  await supabase.from("activity_logs").insert({ action, target });
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
  const avatarRef = useRef<HTMLInputElement>(null);
  const portraitRef = useRef<HTMLInputElement>(null);

  const fetchPlayers = async () => {
    const { data } = await supabase.from("players").select("*").order("player_id");
    if (data) setPlayers(data);
    setLoading(false);
  };

  useEffect(() => { fetchPlayers(); }, []);

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
    const { data: profs } = await supabase.from("player_proficiencies").select("*").eq("player_id", p.id);
    setProficiencies(profs && profs.length > 0 ? profs : [{ game_name: "", proficiency_percent: 50 }]);
    setAvatarFile(null);
    setPortraitFile(null);
    setShowForm(true);
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
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
        await supabase.from("players").update(payload).eq("id", editing.id);
        await supabase.from("player_proficiencies").delete().eq("player_id", editing.id);
        if (validProfs.length > 0) {
          await supabase.from("player_proficiencies").insert(validProfs.map((p) => ({ ...p, player_id: editing.id })));
        }
        await logActivity("EDIT_PLAYER", form.name);
        toast.success("Player updated!");
      } else {
        const { data: newPlayer } = await supabase.from("players").insert(payload).select().single();
        if (newPlayer && validProfs.length > 0) {
          await supabase.from("player_proficiencies").insert(validProfs.map((p) => ({ ...p, player_id: newPlayer.id })));
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
    await supabase.from("players").delete().eq("id", p.id);
    await logActivity("DELETE_PLAYER", p.name);
    toast.success("Player deleted");
    setConfirmDelete(null);
    fetchPlayers();
  };

  const usedGames = proficiencies.map((p) => p.game_name).filter(Boolean);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-cinzel font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Cinzel, serif" }}>Players</h1>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--brown-light))" }}>{players.length} registered</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-cinzel text-sm tracking-wider"
            style={{ background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))", color: "hsl(var(--cream))", fontFamily: "Cinzel, serif" }}
          >
            <Plus size={16} /> ADD PLAYER
          </button>
        </div>

        {/* Player list */}
        {loading ? (
          <div className="flex justify-center py-20"><RefreshCw size={24} className="animate-spin" style={{ color: "hsl(var(--brown-light))" }} /></div>
        ) : (
          <div className="space-y-3">
            {players.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "white", border: "1px solid hsl(var(--cream-dark))" }}>
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{ background: "hsl(var(--cream))" }}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold" style={{ color: "hsl(var(--brown))" }}>{p.name[0]}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "hsl(var(--brown-deep))" }}>{p.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "hsl(var(--brown-light))" }}>{p.player_id}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" style={{ background: "hsl(var(--cream))", color: "hsl(var(--brown))" }}>
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
        )}
      </div>

      {/* Player Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsla(var(--brown-deep) / 0.5)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid hsl(var(--cream-dark))" }}>
            <div className="max-h-[90vh] overflow-y-auto [scrollbar-gutter:stable]">
              <div className="sticky top-0 z-20 flex items-center justify-between p-6 border-b" style={{ background: "white", borderColor: "hsl(var(--cream-dark))" }}>
                <h2 className="text-lg font-cinzel font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Cinzel, serif" }}>
                  {editing ? "Edit Player" : "Create Player"}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ color: "hsl(var(--brown-light))" }}><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5">
              {/* ID (read-only) */}
              <div>
                <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>PLAYER ID</label>
                <input value={form.player_id} readOnly className="w-full px-4 py-2.5 rounded-xl text-sm outline-none opacity-60" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>NAME *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} placeholder="Player name" />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>BIO</label>
                <textarea rows={3} value={form.bio ?? ""} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} placeholder="Short bio..." />
              </div>

              {/* Image uploads */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>AVATAR (circle)</label>
                  <div
                    className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ borderColor: "hsl(var(--cream-dark))" }}
                    onClick={() => avatarRef.current?.click()}
                  >
                    {avatarFile ? (
                      <img src={URL.createObjectURL(avatarFile)} alt="" className="w-16 h-16 rounded-full object-cover mx-auto" />
                    ) : form.image_url ? (
                      <img src={form.image_url} alt="" className="w-16 h-16 rounded-full object-cover mx-auto" />
                    ) : (
                      <Upload size={20} className="mx-auto mb-1" style={{ color: "hsl(var(--brown-light))" }} />
                    )}
                    <p className="text-xs mt-1" style={{ color: "hsl(var(--brown-light))" }}>Upload</p>
                  </div>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setAvatarFile(e.target.files[0])} />
                </div>
                <div>
                  <label className="block text-xs font-cinzel tracking-widest mb-1.5" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>PORTRAIT (3:4)</label>
                  <div
                    className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ borderColor: "hsl(var(--cream-dark))" }}
                    onClick={() => portraitRef.current?.click()}
                  >
                    {portraitFile ? (
                      <img src={URL.createObjectURL(portraitFile)} alt="" className="w-12 h-16 object-cover mx-auto rounded" />
                    ) : form.portrait_url ? (
                      <img src={form.portrait_url} alt="" className="w-12 h-16 object-cover mx-auto rounded" />
                    ) : (
                      <Upload size={20} className="mx-auto mb-1" style={{ color: "hsl(var(--brown-light))" }} />
                    )}
                    <p className="text-xs mt-1" style={{ color: "hsl(var(--brown-light))" }}>Upload</p>
                  </div>
                  <input ref={portraitRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setPortraitFile(e.target.files[0])} />
                </div>
              </div>

              {/* Social */}
              <div className="grid grid-cols-3 gap-3">
                {(["instagram", "twitter", "linkedin"] as const).map((s) => (
                  <div key={s}>
                    <label className="block text-xs font-cinzel tracking-widest mb-1.5 capitalize" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>{s.toUpperCase()}</label>
                    <input value={(form as any)[s] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [s]: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} placeholder={`https://www.example.com`} />
                  </div>
                ))}
              </div>

              {/* Proficiencies */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-cinzel tracking-widest" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>GAME PROFICIENCY (1-3)</label>
                  {proficiencies.length < 3 && (
                    <button onClick={() => setProficiencies((p) => [...p, { game_name: "", proficiency_percent: 50 }])} className="text-xs font-cinzel" style={{ color: "hsl(var(--brown-light))", fontFamily: "Cinzel, serif" }}>+ Add</button>
                  )}
                </div>
                <div className="space-y-3">
                  {proficiencies.map((prof, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <select
                        value={prof.game_name}
                        onChange={(e) => setProficiencies((p) => p.map((x, j) => j === i ? { ...x, game_name: e.target.value } : x))}
                        className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                        style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
                      >
                        <option value="">Select game...</option>
                        {GAMES_LIST.filter((g) => !usedGames.includes(g) || g === prof.game_name).map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={prof.proficiency_percent}
                        onChange={(e) => setProficiencies((p) => p.map((x, j) => j === i ? { ...x, proficiency_percent: parseInt(e.target.value) || 0 } : x))}
                        className="w-16 px-2 py-2 rounded-xl text-xs outline-none text-center"
                        style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }}
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
                  className="w-full py-3 rounded-xl font-cinzel text-sm tracking-widest flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))", color: "hsl(var(--cream))", fontFamily: "Cinzel, serif" }}
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : null}
                  {saving ? "SAVING..." : editing ? "UPDATE PLAYER" : "CREATE PLAYER"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "hsla(var(--brown-deep) / 0.5)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-8 max-w-sm w-full text-center" style={{ background: "white" }}>
            <Trash2 size={32} className="mx-auto mb-4" style={{ color: "hsl(var(--destructive))" }} />
            <h3 className="font-cinzel font-bold text-lg mb-2" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Cinzel, serif" }}>Delete Player?</h3>
            <p className="text-sm mb-6" style={{ color: "hsl(var(--brown-light))" }}>This will permanently delete <strong>{confirmDelete.name}</strong> and all their data.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: "hsl(var(--cream))", color: "hsl(var(--brown))", border: "1px solid hsl(var(--cream-dark))" }}>Cancel</button>
              <button onClick={() => deletePlayer(confirmDelete)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "hsl(var(--destructive))", color: "white" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
