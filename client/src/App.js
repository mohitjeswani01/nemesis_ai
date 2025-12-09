import React from 'react';
import './App.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Home, Users, Settings, Activity, Terminal } from 'lucide-react';

const data = [
  { name: 'Day 1', accuracy: 60 },
  { name: 'Day 2', accuracy: 70 },
  { name: 'Day 3', accuracy: 75 },
  { name: 'Day 4', accuracy: 85 },
  { name: 'Day 5', accuracy: 92 },
];

function App() {
  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>AGENT<span style={{ color: '#00ff00' }}>ZERO</span></h2>
        </div>
        <nav className="navigation">
          <ul>
            <li className="active"><Home size={20} /> <span>Mission Control</span></li>
            <li><Users size={20} /> <span>Agents</span></li>
            <li><Settings size={20} /> <span>Settings</span></li>
          </ul>
        </nav>
      </div>

      <div className="main-area">
        <header className="top-bar">
          <h1>SYSTEM DASHBOARD</h1>
          <div className="status-badge">
            <span className="dot"></span> SYSTEM ONLINE
          </div>
        </header>

        <div className="dashboard-grid">
          {/* Card 1: System Health */}
          <div className="card">
            <div className="card-header">
              <Activity color="#00ff00" />
              <h3>System Health</h3>
            </div>
            <div className="big-number">100%</div>
            <p className="subtext">All Systems Operational</p>
          </div>

          {/* Card 2: Model Accuracy */}
          <div className="card">
            <div className="card-header">
              <Activity color="#bf00ff" />
              <h3>Model Accuracy</h3>
            </div>
            <div style={{ width: '100%', height: 150 }}>
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#00ff00" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3: Live Logs */}
          <div className="card wide">
            <div className="card-header">
              <Terminal color="#00ff00" />
              <h3>Live Agent Logs</h3>
            </div>
            <div className="logs-container">
              <div className="log-entry"><span className="time">[10:00:01]</span> <span className="cmd">INIT</span> AgentZero Core initialized.</div>
              <div className="log-entry"><span className="time">[10:00:05]</span> <span className="cmd">SCAN</span> Detected new data batch (Size: 500MB).</div>
              <div className="log-entry"><span className="time">[10:00:12]</span> <span className="cmd">ANALYSIS</span> Data quality score: 98%.</div>
              <div className="log-entry"><span className="time">[10:00:15]</span> <span className="cmd">ACTION</span> Triggering Oumi Fine-Tuning Loop...</div>
              <div className="log-entry"><span className="time">[10:00:45]</span> <span className="cmd">SUCCESS</span> Model weights updated. Accuracy +2%.</div>
            </div>
          </div>

          {/* Card 4: Oumi Training */}
          <div className="card">
            <div className="card-header">
              <h3>RL Fine-Tuning</h3>
            </div>
            <div style={{ width: '100%', height: 200, position: 'relative' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[{ value: 45 }, { value: 55 }]}
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#00ff00" />
                    <Cell fill="#222" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="center-text">
                45%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;