import React, { useState, useEffect } from 'react';
import { getTasks, createTask, deleteTask, updateTask } from './api';
import { Brain, Trash2, Edit3, PlusCircle, Loader2, Activity, PieChart, BarChart3, Clock, Sparkles } from 'lucide-react';

const getTheme = (cat) => {
  const themes = {
    Work: { color: '#38bdf8' },
    Personal: { color: '#4ade80' },
    Urgent: { color: '#fb7185' },
    Study: { color: '#c084fc' },
    General: { color: '#94a3b8' }
  };
  return themes[cat] || themes.General;
};

// --- DASHBOARD VIEW ---
const DashboardView = ({ setView, tasks, startEdit, handleDelete }) => {
  const stats = {
    total: tasks.length,
    urgent: tasks.filter(t => t.category === 'Urgent').length,
    work: tasks.filter(t => t.category === 'Work').length,
    study: tasks.filter(t => t.category === 'Study').length
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
      <div style={statsGrid}>
        <div style={statCard} className="glass-hover">
          <Activity size={20} color="#38bdf8" />
          <div><div style={statLabel}>Total Nodes</div><div style={statValue}>{stats.total}</div></div>
        </div>
        <div style={statCard} className="glass-hover">
          <Clock size={20} color="#fb7185" />
          <div><div style={statLabel}>Urgent</div><div style={statValue}>{stats.urgent}</div></div>
        </div>
        <div style={statCard} className="glass-hover">
          <BarChart3 size={20} color="#4ade80" />
          <div><div style={statLabel}>Work</div><div style={statValue}>{stats.work}</div></div>
        </div>
        <div style={statCard} className="glass-hover">
          <PieChart size={20} color="#c084fc" />
          <div><div style={statLabel}>Study</div><div style={statValue}>{stats.study}</div></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h2 style={{ color: '#f8fafc', margin: 0 }}>System Overview</h2>
        <button onClick={() => setView('add')} style={analyticsBtn}>
          <PlusCircle size={18}/> Deploy New Task
        </button>
      </div>

      <div style={gridStyle}>
        {tasks.map((task, index) => (
          <div key={task.id} className="analytics-card" style={{ ...cardBase, borderLeft: `4px solid ${getTheme(task.category).color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: getTheme(task.category).color, fontSize: '0.7rem', fontWeight: 'bold' }}>{task.category?.toUpperCase()}</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Edit3 onClick={() => startEdit(task)} size={16} style={{ cursor: 'pointer', color: '#94a3b8' }} />
                <Trash2 onClick={() => handleDelete(task.id)} size={16} style={{ cursor: 'pointer', color: '#fb7185' }} />
              </div>
            </div>
            <h3 style={{ margin: '12px 0 8px 0', color: '#f1f5f9' }}>{task.title}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{task.description}</p>
            {task.aiSummary && (
              <div style={analyticsAiBox}>
                <div style={{ fontSize: '0.65rem', color: getTheme(task.category).color, fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={10} /> AI_INSIGHT
                </div>
                {task.aiSummary}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Work' });
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Shows spinner while Ollama is thinking
    try {
      const payload = { ...formData, status: "ACTIVE", difficulty: "NORMAL" };
      if (editingTask) {
        await updateTask(editingTask.id, payload);
      } else {
        await createTask(payload);
      }
      await loadTasks();
      setView('dashboard');
      setFormData({ title: '', description: '', category: 'Work' });
      setEditingTask(null);
    } catch (err) { alert("Deployment Failed. Check Backend Console."); }
    finally { setLoading(false); }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setFormData({ title: task.title, description: task.description, category: task.category });
    setView('add');
  };

  return (
    <div className="dark-analytics-bg" style={{ minHeight: '100vh', background: '#020617', color: 'white' }}>
      <header style={headerStyle}>
        <div onClick={() => setView('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{ background: '#38bdf8', padding: '6px', borderRadius: '8px' }}><Brain size={20} color="white" /></div>
          <h1 style={{ fontSize: '1.2rem', letterSpacing: '2px', fontWeight: '900' }}>AURA_AI</h1>
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
          <Loader2 className="animate-spin" size={48} color="#38bdf8" />
          <p style={{ marginTop: '20px', color: '#38bdf8', fontWeight: 'bold' }}>AI IS ANALYZING DATA...</p>
        </div>
      ) : view === 'dashboard' ? (
        <DashboardView setView={setView} tasks={tasks} startEdit={startEdit} handleDelete={async (id) => { await deleteTask(id); loadTasks(); }} />
      ) : (
        <div style={{ maxWidth: '500px', margin: '60px auto', background: '#1e293b', padding: '40px', borderRadius: '16px' }}>
          <h2 style={{ marginBottom: '25px' }}>📥 INPUT_DATA</h2>
          <form onSubmit={handleSubmit}>
            <input style={analyticsInput} placeholder="Task Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
            <select style={analyticsInput} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              <option value="Work">Work</option><option value="Personal">Personal</option><option value="Urgent">Urgent</option><option value="Study">Study</option>
            </select>
            <textarea style={{ ...analyticsInput, height: '120px' }} placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            <button type="submit" style={analyticsBtn}>EXECUTE_DEPLOYMENT</button>
            <button type="button" onClick={() => setView('dashboard')} style={{ ...analyticsBtn, background: 'transparent', border: '1px solid #334155', marginTop: '10px', color: '#94a3b8' }}>CANCEL</button>
          </form>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const headerStyle = { background: '#0f172a', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' };
const statCard = { background: '#1e293b', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #334155' };
const statLabel = { color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' };
const statValue = { fontSize: '1.5rem', fontWeight: '900' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '25px' };
const cardBase = { background: 'rgba(30, 41, 59, 0.6)', padding: '25px', borderRadius: '12px', border: '1px solid #334155', backdropFilter: 'blur(12px)' };
const analyticsAiBox = { marginTop: '18px', padding: '15px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '8px', fontSize: '0.8rem', borderLeft: '3px solid #38bdf8' };
const analyticsBtn = { width: '100%', padding: '14px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '900' };
const analyticsInput = { width: '100%', padding: '14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', marginBottom: '20px', display: 'block' };

export default App;
