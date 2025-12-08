import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  // --- CONFIGURATION ---
  const API_URL = "http://127.0.0.1:8080";
  const AUTH_HEADER = "Basic bW9oaXRqZXN3YW5pNzRAZ21haWwuY29tOk0xbzJoM2k0dDVA";
  // ---------------------

  const [target, setTarget] = useState('');
  const [status, setStatus] = useState('IDLE');
  const [logs, setLogs] = useState(["NEMESIS_OS v1.1.2 initialized..."]);
  const [report, setReport] = useState(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const checkStatus = async (executionId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/executions/${executionId}`, {
          headers: { 'Authorization': AUTH_HEADER }
        });

        if (res.status === 404) return;

        const data = await res.json();

        if (data.state.current === 'SUCCESS') {
          clearInterval(interval);
          addLog(">> SCAN COMPLETE. DOWNLOADING REPORT...");
          // Wait 1 second to ensure logs are fully written
          setTimeout(() => fetchLogs(executionId), 1000);
        } else if (data.state.current === 'FAILED') {
          clearInterval(interval);
          setStatus('ERROR');
          addLog("!! BACKEND FAILED. CHECK KESTRA UI.");
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);
  };

  const fetchLogs = async (executionId) => {
    try {
      console.log("Fetching logs for:", executionId);
      const res = await fetch(`${API_URL}/api/v1/logs/${executionId}`, {
        headers: { 'Authorization': AUTH_HEADER }
      });

      const data = await res.json();
      const fullLogText = data.map(l => l.message).join('\n');
      console.log("Full Log:", fullLogText);

      // --- THE FIX: Split by the "Magic Phrase" ---
      const parts = fullLogText.split(">> VULNERABILITIES DETECTED:");

      if (parts.length > 1) {
        // We take the part AFTER the phrase
        const jsonPart = parts[1];

        // Find the JSON array inside that part
        const match = jsonPart.match(/\[[\s\S]*\]/);

        if (match) {
          const bugs = JSON.parse(match[0]);
          setReport(bugs);
          setStatus('SUCCESS');
          addLog(`>> ${bugs.length} VULNERABILITIES FOUND.`);
        } else {
          throw new Error("JSON structure not found after marker");
        }
      } else {
        // Fallback: Try finding JSON anywhere if marker missing
        const match = fullLogText.match(/\[\s*\{"file":[\s\S]*\}\s*\]/);
        if (match) {
          const bugs = JSON.parse(match[0]);
          setReport(bugs);
          setStatus('SUCCESS');
          addLog(`>> ${bugs.length} VULNERABILITIES FOUND.`);
        } else {
          addLog(">> NO VULNERABILITIES DETECTED.");
          setStatus('SUCCESS');
        }
      }
    } catch (err) {
      console.error(err);
      addLog("!! PARSING ERROR: DATA CORRUPTED BY DOCKER LOGS.");
    }
  };

  const handleScan = async () => {
    if (!target) return;
    setStatus('SCANNING');
    setReport(null);
    setLogs(["INITIALIZING NEW SCAN..."]);

    const formData = new FormData();
    formData.append('target_url', target);

    try {
      const res = await fetch(`${API_URL}/api/v1/executions/company.team/nemesis_scan`, {
        method: 'POST',
        headers: { 'Authorization': AUTH_HEADER },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        addLog(`>> AGENT DEPLOYED. ID: ${data.id}`);
        checkStatus(data.id);
      } else {
        addLog(`!! CONNECTION ERROR: ${res.status}`);
        setStatus('ERROR');
      }
    } catch (err) {
      addLog(`!! NETWORK FAILURE: ${err.message}`);
      setStatus('ERROR');
    }
  };

  return (
    <div className="App">
      <div className="scanline"></div>
      <div className="container">
        <h1>NEMESIS_AI</h1>
        <div className="terminal-box">
          <div className="terminal-header">
            <span>SYS.ADMIN</span>
            <span className={`status-badge status-${status}`}>{status}</span>
          </div>
          <div className="input-group">
            <input
              type="text"
              placeholder="ENTER GITHUB REPOSITORY URL..."
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={status === 'SCANNING'}
            />
          </div>
          <button className="btn-main" onClick={handleScan} disabled={status === 'SCANNING'}>
            {status === 'SCANNING' ? '>> SCANNING <<' : 'INITIATE ATTACK'}
          </button>
          <div className="logs-area">
            {logs.map((log, i) => <div key={i} className="log-entry">{log}</div>)}
            <div ref={logsEndRef} />
          </div>
        </div>
        {report && (
          <div className="report-box" style={{ marginTop: '20px', width: '600px', border: '1px solid #0f0', background: 'black' }}>
            <h3 style={{ background: '#0f0', color: 'black', margin: 0, padding: '10px' }}>VULNERABILITY REPORT</h3>
            {report.map((bug, i) => (
              <div key={i} style={{ padding: '15px', borderBottom: '1px solid #333', textAlign: 'left' }}>
                <div style={{ color: '#ff0055', fontWeight: 'bold' }}>[{bug.severity || 'CRITICAL'}] {bug.file}</div>
                <div style={{ color: '#ccc', fontSize: '0.9rem' }}>{bug.bug}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;