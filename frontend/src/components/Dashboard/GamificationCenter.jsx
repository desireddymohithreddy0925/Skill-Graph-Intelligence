import React from 'react';
import { TrendingUp, TrendingDown, Award, Gift, Flame, Check } from 'lucide-react';

const GamificationCenter = ({ data, stats }) => {
  if (!data) return null;
  const xpData = data.xpVelocity;
  const maxXP = Math.max(...xpData);

  const totalXP = xpData.reduce((a, b) => a + b, 0);
  const dailyAverage = xpData.length > 0 ? Math.round(totalXP / xpData.length) : 0;

  const midPoint = Math.floor(xpData.length / 2);
  const historicalData = xpData.slice(0, midPoint);
  const recentData = xpData.slice(midPoint);
  
  const historicalAvg = historicalData.length > 0 ? historicalData.reduce((a, b) => a + b, 0) / historicalData.length : 0;
  const recentAvg = recentData.length > 0 ? recentData.reduce((a, b) => a + b, 0) / recentData.length : 0;
  
  let trendPercentage = 0;
  if (historicalAvg > 0) {
    trendPercentage = Math.round(((recentAvg - historicalAvg) / historicalAvg) * 100);
  } else if (recentAvg > 0) {
    trendPercentage = 100;
  }
  
  const isPositiveTrend = trendPercentage >= 0;
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
  const trendColor = isPositiveTrend ? 'var(--accent-primary)' : 'var(--error)';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '4px', height: '24px', background: 'var(--accent-primary)', borderRadius: '2px' }}></div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Gamification Center</h3>
        </div>
        <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '0.4rem 0.75rem', borderRadius: '2rem' }}>
          UPDATED 1H AGO
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, flexDirection: 'column' }}>
        {/* Streak Tracker (Top) */}
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>APP STREAK</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#ff9800', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Flame size={16} fill="#ff9800" color="#ff9800" /> {stats?.streak || 0} Day Streak
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            {/* Generate the last 7 days */}
            {[6, 5, 4, 3, 2, 1, 0].map((daysAgo, i) => {
              const d = new Date();
              d.setDate(d.getDate() - daysAgo);
              const isToday = daysAgo === 0;
              // Check if date exists in activityHistory
              const hasActivity = stats?.activityHistory?.some(activeDateStr => {
                const activeDate = new Date(activeDateStr);
                return activeDate.getDate() === d.getDate() && activeDate.getMonth() === d.getMonth() && activeDate.getFullYear() === d.getFullYear();
              });

              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: hasActivity ? '#ff9800' : 'var(--bg-secondary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: hasActivity ? 'none' : '2px dashed var(--border-color)',
                    boxShadow: hasActivity ? '0 0 10px rgba(255, 152, 0, 0.4)' : 'none'
                  }}>
                    {hasActivity ? <Check size={16} color="#fff" strokeWidth={3} /> : null}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isToday ? '700' : '500' }}>
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>Missing a day resets your streak to zero. Keep logging in everyday to build your habit!</p>
        </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1 }}>
        {/* XP Velocity (Left) */}
        <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>XP VELOCITY</span>
            <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--accent-primary)', background: 'rgba(0, 230, 118, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>7 Day Trend</span>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
            {xpData.map((val, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '100%', 
                  height: `${(val / maxXP) * 100}%`, 
                  background: i === xpData.length - 1 ? 'var(--accent-primary)' : 'rgba(0, 230, 118, 0.3)', 
                  borderRadius: '4px 4px 0 0',
                  boxShadow: i === xpData.length - 1 ? 'var(--shadow-glow)' : 'none',
                  transition: 'height 0.3s ease'
                }}></div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daily Average: <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>{dailyAverage} XP</span></span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendIcon size={14} color={trendColor} />
              <span style={{ color: trendColor }}>{isPositiveTrend ? '+' : ''}{trendPercentage}%</span>
            </span>
          </div>
        </div>

        {/* Milestones (Right) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>MILESTONES</span>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-primary)', background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Award size={12} color="var(--accent-primary)" /> LVL {data.milestones.level}
            </span>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Skill Master Progress</div>
            <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', marginBottom: '0.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${data.milestones.progressPercent}%`, background: 'var(--accent-primary)', borderRadius: '4px', boxShadow: 'var(--shadow-glow)', transition: 'width 0.5s ease' }}></div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--accent-primary)' }}>{data.milestones.xpToNext} XP TO NEXT UNLOCK</div>
          </div>

          <div style={{ marginTop: 'auto', background: 'var(--bg-tertiary)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)' }}>
            <div style={{ background: 'rgba(0, 230, 118, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
              <Gift size={20} color="var(--accent-primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>UPCOMING REWARD</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{data.milestones.upcomingReward}</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default GamificationCenter;
