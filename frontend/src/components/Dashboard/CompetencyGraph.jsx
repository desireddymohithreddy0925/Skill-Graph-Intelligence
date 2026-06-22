import React from 'react';

const CompetencyGraph = ({ data }) => {
  if (!data) return null;

  // SVG points for the radar chart polygon (scaled to 0-100)
  // Categories: LOGIC (top), SYSTEM (top-right), DATABASE (bottom-right), FRONTEND (bottom), BEHAVIORAL (bottom-left), STRUCTURES (top-left)
  const size = 200;
  const center = size / 2;
  const radius = (size / 2) - 20;
  
  // Data points (percentages)
  const graphData = [data.logic, data.system, data.database, data.frontend, data.behavioral, data.structures];
  
  const getPoint = (value, angle) => {
    const valRadius = (value / 100) * radius;
    const x = center + valRadius * Math.cos(angle - Math.PI / 2);
    const y = center + valRadius * Math.sin(angle - Math.PI / 2);
    return `${x},${y}`;
  };

  const polygonPoints = graphData.map((val, i) => getPoint(val, (Math.PI * 2 * i) / 6)).join(' ');
  const outerHexagon = [100, 100, 100, 100, 100, 100].map((val, i) => getPoint(val, (Math.PI * 2 * i) / 6)).join(' ');
  const midHexagon = [66, 66, 66, 66, 66, 66].map((val, i) => getPoint(val, (Math.PI * 2 * i) / 6)).join(' ');
  const innerHexagon = [33, 33, 33, 33, 33, 33].map((val, i) => getPoint(val, (Math.PI * 2 * i) / 6)).join(' ');

  const axes = [0, 1, 2, 3, 4, 5].map(i => {
    const pt = getPoint(100, (Math.PI * 2 * i) / 6);
    return <line key={i} x1={center} y1={center} x2={pt.split(',')[0]} y2={pt.split(',')[1]} stroke="var(--border-color)" strokeWidth="1" />;
  });

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>Competency Graph</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem' }}>Engineering profile spider map.</p>
      
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-15px', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>LOGIC</div>
        <div style={{ position: 'absolute', top: '25%', right: '10%', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>SYSTEM</div>
        <div style={{ position: 'absolute', bottom: '25%', right: '10%', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>DATABASE</div>
        <div style={{ position: 'absolute', bottom: '-15px', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>FRONTEND</div>
        <div style={{ position: 'absolute', bottom: '25%', left: '5%', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>BEHAVIORAL</div>
        <div style={{ position: 'absolute', top: '25%', left: '5%', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>STRUCTURES</div>
        
        <svg width={size} height={size} style={{ overflow: 'visible' }}>
          <polygon points={outerHexagon} fill="none" stroke="var(--border-color)" strokeWidth="1" />
          <polygon points={midHexagon} fill="none" stroke="var(--border-color)" strokeWidth="1" />
          <polygon points={innerHexagon} fill="none" stroke="var(--border-color)" strokeWidth="1" />
          {axes}
          <polygon points={polygonPoints} fill="rgba(0, 230, 118, 0.2)" stroke="var(--accent-primary)" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 230, 118, 0.5))', transition: 'all 0.5s ease' }} />
          {graphData.map((val, i) => {
            const pt = getPoint(val, (Math.PI * 2 * i) / 6);
            return <circle key={i} cx={pt.split(',')[0]} cy={pt.split(',')[1]} r="4" fill="var(--bg-secondary)" stroke="var(--accent-primary)" strokeWidth="2" style={{ transition: 'all 0.5s ease' }} />;
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>PEER RANK</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>{data.peerRank}</div>
        </div>
        <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>PERCENTILE</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>{data.percentile}</div>
        </div>
      </div>
    </div>
  );
};

export default CompetencyGraph;
