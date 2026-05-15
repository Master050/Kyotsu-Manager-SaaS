import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../config/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Loader2, Save, ShoppingCart, RefreshCw, Lock, TrendingUp, TrendingDown, Package } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inventario_casa")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar dados do Supabase");
      console.error(error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleCellChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value, is_dirty: true } : item))
    );
  };

  const saveChanges = async () => {
    const dirtyItems = items.filter((i) => i.is_dirty);
    if (dirtyItems.length === 0) {
      toast.info("Nenhuma alteração pendente.");
      return;
    }

    setSaving(true);
    let successCount = 0;
    
    for (const item of dirtyItems) {
      const { id, nome, categoria, quantidade_atual, quantidade_ideal, preco_ultima_compra } = item;
      const { error } = await supabase
        .from("inventario_casa")
        .update({ nome, categoria, quantidade_atual, quantidade_ideal, preco_ultima_compra })
        .eq("id", id);
      
      if (!error) successCount++;
    }

    if (successCount === dirtyItems.length) {
      toast.success(`${successCount} itens atualizados com sucesso!`);
      // Clean dirty state
      setItems((prev) => prev.map(i => ({ ...i, is_dirty: false })));
    } else {
      toast.error("Houve um erro ao salvar alguns itens.");
    }
    setSaving(false);
  };

  const addNewItem = async () => {
    const newItem = {
      nome: "Novo Produto",
      categoria: "Geral",
      quantidade_atual: 0,
      quantidade_ideal: 1,
      preco_ultima_compra: 0.0,
    };
    
    const { data, error } = await supabase
      .from("inventario_casa")
      .insert([newItem])
      .select();

    if (error) {
      toast.error("Erro ao criar nova linha");
    } else if (data) {
      setItems([data[0], ...items]);
      toast.success("Nova linha adicionada");
    }
  };

  const deleteItem = async (id) => {
    const { error } = await supabase.from("inventario_casa").delete().eq("id", id);
    if (!error) {
      setItems(items.filter((i) => i.id !== id));
      toast.success("Item removido");
    } else {
      toast.error("Erro ao remover item");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Cálculo rápido: total de itens faltando
  const itemsToBuy = items.filter((i) => i.quantidade_atual < i.quantidade_ideal);
  const totalCostEstimate = itemsToBuy.reduce((acc, curr) => {
    const diff = curr.quantidade_ideal - curr.quantidade_atual;
    return acc + (diff * (curr.preco_ultima_compra || 0));
  }, 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card flex items-center justify-between p-6 overflow-hidden relative"
      >
        <div className="relative z-10">
          <h1 className="text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-400 flex items-center gap-2">
            <ShoppingCart size={24} className="text-purple-400" />
            Home Inventory
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-1">
            Gestão de dispensa inteligente conectada à Nuvem
          </p>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          {itemsToBuy.length > 0 && (
            <div className="flex flex-col items-end mr-4">
               <span className="text-xs text-red-400 font-mono font-bold">{itemsToBuy.length} Itens em falta</span>
               <span className="text-xs text-slate-400 font-mono tracking-tighter">Custo Estimado: {formatCurrency(totalCostEstimate)}</span>
            </div>
          )}
          <button 
            onClick={fetchInventory}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center gap-2 text-slate-300"
          >
            <RefreshCw size={16} />
          </button>
          <button 
            onClick={saveChanges}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/40 transition flex items-center gap-2 text-purple-200 font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Salvar
          </button>
          <button 
            onClick={addNewItem}
            className="px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/40 transition flex items-center gap-2 text-blue-200 font-semibold"
          >
            <Plus size={16} /> Nova Linha
          </button>
        </div>
      </motion.div>

      <motion.div
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.1 }}
         className="glass-card overflow-hidden" 
      >
        <div className="w-full overflow-x-auto" ref={scrollRef}>
          <table className="w-full text-sm text-left">
            <thead className="bg-black/40 text-xs font-mono uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 w-[40px]">St</th>
                <th className="px-4 py-3 min-w-[200px]">Produto</th>
                <th className="px-4 py-3 min-w-[150px]">Categoria</th>
                <th className="px-4 py-3 w-[120px] text-center">Atual</th>
                <th className="px-4 py-3 w-[120px] text-center">Ideal</th>
                <th className="px-4 py-3 min-w-[120px] text-right">Preço Un.</th>
                <th className="px-4 py-3 w-[60px] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Carregando tabela do Supabase...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Nenhum item adicionado à sua casa.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const outOfStock = Number(item.quantidade_atual) < Number(item.quantidade_ideal);
                  return (
                    <tr key={item.id} className={`hover:bg-white/5 transition-colors ${item.is_dirty ? 'bg-amber-900/10' : ''}`}>
                      <td className="px-4 py-2">
                        <div className={`w-3 h-3 rounded-full mx-auto ${outOfStock ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'}`} />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          value={item.nome || ""}
                          onChange={(e) => handleCellChange(item.id, "nome", e.target.value)}
                          className="w-full bg-transparent border-0 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 outline-none text-white placeholder-slate-600"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          value={item.categoria || ""}
                          onChange={(e) => handleCellChange(item.id, "categoria", e.target.value)}
                          className="w-full bg-transparent border-0 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 outline-none text-slate-300 placeholder-slate-600"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <input
                          type="number"
                          value={item.quantidade_atual}
                          onChange={(e) => handleCellChange(item.id, "quantidade_atual", e.target.value)}
                          className="w-20 bg-black/20 border border-white/10 focus:border-purple-500 rounded px-2 py-1 text-center outline-none"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <input
                          type="number"
                          value={item.quantidade_ideal}
                          onChange={(e) => handleCellChange(item.id, "quantidade_ideal", e.target.value)}
                          className="w-20 bg-black/20 border border-white/10 focus:border-purple-500 rounded px-2 py-1 text-center outline-none opacity-80"
                        />
                      </td>
                      <td className="px-2 py-1 text-right">
                        <div className="flex justify-end items-center gap-1">
                           <span className="text-slate-500 text-xs">R$</span>
                           <input
                            type="number"
                            step="0.01"
                            value={item.preco_ultima_compra}
                            onChange={(e) => handleCellChange(item.id, "preco_ultima_compra", e.target.value)}
                            className="w-24 bg-transparent border-0 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 text-right outline-none text-blue-300"
                           />
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button 
                          onClick={() => deleteItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/20 rounded transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
