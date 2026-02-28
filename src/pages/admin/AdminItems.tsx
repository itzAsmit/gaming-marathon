import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { raceDataFetch } from "@/lib/raceDataFetch";
import { adminMutation } from "@/lib/adminMutation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

type AssignedItem = {
  id: string;
  item_id: string;
  items: {
    id: string;
    name: string;
  } | null;
};

type AdminPlayer = {
  id: string;
  name: string;
  player_id: string;
  is_active: boolean;
  player_items: AssignedItem[];
};

type Item = {
  id: string;
  name: string;
};

export default function AdminItems() {
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);

    try {
      const [playersData, itemsData] = await Promise.all([
        raceDataFetch<AdminPlayer[]>(
          () => (supabase as any)
            .from("players")
            .select("id, name, player_id, is_active, player_items(id, item_id, items(id, name))")
            .eq("is_active", true)
            .order("player_id", { ascending: true }),
          "admin_players_with_items",
        ),
        raceDataFetch<Item[]>(
          () => supabase.from("items").select("id, name").order("name", { ascending: true }),
          "admin_items",
        ),
      ]);

      const normalizedPlayers = playersData.map((p: any) => ({
        ...p,
        player_items: p.player_items ?? [],
      }));
      setPlayers(normalizedPlayers);
      setSelectedPlayerId((prev) => {
        if (prev && normalizedPlayers.some((p: AdminPlayer) => p.id === prev)) return prev;
        return normalizedPlayers[0]?.id ?? "";
      });

      setItems(itemsData);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPlayers = useMemo(
    () => players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.player_id.toLowerCase().includes(search.toLowerCase())),
    [players, search],
  );

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) ?? null;

  const assignToSelectedPlayer = async (item: Item) => {
    if (!selectedPlayer) return toast.error("Select a player first");
    const alreadyAssigned = selectedPlayer.player_items?.some((pi) => pi.item_id === item.id);
    if (alreadyAssigned) return;

    setSaving(true);
    const { error } = await adminMutation.insert("player_items", { player_id: selectedPlayer.id, item_id: item.id });
    if (error) toast.error("Already assigned or failed to assign");
    else {
      await adminMutation.insert("activity_logs", { action: "ASSIGN_ITEM", target: `${item.name} → ${selectedPlayer.name}` });
      toast.success(`${item.name} assigned to ${selectedPlayer.name}`);
      await loadData();
    }
    setSaving(false);
  };

  const unassignFromPlayer = async (player: AdminPlayer, assignment: AssignedItem) => {
    setSaving(true);
    const { error } = await adminMutation.delete("player_items", { id: assignment.id });
    if (error) toast.error("Failed to unassign item");
    else {
      await adminMutation.insert("activity_logs", { action: "UNASSIGN_ITEM", target: `${assignment.items?.name ?? "Item"} ✕ ${player.name}` });
      toast.success(`${assignment.items?.name ?? "Item"} removed from ${player.name}`);
      await loadData();
    }
    setSaving(false);
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h1 className="text-2xl font-cinzel font-bold" style={{ color: "hsl(var(--brown-deep))", fontFamily: "'ROWAN', serif" }}>Assign Items</h1>
          <button
            onClick={loadData}
            disabled={refreshing || saving}
            className="px-3 py-2 rounded-xl text-xs font-cinzel tracking-wider flex items-center gap-2 disabled:opacity-60"
            style={{ background: "hsl(var(--input))", color: "hsl(var(--brown-deep))", border: "1px solid hsl(var(--cream-dark))", fontFamily: "'ROWAN', serif" }}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            REFRESH
          </button>
        </div>
        <p className="text-sm mb-8" style={{ color: "hsl(var(--brown-light))" }}>Select a player, then click an item to assign. Click assigned chips to unassign.</p>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}>
            <p className="text-xs font-cinzel tracking-widest mb-3" style={{ color: "hsl(var(--brown))", fontFamily: "'ROWAN', serif" }}>PLAYERS & ASSIGNED ITEMS</p>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--brown-light))" }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search player..." className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} />
            </div>

            <div className="relative md:max-h-[60dvh] overflow-hidden rounded-xl">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-7 scroll-fade-edge" style={{ background: "linear-gradient(180deg, hsl(var(--card)), transparent)" }} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-7 scroll-fade-edge" style={{ background: "linear-gradient(0deg, hsl(var(--card)), transparent)" }} />
              <div className="space-y-2 max-h-none md:max-h-[60dvh] overflow-y-visible md:overflow-y-auto animated-scroll-area py-1 pr-1">
                {filteredPlayers.map((p) => {
                  const isSelected = selectedPlayerId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlayerId(p.id)}
                      className="w-full text-left rounded-xl p-4 transition-all animated-scroll-item"
                      style={{
                        background: isSelected ? "hsl(var(--input))" : "hsl(var(--card))",
                        border: isSelected ? "1px solid hsl(var(--brown))" : "1px solid hsl(var(--cream-dark))",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "hsl(var(--brown-deep))" }}>{p.name}</p>
                          <p className="text-xs" style={{ color: "hsl(var(--brown))" }}>{p.player_id}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.player_items && p.player_items.length > 0 ? (
                          p.player_items.map((assignment) => (
                            <span
                              key={assignment.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                unassignFromPlayer(p, assignment);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs cursor-pointer"
                              style={{ background: "hsla(var(--brown) / 0.12)", color: "hsl(var(--brown-deep))", border: "1px solid hsla(var(--brown) / 0.35)" }}
                            >
                              {assignment.items?.name ?? "Unknown"}
                              <X size={12} />
                            </span>
                          ))
                        ) : (
                          <span className="text-xs" style={{ color: "hsl(var(--brown))" }}>
                            NONE
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredPlayers.length === 0 && (
              <p className="text-sm mt-4" style={{ color: "hsl(var(--brown-light))" }}>No players found.</p>
            )}
          </div>

          <div className="rounded-2xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--cream-dark))" }}>
            <p className="text-xs font-cinzel tracking-widest mb-3" style={{ color: "hsl(var(--brown))", fontFamily: "'ROWAN', serif" }}>ITEMS</p>

            <div className="mb-4 rounded-xl p-3" style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--cream-dark))" }}>
              <p className="text-xs mb-1" style={{ color: "hsl(var(--brown-light))" }}>Selected player</p>
              <p className="text-sm font-semibold" style={{ color: "hsl(var(--brown-deep))" }}>
                {selectedPlayer ? `${selectedPlayer.name} (${selectedPlayer.player_id})` : "No player selected"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {items.map((item) => {
                const assigned = selectedPlayer?.player_items?.some((pi) => pi.item_id === item.id) ?? false;
                return (
                  <button
                    key={item.id}
                    onClick={() => assignToSelectedPlayer(item)}
                    disabled={!selectedPlayer || assigned || saving}
                    className="px-3 py-2 rounded-xl text-xs font-cinzel tracking-wider transition-all disabled:opacity-50"
                    style={{
                      background: assigned
                        ? "hsla(var(--brown-light) / 0.2)"
                        : "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))",
                      color: assigned ? "hsl(var(--brown))" : "hsl(var(--cream))",
                      border: assigned ? "1px solid hsl(var(--brown-light))" : "1px solid transparent",
                      fontFamily: "'ROWAN', serif",
                    }}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-cinzel tracking-widest mb-2" style={{ color: "hsl(var(--brown))", fontFamily: "'ROWAN', serif" }}>ASSIGNED TO SELECTED PLAYER</p>
            <div className="flex flex-wrap gap-2">
              {selectedPlayer && selectedPlayer.player_items.length > 0 ? (
                selectedPlayer.player_items.map((assignment) => (
                  <button
                    key={assignment.id}
                    onClick={() => unassignFromPlayer(selectedPlayer, assignment)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                    style={{ background: "hsla(var(--brown) / 0.12)", color: "hsl(var(--brown-deep))", border: "1px solid hsla(var(--brown) / 0.35)" }}
                  >
                    {assignment.items?.name ?? "Unknown"}
                    <X size={12} />
                  </button>
                ))
              ) : (
                <span className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>
                  NONE
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

