import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import axios from 'axios';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const monthKey = (iso) => {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const monthToDate = (label) => {
  const [month, year] = label.split(' ');
  return new Date(`${year}-${String(MONTHS.indexOf(month) + 1).padStart(2, '0')}-01`);
};

const prepareTrendData = (rawData) => {
  const bucket = {};

  rawData.forEach((item) => {
    if (item.decision_taken_date) {
      const k = monthKey(item.decision_taken_date);
      bucket[k] ||= { month: k, taken: 0, due: 0 };
      bucket[k].taken += 1;
    }
    if (item.decision_due_date) {
      const k = monthKey(item.decision_due_date);
      bucket[k] ||= { month: k, taken: 0, due: 0 };
      bucket[k].due += 1;
    }
  });

  return Object.values(bucket).sort((a, b) => monthToDate(a.month) - monthToDate(b.month));
};


const TrendChart = ({ data: externalData }) => {
  const [data, setData] = useState(externalData || []);

  useEffect(() => {
    if (externalData) {
      setData(externalData);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled && Array.isArray(res.data.decisionData)) {
          setData(
            [...res.data.decisionData].sort(
              (a, b) => new Date(a.decision_due_date) - new Date(b.decision_due_date)
            )
          );
        }
      } catch (err) {
        console.error('TrendChart fetch error:', err.message);
      }
    })();
    return () => { cancelled = true; };
  }, [externalData]);

  const trendData = useMemo(() => prepareTrendData(data), [data]);

  return (
    <div className="chart-card trend-chart-card">
      <h3>Decisions Trend</h3>
      <div style={{ width: '100%', height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              domain={[0, 'dataMax + 1']}
            />
            <Tooltip />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 10 }}
            />
            <Line
              type="linear"
              dataKey="taken"
              name="Decisions Taken"
              stroke="var(--brand-primary)"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={{ r: 3 }}
            />
            <Line
              type="linear"
              dataKey="due"
              name="Decisions Due"
              stroke="var(--status-warning)"
              strokeWidth={2}
              activeDot={{ r: 5 }}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;