import React from 'react';
import { Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import TrendChart from './TrendChart';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384',
  '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
  '#FF5370', '#7E57C2', '#78909C', '#8D6E63', '#D4E157',
];

const buildTagStats = (data) => {
  const counts = {};
  const types = {};
  data.forEach((d) => {
    d.tags?.forEach((t) => {
      if (counts[t.tag_name]) counts[t.tag_name]++;
      else {
        counts[t.tag_name] = 1;
        types[t.tag_name] = t.tag_type || 'Unknown';
      }
    });
  });
  const total = Object.values(counts).reduce((s, c) => s + c, 0) || 1;
  return Object.keys(counts).map((name, i) => ({
    id: i,
    tag: name,
    count: counts[name],
    tagType: types[name],
    percentage: ((counts[name] / total) * 100).toFixed(2),
  }));
};

const DonutChart = ({ title, data }) => (
  <div className="chart-card">
    <h3>{title}</h3>
    <PieChart width={300} height={280}>
      <Pie
        data={data}
        cx={150}
        cy={130}
        outerRadius={90}
        paddingAngle={1}
        dataKey="value"
      >
        {data.map((_, i) => (
          <Cell key={i} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip
        content={({ payload }) =>
          payload[0]
            ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)`
            : null
        }
      />
      <Legend />
    </PieChart>
  </div>
);

const TabularView = ({ data }) => {
  const rows = buildTagStats(data);
  const pie = rows.map((r) => ({
    name: r.tag,
    value: r.count,
    tagType: r.tagType,
    percentage: r.percentage,
  }));
  const pick = (type) => pie.filter((d) => d.tagType === type);

  const columns = [
    { field: 'tag', headerName: 'Tag Name', width: 200 },
    { field: 'count', headerName: 'Decisions Count', width: 150 },
    { field: 'tagType', headerName: 'Tag Type', width: 200, sortable: false },
  ];

  return (
    <div>
      <div className="tabular-toolbar">
        <Link to="/profile/linked-decision">
          <button className="decision-btn decision-btn--primary">
            Decision Factors
          </button>
        </Link>
      </div>

      <div className="charts-grid">
        <div className="data-grid-card">
          <DataGrid
            rows={rows.slice(0, 50)}
            columns={columns}
            autoHeight
            pageSize={50}
            rowsPerPageOptions={[50]}
            hideFooter
          />
        </div>

        <DonutChart title="Advanced Tags" data={pick('Advanced Tags')} />
        <DonutChart title="Time Span Tags" data={pick('Time Span')} />
        <DonutChart title="Sharpen the Saw" data={pick('Sharpen the Saw')} />
        <DonutChart title="Outcome Tags" data={pick('Outcome')} />
        <DonutChart title="Urgency Tags" data={pick('Urgency')} />
        <DonutChart title="Decision Drivers" data={pick('Decision Maturity')} />
        <DonutChart title="Financial Tags" data={pick('Financial Outcome')} />
      </div>

      <TrendChart />
    </div>
  );
};

export default TabularView;