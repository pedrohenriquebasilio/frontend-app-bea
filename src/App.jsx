import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Fuel, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Droplet,
  Trash2,
  History,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

// --- CONFIGURAÇÃO DA API ---
const API_BASE_URL = 'https://sinaurb-app-bea-backend.nu5jqr.easypanel.host'; 

// --- SERVIÇO DE API ---
const apiService = {
  /**
   * ENDPOINT 1: Estatísticas do Dashboard
   * Rota: GET /dashboard/stats
   * O Backend DEVE retornar: { totalSpent, totalLiters, avgPrice, projectedTotal, monthName }
   */
  fetchDashboardStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
      if (!response.ok) throw new Error('Falha ao buscar estatísticas');
      return await response.json();
    } catch (error) {
      console.error("API Stats Error:", error);
      throw error;
    }
  },

  /**
   * ENDPOINT 2: Lista de Histórico
   * Rota: GET /fuel-logs
   * O Backend DEVE retornar: Array de logs [{ id, type, liters, total, date, ... }]
   */
  fetchLogs: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/fuel-logs`);
      if (!response.ok) throw new Error('Falha ao buscar logs');
      return await response.json();
    } catch (error) {
      console.error("API Logs Error:", error);
      throw error;
    }
  },

  /**
   * ENDPOINT 3: Criar Registro
   * Rota: POST /fuel-logs
   */
  createLog: async (logData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/fuel-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
      if (!response.ok) throw new Error('Falha ao criar registro');
      return await response.json();
    } catch (error) {
      console.error("API Create Error:", error);
      throw error;
    }
  },

  /**
   * ENDPOINT 4: Deletar Registro
   * Rota: DELETE /fuel-logs/:id
   */
  deleteLog: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/fuel-logs/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Falha ao deletar');
      return true;
    } catch (error) {
      console.error("API Delete Error:", error);
      throw error;
    }
  }
};

// --- COMPONENTES VISUAIS ---

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between transition-all hover:shadow-md h-full">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
  </div>
);

const HistoryItem = ({ item, onDelete }) => (
  <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg mb-2 shadow-sm hover:border-indigo-100 transition-all">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'gasolina' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
        <Fuel size={20} />
      </div>
      <div>
        <p className="font-semibold text-gray-800 capitalize">{item.type}</p>
        <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('pt-BR')} • {Number(item.liters).toFixed(2)}L</p>
      </div>
    </div>
    <div className="text-right flex items-center gap-4">
      <div>
        <p className="font-bold text-gray-800">R$ {Number(item.total).toFixed(2)}</p>
        <p className="text-xs text-gray-400">R$ {Number(item.pricePerLiter).toFixed(2)}/L</p>
      </div>
      <button onClick={() => onDelete(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
        <Trash2 size={18} />
      </button>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalLiters: 0,
    avgPrice: 0,
    projectedTotal: 0,
    monthName: '...'
  });
  const [logs, setLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: 'gasolina',
    liters: '',
    pricePerLiter: '5.80',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, logsData] = await Promise.all([
        apiService.fetchDashboardStats(),
        apiService.fetchLogs()
      ]);
      setStats(statsData);
      setLogs(logsData || []);
    } catch (err) {
      setError("Erro ao conectar com a API Backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Deseja remover este registro?')) {
      try {
        await apiService.deleteLog(id);
        loadData(); 
      } catch (err) {
        alert("Erro ao deletar");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      type: formData.type,
      liters: parseFloat(formData.liters),
      pricePerLiter: parseFloat(formData.pricePerLiter),
      date: formData.date
    };

    try {
      await apiService.createLog(payload);
      setFormData({ ...formData, liters: '' });
      setActiveTab('dashboard');
      loadData(); 
    } catch (err) {
      alert("Erro ao salvar.");
    } finally {
      setSubmitting(false);
    }
  };

  // Gerar Opções de Preço
  const priceOptions = [];
  for (let i = 5.00; i <= 6.01; i += 0.10) {
    priceOptions.push(i.toFixed(2));
  }

  // Opções de Litros
  const litersOptions = [10, 20, 30, 40, 50, 60];

  const toggleTab = () => {
    setActiveTab(activeTab === 'dashboard' ? 'add' : 'dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans pb-20 md:pb-0">
      <header className="bg-indigo-600 text-white p-4 md:p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Droplet className="fill-white" /> FuelControl
            </h1>
            <p className="text-indigo-200 text-xs md:text-sm">Frontend Renderer</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-xs opacity-70">Referência Backend</p>
              <p className="font-bold capitalize">{stats.monthName}</p>
            </div>
            
            <button 
              onClick={toggleTab}
              className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 border border-white/20"
            >
              {activeTab === 'dashboard' ? (
                <> <PlusCircle size={18} /> <span className="hidden sm:inline">Novo Registro</span> </>
              ) : (
                <> <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar</span> </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md flex items-center gap-3">
            <AlertCircle className="text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard 
                    title="Gasto Mensal" 
                    value={`R$ ${Number(stats.totalSpent).toFixed(2)}`} 
                    subtext={`Mês de ${stats.monthName}`}
                    icon={DollarSign}
                    colorClass="text-emerald-600 bg-emerald-600"
                  />
                  <StatCard 
                    title="Média Preço/L" 
                    value={`R$ ${Number(stats.avgPrice).toFixed(2)}`} 
                    subtext={`Total: ${Number(stats.totalLiters).toFixed(1)} Litros`}
                    icon={TrendingUp}
                    colorClass="text-blue-600 bg-blue-600"
                  />
                  <StatCard 
                    title="Previsão Fim do Mês" 
                    value={`R$ ${Number(stats.projectedTotal).toFixed(2)}`} 
                    subtext="Calculado pelo Backend"
                    icon={Calendar}
                    colorClass="text-purple-600 bg-purple-600"
                  />
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                      <History size={20} /> Histórico Recente
                    </h2>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">
                      {logs.length} registros
                    </span>
                  </div>
                  
                  {logs.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-400">Nenhum registro retornado pela API.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {logs.slice(0, 5).map(log => (
                        <HistoryItem key={log.id} item={log} onDelete={handleDelete} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'add' && (
              <div className="max-w-md mx-auto animate-fade-in">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 relative">
                  
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <PlusCircle className="text-indigo-600" /> Novo Abastecimento
                    </h2>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Combustível</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, type: 'gasolina'})}
                          className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${formData.type === 'gasolina' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                          <span className="font-bold">Gasolina</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, type: 'etanol'})}
                          className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${formData.type === 'etanol' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                          <span className="font-bold">Etanol</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade (Litros)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          name="liters"
                          required
                          value={formData.liters}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          className="w-full p-3 pl-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                        <span className="absolute right-4 top-3 text-gray-400 font-medium">L</span>
                      </div>
                      
                      {/* Sugestões de Litros */}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {litersOptions.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, liters: amount.toString() }))}
                            className={`px-3 py-1 text-xs rounded-full border transition-all ${
                              formData.liters === amount.toString()
                                ? 'bg-indigo-100 border-indigo-300 text-indigo-700 font-bold'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {amount}L
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço por Litro</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-500 font-medium">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          name="pricePerLiter"
                          value={formData.pricePerLiter}
                          onChange={handleInputChange}
                          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="0.00"
                        />
                      </div>
                      
                      {/* Sugestões de Preço */}
                      <div className="flex gap-2 mt-2 flex-wrap max-h-32 overflow-y-auto">
                        {priceOptions.map((price) => (
                          <button
                            key={price}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, pricePerLiter: price }))}
                            className={`px-3 py-1 text-xs rounded-full border transition-all ${
                              // Compara como número para evitar problemas com "5.8" vs "5.80"
                              Math.abs(Number(formData.pricePerLiter) - Number(price)) < 0.001
                                ? 'bg-indigo-100 border-indigo-300 text-indigo-700 font-bold'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {price}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                      {submitting ? 'Enviar para Cálculo e Salvar' : 'Registrar'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-medium mt-1">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'add' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <PlusCircle size={24} />
            <span className="text-[10px] font-medium mt-1">Novo</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
