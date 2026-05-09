"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState<any[]>([]);
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Stats
  const [stats, setStats] = useState({ 
    totalSales: 0, 
    totalLeads: 0, 
    totalProducts: 0,
    successOrders: 0,
    failedOrders: 0,
    pendingOrders: 0
  });

  // Form State
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({ 
    title: "", 
    price: "", 
    compare_at_price: "", 
    badge: "", 
    description: "", 
    image_url: "", 
    file_url: "", // Added for digital products
    category: "Ebook", 
    catalogue_id: "" 
  });
  
  const [isAddingCatalogue, setIsAddingCatalogue] = useState(false);
  const [newCatalogue, setNewCatalogue] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: pData } = await supabase.from("products").select("*, catalogues(name)").order("created_at", { ascending: false });
      const { data: cData } = await supabase.from("catalogues").select("*").order("name");
      const { data: lData } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      const { data: oData } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      
      if (pData) setProducts(pData);
      if (cData) setCatalogues(cData);
      if (lData) setLeads(lData);
      if (oData) setOrders(oData);
      
      const success = oData ? oData.filter(o => o.status === "completed") : [];
      const failed = oData ? oData.filter(o => o.status === "failed") : [];
      const pending = oData ? oData.filter(o => o.status === "pending") : [];
      
      const revenue = success.reduce((acc, curr) => acc + (curr.amount || 0), 0);

      setStats({
        totalSales: revenue,
        totalLeads: lData?.length || 0,
        totalProducts: pData?.length || 0,
        successOrders: success.length,
        failedOrders: failed.length,
        pendingOrders: pending.length
      });
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  }

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleEdit = (p: any) => {
    setEditingProduct(p);
    setNewProduct({
      title: p.title,
      price: p.price.toString(),
      compare_at_price: p.compare_at_price ? p.compare_at_price.toString() : "",
      badge: p.badge || "",
      description: p.description || "",
      image_url: p.image_url || "",
      file_url: p.file_url || "",
      category: p.category || "Ebook",
      catalogue_id: p.catalogue_id || ""
    });
    setIsAddingProduct(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex font-sans selection:bg-[var(--primary)] selection:text-white">
      {/* Sidebar Professional */}
      <aside className="w-72 bg-[#121214]/80 backdrop-blur-xl border-r border-white/5 flex flex-col h-screen sticky top-0 z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[#8b5cf6] rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-[var(--primary)]/20 text-white">M</div>
            <span className="font-bold text-xl tracking-tight">Magassa <span className="text-[var(--primary)] text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[#8b5cf6]">Hub</span></span>
          </div>

          <nav className="space-y-2">
            {[
              { id: "overview", label: "Vue d'ensemble", icon: "📊" },
              { id: "products", label: "Produits", icon: "📦" },
              { id: "collections", label: "Catalogues", icon: "📚" },
              { id: "orders", label: "Commandes", icon: "💳" },
              { id: "leads", label: "Base Clients", icon: "👥" },
              { id: "customization", label: "Design System", icon: "✨" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group ${activeTab === item.id ? "bg-white/5 text-white border border-white/10 shadow-inner" : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"}`}
              >
                <span className={`text-xl transition-transform duration-300 ${activeTab === item.id ? "scale-110" : "group-hover:scale-110"}`}>{item.icon}</span>
                <span className="font-bold text-sm tracking-wide uppercase">{item.label}</span>
                {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 bg-[var(--primary)] rounded-full shadow-[0_0_10px_var(--primary)]"></div>}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/admin/login";
            }}
            className="flex items-center gap-3 text-red-500/60 hover:text-red-500 transition-all font-bold text-sm uppercase tracking-widest w-full px-5 py-4 border border-red-500/10 rounded-2xl hover:bg-red-500/5"
          >
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-[#0a0a0b] relative">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-16">
          <div>
            <div className="text-[var(--primary)] font-black text-xs uppercase tracking-[0.3em] mb-2">Admin Dashboard</div>
            <h1 className="text-5xl font-black tracking-tighter">
              {activeTab === "overview" && "Performance"}
              {activeTab === "products" && "Inventaire"}
              {activeTab === "collections" && "Catalogues"}
              {activeTab === "orders" && "Commandes"}
              {activeTab === "leads" && "Communauté"}
              {activeTab === "customization" && "Éditeur"}
            </h1>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Boutique ↗
            </Link>
          </div>
        </header>

        {/* TAB: CATALOGUES */}
        {activeTab === "collections" && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center bg-[#121214]/50 p-8 rounded-[3rem] border border-white/5">
              <div>
                <h3 className="text-2xl font-black italic mb-2">Structure du Catalogue</h3>
                <p className="text-gray-500 text-sm">Organisez vos actifs par thématiques pour vos clients.</p>
              </div>
              <button 
                onClick={() => setIsAddingCatalogue(true)}
                className="px-8 py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[var(--primary)] hover:text-white transition-all shadow-xl shadow-white/5"
              >
                + Créer Catalogue
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {catalogues.map((c) => (
                <div key={c.id} className="bg-[#121214] border border-white/5 p-10 rounded-[3rem] group hover:border-[var(--primary)]/30 transition-all relative overflow-hidden">
                   <div className="text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.2em] mb-4 italic">Catalogue Actif</div>
                   <h4 className="text-3xl font-black mb-4 tracking-tighter italic">{c.name}</h4>
                   <div className="flex justify-between items-center pt-8 border-t border-white/5 mt-4">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                        {products.filter(p => p.catalogue_id === c.id).length} Produits liés
                      </span>
                      <button onClick={async () => {
                        if(confirm("Supprimer ce catalogue ?")) {
                          await supabase.from("catalogues").delete().eq("id", c.id);
                          fetchData();
                        }
                      }} className="text-red-500/40 hover:text-red-500 transition-colors text-[10px] font-bold uppercase">Supprimer</button>
                   </div>
                </div>
              ))}
            </div>

            {/* Catalogue Slide-over Form */}
            {isAddingCatalogue && (
              <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddingCatalogue(false)}></div>
                <div className="w-full max-w-xl bg-[#121214] h-full shadow-2xl relative z-10 border-l border-white/10 p-12 flex flex-col animate-in slide-in-from-right duration-500">
                  <div className="flex justify-between items-center mb-12">
                    <h2 className="text-4xl font-black italic tracking-tighter">Nouveau Catalogue</h2>
                    <button onClick={() => setIsAddingCatalogue(false)} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-all">✕</button>
                  </div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const slug = newCatalogue.name.toLowerCase().replace(/ /g, "-");
                    const { error } = await supabase.from("catalogues").insert([{ ...newCatalogue, slug }]);
                    if (!error) {
                      setIsAddingCatalogue(false);
                      setNewCatalogue({ name: "", description: "" });
                      fetchData();
                    }
                  }} className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nom du Catalogue</label>
                      <input type="text" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:border-[var(--primary)] outline-none transition-all font-bold text-lg" value={newCatalogue.name} onChange={(e) => setNewCatalogue({...newCatalogue, name: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description</label>
                      <textarea className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 h-48 focus:border-[var(--primary)] outline-none transition-all font-medium leading-relaxed" value={newCatalogue.description} onChange={(e) => setNewCatalogue({...newCatalogue, description: e.target.value})}></textarea>
                    </div>
                    <button type="submit" className="w-full bg-[var(--primary)] text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-[var(--primary)]/30 hover:-translate-y-2 transition-all">
                       Créer le Catalogue &rarr;
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-12 animate-in fade-in duration-700">
            {/* Primary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: "Chiffre d'Affaires", value: stats.totalSales.toLocaleString() + " FCFA", sub: "Ventes nettes confirmées", icon: "💰" },
                { label: "Ventes Réussies", value: stats.successOrders, sub: "Commandes livrées", icon: "✅" },
                { label: "Inscriptions", value: stats.totalLeads, sub: "Leads newsletter", icon: "👥" },
              ].map((s, i) => (
                <div key={i} className="bg-[#121214] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden group hover:border-[var(--primary)]/30 transition-all duration-500">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--primary)]/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-[var(--primary)]/10 transition-all"></div>
                  <div className="flex justify-between items-start mb-8 text-gray-500 font-bold text-xs uppercase tracking-widest italic">{s.label} <span className="text-xl">{s.icon}</span></div>
                  <div className="text-5xl font-black mb-4 text-white tracking-tighter">{s.value}</div>
                  <div className="text-gray-600 text-sm font-medium">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                 { label: "En attente", value: stats.pendingOrders, color: "text-yellow-500" },
                 { label: "Échecs", value: stats.failedOrders, color: "text-red-500" },
                 { label: "Produits", value: stats.totalProducts, color: "text-blue-500" },
                 { label: "Catalogues", value: catalogues.length, color: "text-purple-500" },
               ].map((s, i) => (
                 <div key={i} className="bg-[#121214]/50 border border-white/5 p-8 rounded-[2rem] flex flex-col justify-center items-center text-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{s.label}</div>
                    <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                 </div>
               ))}
            </div>

            <div className="bg-gradient-to-r from-[#121214] to-[#0a0a0b] border border-white/5 rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
              <div>
                <h3 className="text-3xl font-black mb-3 text-white tracking-tight italic">Design Management</h3>
                <p className="text-gray-500 text-lg max-w-lg">L'expérience utilisateur est le cœur de Magassa Hub. Personnalisez l'identité visuelle en un clic.</p>
              </div>
              <Link href="/admin/builder" className="group relative px-10 py-5 bg-[var(--primary)] text-white rounded-full font-black text-lg shadow-2xl shadow-[var(--primary)]/40 hover:scale-105 transition-all">
                Lancer Puck Editor
                <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 origin-center"></div>
              </Link>
            </div>
          </div>
        )}

        {/* TAB: PRODUCTS (THE "2026" VERSION) */}
        {activeTab === "products" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#121214]/50 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
              <div className="relative w-full md:w-96">
                <input 
                  type="text" 
                  placeholder="Rechercher un asset..." 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 pl-12 focus:border-[var(--primary)]/50 outline-none transition-all font-medium text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
              </div>
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setNewProduct({ title: "", price: "", compare_at_price: "", badge: "", description: "", image_url: "", file_url: "", category: "Ebook", catalogue_id: "" });
                  setIsAddingProduct(true);
                }}
                className="w-full md:w-auto px-8 py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[var(--primary)] hover:text-white transition-all shadow-xl shadow-white/5"
              >
                + Nouvel Asset
              </button>
            </div>

            {/* Catalogue Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-[#121214] border border-white/5 rounded-3xl overflow-hidden group hover:border-white/20 transition-all duration-300 flex flex-col relative shadow-xl">
                  {/* Image with overlay */}
                  <div className="aspect-video relative overflow-hidden bg-black">
                    <img src={p.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-4">
                       <span className="text-[#8efcc4] text-[11px] font-black tracking-tighter">
                        {p.price.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1 relative">
                    <div className="text-[var(--primary)] text-[9px] font-black uppercase tracking-widest mb-1 opacity-70 italic">
                      {(p as any).catalogues?.name || p.category || 'Sans Catalogue'}
                    </div>
                    <h3 className="text-sm font-bold text-white line-clamp-1 mb-4">{p.title}</h3>
                    
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
                       <button 
                        onClick={() => handleEdit(p)}
                        className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                       >
                        Éditer
                       </button>
                       <button onClick={async () => {
                         if(confirm("Détruire cet asset ?")) {
                           await supabase.from("products").delete().eq("id", p.id);
                           fetchData();
                         }
                       }} className="text-red-500/30 hover:text-red-500 transition-all text-xs">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-40 text-center bg-[#121214]/30 border border-dashed border-white/10 rounded-[3rem]">
                  <div className="text-4xl mb-4 opacity-20">📦</div>
                  <div className="text-gray-500 font-bold uppercase tracking-widest text-sm">Aucun asset trouvé</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SLIDE-OVER FORM (FOR PRODUCT CREATION) */}
        {isAddingProduct && (
          <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddingProduct(false)}></div>
            <div className="w-full max-w-xl bg-[#121214] h-full shadow-2xl relative z-10 border-l border-white/10 p-12 flex flex-col animate-in slide-in-from-right duration-500">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-black italic tracking-tighter">
                  {editingProduct ? "Éditer Asset" : "Créer Asset"}
                </h2>
                <button onClick={() => setIsAddingProduct(false)} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-all">✕</button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const slug = newProduct.title.toLowerCase().replace(/ /g, "-");
                const dataToSubmit = {
                  ...newProduct,
                  price: Number(newProduct.price),
                  compare_at_price: newProduct.compare_at_price === "" ? null : Number(newProduct.compare_at_price),
                  slug,
                  catalogue_id: newProduct.catalogue_id === "" ? null : newProduct.catalogue_id
                };
                
                if (editingProduct) {
                  // UPDATE
                  const { error } = await supabase
                    .from("products")
                    .update(dataToSubmit)
                    .eq("id", editingProduct.id);
                  
                  if (!error) {
                    setIsAddingProduct(false);
                    fetchData();
                  } else {
                    alert("Erreur mise à jour: " + error.message);
                  }
                } else {
                  // INSERT
                  const { error } = await supabase.from("products").insert([dataToSubmit]);
                  if (!error) {
                    setIsAddingProduct(false);
                    fetchData();
                  } else {
                    alert("Erreur création: " + error.message);
                  }
                }
              }} className="space-y-8 flex-1 overflow-y-auto pr-4 custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Titre de l'Asset</label>
                    <input type="text" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:border-[var(--primary)] outline-none transition-all font-bold text-lg" value={newProduct.title} onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Badge (ex: BEST SELLER)</label>
                    <input type="text" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:border-[var(--primary)] outline-none transition-all font-bold text-lg text-[var(--primary)]" placeholder="Optionnel" value={newProduct.badge} onChange={(e) => setNewProduct({...newProduct, badge: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Prix Promo (FCFA)</label>
                    <input type="number" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:border-[var(--primary)] outline-none transition-all font-bold" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Prix Barré (FCFA)</label>
                    <input type="number" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:border-[var(--primary)] outline-none transition-all font-bold opacity-60" placeholder="Ex: 15000" value={newProduct.compare_at_price} onChange={(e) => setNewProduct({...newProduct, compare_at_price: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Catalogue / Collection</label>
                    <select 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:border-[var(--primary)] outline-none transition-all font-bold appearance-none" 
                      value={(newProduct as any).catalogue_id || ""} 
                      onChange={(e) => setNewProduct({...newProduct, catalogue_id: e.target.value} as any)}
                    >
                      <option value="">Aucun catalogue</option>
                      {catalogues.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Image Cover</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        id="image-upload"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setNewProduct({ ...newProduct, image_url: reader.result as string });
                            reader.readAsDataURL(file);
                            
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${Math.random()}.${fileExt}`;
                            const filePath = `products/${fileName}`;
                            const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
                            if (uploadError) return alert("Erreur upload image: " + uploadError.message);
                            const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
                            setNewProduct({ ...newProduct, image_url: publicUrl });
                          }
                        }} 
                      />
                      <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 bg-black/40 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-[var(--primary)]/50 transition-all overflow-hidden text-center p-4">
                        {newProduct.image_url ? (
                          <img src={newProduct.image_url} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">📸 Cover Photo</div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Fichier Produit (PDF, ZIP...)</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        className="hidden" 
                        id="file-upload"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${Math.random()}.${fileExt}`;
                            const filePath = `downloads/${fileName}`;
                            const { error: uploadError } = await supabase.storage.from('product-files').upload(filePath, file);
                            if (uploadError) return alert("Erreur upload fichier: " + uploadError.message);
                            const { data: { publicUrl } } = supabase.storage.from('product-files').getPublicUrl(filePath);
                            setNewProduct({ ...newProduct, file_url: publicUrl });
                            // Store original name in a temporary data attribute or just show success
                            (e.target as any).dataset.name = file.name;
                            alert("Fichier prêt ! ✅");
                          }
                        }} 
                      />
                      <label htmlFor="file-upload" className={`flex flex-col items-center justify-center w-full h-32 bg-black/40 border-2 border-dashed ${newProduct.file_url ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-white/10'} rounded-2xl cursor-pointer hover:border-[var(--primary)]/50 transition-all text-center p-4 relative overflow-hidden`}>
                        {newProduct.file_url ? (
                          <div className="flex flex-col items-center animate-in zoom-in duration-300">
                            <span className="text-3xl mb-2">📄</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">Fichier Attaché</span>
                            <span className="text-[8px] text-gray-400 mt-1 truncate max-w-[150px]">Produit prêt pour la livraison</span>
                          </div>
                        ) : (
                          <>
                            <div className="text-2xl mb-2 opacity-20">📁</div>
                            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Charger le PDF/ZIP</div>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description Narrative</label>
                  <textarea className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 h-48 focus:border-[var(--primary)] outline-none transition-all font-medium leading-relaxed" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}></textarea>
                </div>

                <button type="submit" className="w-full bg-[var(--primary)] text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-[var(--primary)]/30 hover:-translate-y-2 transition-all mt-8">
                   {editingProduct ? "Enregistrer les modifications" : "Déployer l'Asset"} &rarr;
                </button>
              </form>
            </div>
          </div>
        )}

        {/* OTHER TABS (SIMPLIFIED FOR LOGIC) */}
        {activeTab === "orders" && (
           <div className="bg-[#121214] border border-white/5 rounded-[3rem] overflow-hidden animate-in fade-in duration-500 shadow-2xl">
             <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/20">
               <h3 className="text-2xl font-black italic">History</h3>
               <div className="flex gap-4">
                 <span className="px-5 py-2 bg-green-500/10 text-green-400 text-[10px] font-black rounded-full border border-green-500/20 uppercase tracking-widest">{orders.filter(o => o.status === "completed").length} Succès</span>
               </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-black/10 text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black border-b border-white/5">
                   <tr>
                     <th className="px-10 py-6">Timeline</th>
                     <th className="px-10 py-6">Customer Asset</th>
                     <th className="px-10 py-6">Revenue</th>
                     <th className="px-10 py-6">Identity</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 font-medium">
                   {orders.map((o) => (
                     <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                       <td className="px-10 py-8 text-sm text-gray-500 font-mono">{new Date(o.created_at).toLocaleDateString()}</td>
                       <td className="px-10 py-8">
                         <div className="text-white font-bold mb-1">{o.customer_email}</div>
                         <div className="text-[10px] text-[var(--primary)] font-black uppercase tracking-widest">Confirmed Buyer</div>
                       </td>
                       <td className="px-10 py-8">
                         <div className="text-2xl font-black text-[#8efcc4] tracking-tighter">{o.amount.toLocaleString()} FCFA</div>
                       </td>
                       <td className="px-10 py-8">
                         <span className="px-3 py-1 bg-white/5 rounded text-[9px] font-mono text-gray-400">#ORD-{o.id.slice(0,6)}</span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {activeTab === "leads" && (
           <div className="bg-[#121214] border border-white/5 rounded-[3rem] animate-in fade-in duration-500 shadow-2xl">
             <div className="p-10 border-b border-white/5">
               <h3 className="text-2xl font-black italic">Leads Database</h3>
             </div>
             <div className="divide-y divide-white/5">
               {leads.map((l) => (
                 <div key={l.id} className="p-10 flex justify-between items-center group hover:bg-white/[0.01] transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📧</div>
                      <div>
                        <div className="text-xl font-bold text-white mb-1">{l.email}</div>
                        <div className="text-xs text-gray-500 font-black uppercase tracking-widest">Source: {l.source} &bull; Active Lead</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 font-mono italic">Added {new Date(l.created_at).toLocaleDateString()}</div>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {activeTab === "customization" && (
           <div className="max-w-4xl mx-auto py-20 text-center animate-in zoom-in-95 duration-700">
             <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center text-5xl mx-auto mb-10 border border-white/10 shadow-inner">⚡</div>
             <h2 className="text-6xl font-black italic tracking-tighter mb-6">Puck Interface</h2>
             <p className="text-2xl text-gray-500 mb-16 font-medium max-w-2xl mx-auto leading-relaxed text-balance">L'évolution de votre site ne devrait pas être limitée par le code. Libérez votre créativité.</p>
             <Link href="/admin/builder" className="inline-block bg-white text-black px-16 py-6 rounded-full font-black text-2xl shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter">
                Enter Editor &rarr;
             </Link>
           </div>
        )}
      </main>
    </div>
  );
}
