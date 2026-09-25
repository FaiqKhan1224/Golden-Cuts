import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminReports() {
  const [data, setData] = useState(null);
  useEffect(() => { client.get('/admin/reports').then(r => setData(r.data)); }, []);
  if (!data) return null;

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Reports</h1>
      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        <div className="card stat-card"><div className="stat-icon">📅</div><div><div className="stat-value">{data.todayAppts}</div><div className="stat-label">Today</div></div></div>
        <div className="card stat-card"><div className="stat-icon">📆</div><div><div className="stat-value">{data.weeklyAppts}</div><div className="stat-label">This Week</div></div></div>
        <div className="card stat-card"><div className="stat-icon">🗓️</div><div><div className="stat-value">{data.monthlyAppts}</div><div className="stat-label">This Month</div></div></div>
        <div className="card stat-card"><div className="stat-icon">💰</div><div><div className="stat-value">${data.revenue}</div><div className="stat-label">Revenue</div></div></div>
      </div>
      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        <div className="card stat-card"><div className="stat-icon">✅</div><div><div className="stat-value">{data.completed}</div><div className="stat-label">Completed</div></div></div>
        <div className="card stat-card"><div className="stat-icon">✕</div><div><div className="stat-value">{data.cancelled}</div><div className="stat-label">Cancelled</div></div></div>
        <div className="card stat-card"><div className="stat-icon">📈</div><div><div className="stat-value">{data.customerGrowth}</div><div className="stat-label">New Customers</div></div></div>
      </div>

      <div className="grid grid-2">
        <div>
          <h3 style={{ marginBottom: 14 }}>Popular Services</h3>
          <div className="table-wrap">
            <table><tbody>
              {data.popularServices.map(([name, count]) => <tr key={name}><td>{name}</td><td className="gold">{count}</td></tr>)}
            </tbody></table>
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: 14 }}>Most Booked Barbers</h3>
          <div className="table-wrap">
            <table><tbody>
              {data.mostBookedBarbers.map(([name, count]) => <tr key={name}><td>{name}</td><td className="gold">{count}</td></tr>)}
            </tbody></table>
          </div>
        </div>
      </div>
    </div>
  );
}
