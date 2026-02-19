import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const ITEMS_LIST = ["Dagger", "Shield", "Mirror", "Red Flag", "VISA", "Immunity Seal"];

export default function AdminItems() {
  const [players, setPlayers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("players").select("id, name, player_id").then(({ data }) => data && setPlayers(data));
    supabase.from("items").select("*").then(({ data }) => data && setItems(data));
  }, []);

  const assign = async (playerId: string, playerName: string) => {
    if (!selectedItem) return toast.error("Select an item first");
    const item = items.find((i) => i.name === selectedItem);
    if (!item) return toast.error("Item not found");
    setSaving(true);
    const { error } = await supabase.from("player_items").insert({ player_id: playerId, item_id: item.id });
    if (error) toast.error("Already assigned or error");
    else {
      await supabase.from("activity_logs").insert({ action: "ASSIGN_ITEM", target: `${selectedItem} → ${playerName}` });
      toast.success(`${selectedItem} assigned to ${playerName}`);
    }
    setSaving(false);
  };

  const filtered = players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.player_id.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-cinzel font-bold mb-1" style={{ color: "hsl(var(--brown-deep))", fontFamily: "Cinzel, serif" }}>Assign Items</h1>
        <p className="text-sm mb-8" style={{ color: "hsl(var(--brown-light))" }}>Select an item then click a player to assign</p>

        <div className="mb-6">
          <p className="text-xs font-cinzel tracking-widest mb-3" style={{ color: "hsl(var(--brown))", fontFamily: "Cinzel, serif" }}>SELECT ITEM</p>
          <div className="flex flex-wrap gap-3">
            {ITEMS_LIST.map((item) => (
              <button key={item} onClick={() => setSelectedItem(item)}
                className="px-4 py-2 rounded-full text-sm font-cinzel transition-all"
                style={{ background: selectedItem === item ? "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))" : "white", color: selectedItem === item ? "hsl(var(--cream))" : "hsl(var(--brown))", border: "1px solid hsl(var(--cream-dark))", fontFamily: "Cinzel, serif" }}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--brown-light))" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search player..." className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--cream-dark))", color: "hsl(var(--brown-deep))" }} />
        </div>

        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "white", border: "1px solid hsl(var(--cream-dark))" }}>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: "hsl(var(--brown-deep))" }}>{p.name}</p>
                <p className="text-xs" style={{ color: "hsl(var(--brown-light))" }}>{p.player_id}</p>
              </div>
              <button onClick={() => assign(p.id, p.name)} disabled={saving || !selectedItem}
                className="px-4 py-2 rounded-xl text-sm font-cinzel tracking-wider disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, hsl(var(--brown)), hsl(var(--brown-light)))", color: "hsl(var(--cream))", fontFamily: "Cinzel, serif" }}>
                ASSIGN
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
