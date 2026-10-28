import React, { useState, useEffect } from 'react';
import { Tooltip, Legend, LineChart, Line, XAxis, YAxis } from 'recharts';
import axios from 'axios';
import './TrendChart.css';

const TrendChart = () => {
  const [data, setData] = useState([]);
  const [chartWidth, setChartWidth] = useState(window.innerWidth > 768 ? 800 : window.innerWidth - 40);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const responseData = response.data;
        if (Array.isArray(responseData.decisionData)) {
          const sortedData = responseData.decisionData.sort((a, b) =>
            new Date(a.decision_due_date) - new Date(b.decision_due_date)
          );
          setData(sortedData);
        } else {
          console.error('Invalid response format:', responseData);
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    const handleResize = () => {
      setChartWidth(window.innerWidth > 768 ? 800 : window.innerWidth - 40);
    };

    loadData();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const prepareTrendData = (rawData) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
  
    const groupedData = rawData.reduce(
      (acc, item) => {
        if (item.decision_taken_date) {
          const takenDate = new Date(item.decision_taken_date);
          const takenYearMonth = `${months[takenDate.getMonth()]} ${takenDate.getFullYear()}`;
          if (!acc.taken[takenYearMonth]) {
            acc.taken[takenYearMonth] = 0;
          }
          acc.taken[takenYearMonth]++;
        }
  
        if (item.decision_due_date) {
          const dueDate = new Date(item.decision_due_date);
          const dueYearMonth = `${months[dueDate.getMonth()]} ${dueDate.getFullYear()}`;
          if (!acc.due[dueYearMonth]) {
            acc.due[dueYearMonth] = 0;
          }
          acc.due[dueYearMonth]++;
        }
  
        return acc;
      },
      { taken: {}, due: {} }
    );
  
    const combinedData = {};
  
    Object.entries(groupedData.taken).forEach(([month, count]) => {
      if (!combinedData[month]) combinedData[month] = { month, taken: 0, due: 0 };
      combinedData[month].taken = count;
    });
  
    Object.entries(groupedData.due).forEach(([month, count]) => {
      if (!combinedData[month]) combinedData[month] = { month, taken: 0, due: 0 };
      combinedData[month].due = count;
    });
  
    // Sort combinedData by year and month
    const sortedData = Object.values(combinedData).sort((a, b) => {
      const [monthA, yearA] = a.month.split(' ');
      const [monthB, yearB] = b.month.split(' ');
      const dateA = new Date(`${yearA}-${months.indexOf(monthA) + 1}`);
      const dateB = new Date(`${yearB}-${months.indexOf(monthB) + 1}`);
      return dateA - dateB;
    });
  
    return sortedData;
  };

  const trendData = prepareTrendData(data);

  const generateTicks = (data, numTicks) => {
    if (!data || data.length === 0) return [];

    const maxValue = Math.max(...data.map(d => Math.max(d.taken || 0, d.due || 0)));
    const step = Math.ceil(maxValue / numTicks);

    return Array.from({ length: numTicks + 1 }, (_, i) => i * step);
  };

  return (
    <div className="trend-chart-container">
      <h4>Line Chart</h4>
      <LineChart
        width={chartWidth}
        height={400}
        data={trendData}
        margin={{ right: 20, left: 20, bottom: 50 }}
        className="line-Chart"
      >
        <XAxis dataKey="month" />
        <YAxis
          domain={[0, 'dataMax + 1']}
          ticks={generateTicks(trendData, 5)}
          allowDecimals={false}
        />
        <Tooltip />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
        />
        <Line type="linear" dataKey="taken" stroke="#8824d8" name="Decisions Taken" activeDot={{ r: 8 }} />
        <Line type="linear" dataKey="due" stroke="#007bff" name="Decisions Due" activeDot={{ r: 6 }} />
      </LineChart>
    </div>
  );
};

export default TrendChart;
