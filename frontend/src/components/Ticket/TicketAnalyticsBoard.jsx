import React from 'react';
import { 
  BarChart3, PieChart, TrendingUp, CheckCircle, 
  Clock, AlertTriangle, Zap, Target, ArrowRight, MapPin
} from 'lucide-react';

const TrendBarChart = ({ data, color = '#6366F1' }) => {
  if (!data || Object.keys(data).length === 0) return (
    <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
       No trend data available yet
    </div>
  );

  const values = Object.values(data);
  const labels = Object.keys(data);
  const max = Math.max(...values, 5); // ensure some height

  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', gap: '8px' }}>
        {labels.map((label, i) => {
          const val = data[label] || 0;
          const height = (val / max) * 100;
          return (
            <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                 <div style={{ 
                    width: '70%', height: `${height}%`, background: color, 
                    borderRadius: '6px 6px 2px 2px', minHeight: '4px',
                    transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                 }}>
                   {val > 0 && <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.65rem', fontWeight: 700, color: '#475569' }}>{val}</span>}
                 </div>
              </div>
              <span style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ProcessPipeline = ({ statusCounts }) => {
  const open = statusCounts['OPEN'] || 0;
  const inProgress = statusCounts['IN_PROGRESS'] || 0;
  const resolved = (statusCounts['RESOLVED'] || 0) + (statusCounts['CLOSED'] || 0);
  const total = open + inProgress + resolved;

  const getWidth = (val) => total === 0 ? '33%' : `${Math.max((val / total) * 100, 10)}%`;

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Stage 1 */}
        <div style={{ flex: 1, background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '12px', padding: '16px', position: 'relative' }}>
          <div style={{ color: '#3B82F6', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '4px' }}>New</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{open}</div>
          <div style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: '#FFF', borderRadius: '50%', padding: '2px' }}>
            <ArrowRight size={16} color="#3B82F6" />
          </div>
        </div>
        
        {/* Stage 2 */}
        <div style={{ flex: 1, background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '12px', padding: '16px', position: 'relative' }}>
          <div style={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '4px' }}>Active</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{inProgress}</div>
          <div style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: '#FFF', borderRadius: '50%', padding: '2px' }}>
            <ArrowRight size={16} color="#F59E0B" />
          </div>
        </div>

        {/* Stage 3 */}
        <div style={{ flex: 1, background: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: '12px', padding: '16px' }}>
          <div style={{ color: '#10B981', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '4px' }}>Done</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{resolved}</div>
        </div>
      </div>
      
      {/* Visual Bar */}
      <div style={{ display: 'flex', height: '8px', borderRadius: '99px', overflow: 'hidden', marginTop: '16px', gap: '2px' }}>
        <div style={{ width: getWidth(open), background: '#3B82F6', transition: 'width 1s' }} />
        <div style={{ width: getWidth(inProgress), background: '#F59E0B', transition: 'width 1s' }} />
        <div style={{ width: getWidth(resolved), background: '#10B981', transition: 'width 1s' }} />
      </div>
    </div>
  );
};

const TicketAnalyticsBoard = ({ stats, role }) => {
  if (!stats) return null;

  const { statusCounts, priorityCounts, categoryCounts, dailyTrends, locationUsage, totalTickets, resolvedTickets, resolutionRate } = stats;

  const getStatusColor = (s) => ({
    OPEN: '#3B82F6', IN_PROGRESS: '#F59E0B', RESOLVED: '#10B981', REJECTED: '#EF4444', CLOSED: '#6B7280'
  }[s] || '#94A3B8');

  const getPriorityColor = (p) => ({
    CRITICAL: '#F43F5E', HIGH: '#FB923C', MEDIUM: '#FBBF24', LOW: '#22D3EE'
  }[p] || '#94A3B8');

  return (
    <div className="analytics-board" style={{ animation: 'fadeIn 0.6s ease-out' }}>
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .stat-card-glass {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            padding: 24px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          }
          .gauge-bar { height: 8px; border-radius: 99px; background: #E2E8F0; overflow: hidden; position: relative; }
          .gauge-fill { height: 100%; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
        `}
      </style>

      {/* Primary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card-glass" style={{ borderLeft: '4px solid #6366F1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>Resolution Performance</span>
            <TrendingUp size={18} color="#6366F1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B' }}>{resolutionRate.toFixed(1)}%</div>
          <div className="gauge-bar" style={{ marginTop: '12px' }}>
            <div className="gauge-fill" style={{ width: `${resolutionRate}%`, background: 'linear-gradient(90deg, #6366F1, #818CF8)' }} />
          </div>
        </div>

        <div className="stat-card-glass" style={{ borderLeft: '4px solid #F43F5E' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>Urgency Index (High/Crit)</span>
            <AlertTriangle size={18} color="#F43F5E" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B' }}>
            {(priorityCounts['CRITICAL'] || 0) + (priorityCounts['HIGH'] || 0)}
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.7rem', margin: '4px 0 0 0' }}>Requires immediate attention</p>
        </div>

        <div className="stat-card-glass" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>Active Load</span>
            <Zap size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B' }}>{totalTickets}</div>
          <p style={{ color: '#94A3B8', fontSize: '0.7rem', margin: '4px 0 0 0' }}>Tickets in various stages</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        
        {/* NEW: Trend Bar Chart */}
        <div className="stat-card-glass">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp size={18} color="#6366F1" /> Incoming Volume Trend
          </h3>
          <TrendBarChart data={dailyTrends} color="linear-gradient(180deg, #6366F1, #818CF8)" />
        </div>

        {/* NEW: Process Pipeline */}
        <div className="stat-card-glass">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={18} color="#3B82F6" /> Resolution Process (Pipeline)
          </h3>
          <ProcessPipeline statusCounts={statusCounts} />
        </div>

        {/* Priority Heatmap */}
        <div className="stat-card-glass">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={18} color="#F43F5E" /> Priority intensity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => {
              const count = priorityCounts[p] || 0;
              const width = totalTickets === 0 ? 0 : (count / totalTickets) * 100;
              return (
                <div key={p}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: '#64748B' }}>{p}</span>
                    <span style={{ fontWeight: 700 }}>{count}</span>
                  </div>
                  <div className="gauge-bar">
                    <div className="gauge-fill" style={{ width: `${width}%`, background: getPriorityColor(p) }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* NEW: Usage Analytics by Location */}
        <div className="stat-card-glass">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={18} color="#10B981" /> Usage Analytics (Location Hotspots)
          </h3>
          <div style={{ maxHeight: '180px', overflowY: 'auto', pr: '8px' }}>
            {Object.entries(locationUsage || {}).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([loc, count], i) => {
              const width = totalTickets === 0 ? 0 : (count / Math.max(...Object.values(locationUsage))) * 100;
              return (
                <div key={loc} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.7rem' }}>
                    <span style={{ fontWeight: 600, color: '#475569' }}>{loc}</span>
                    <span style={{ fontWeight: 700 }}>{count} issues</span>
                  </div>
                  <div className="gauge-bar" style={{ height: '6px' }}>
                    <div className="gauge-fill" style={{ width: `${width}%`, background: '#10B981' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TicketAnalyticsBoard;
