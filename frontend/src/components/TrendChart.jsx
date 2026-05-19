import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

function TrendChart({ baseUrl }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
        
        // PERBAIKAN 1: Ubah parameter URL menjadi start_date dan end_date
        const res = await fetch(`${baseUrl}/history/surabaya?start_date=${weekAgo}&end_date=${today}&parameter=pm25`);
        const json = await res.json();
        
        // PERBAIKAN 2: Sesuaikan cara membaca item.value dari JSON API buatanmu
        const formatted = json.map(item => ({
          timestamp: item.timestamp.slice(5, 10), // Mengambil bulan-tanggal (MM-DD)
          pm25: item.value ?? 0 
        }));
        
        setData(formatted);
      } catch (err) {
        console.error("Gagal fetch history:", err);
      }
    }
    loadHistory();
  }, [baseUrl]);

  const styles = {
    box: { backgroundColor: '#1e293b', border: '1px solid #334155', padding: '20px', borderRadius: '12px', height: '300px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    title: { fontSize: '16px', fontWeight: 'bold', color: '#e2e8f0', margin: 0 },
    legendGroup: { display: 'flex', gap: '15px', fontSize: '12px' },
    legendTeal: { color: '#2dd4bf', display: 'flex', alignItems: 'center', gap: '5px' },
    legendRose: { color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '5px' },
    dotTeal: { width: '8px', height: '8px', backgroundColor: '#2dd4bf', borderRadius: '50%', display: 'inline-block' },
    lineRose: { width: '12px', height: '2px', backgroundColor: '#f43f5e', display: 'inline-block' }
  };

  return (
    <div style={styles.box}>
      <div style={styles.header}>
        <h3 style={styles.title}>Tren Historis Parameter PM2.5 (7 Hari Terakhir)</h3>
        <div style={styles.legendGroup}>
          <span style={styles.legendTeal}><span style={styles.dotTeal}></span> Konsentrasi PM2.5</span>
          <span style={styles.legendRose}><span style={styles.lineRose}></span> Ambang Batas Sehat</span>
        </div>
      </div>
      <div style={{ width: '100%', height: '230px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} unit=" μg" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }}
              itemStyle={{ color: '#2dd4bf' }}
            />
            <ReferenceLine y={55} stroke="#f43f5e" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="pm25" stroke="#2dd4bf" strokeWidth={3}
              dot={{ r: 4, stroke: '#1e293b', strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TrendChart;