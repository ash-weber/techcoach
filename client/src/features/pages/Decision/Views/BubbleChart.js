import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';

const BubbleChart = ({ onBubbleClick }) => {
  const [profiles, setProfiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [chartSeries, setChartSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isChartReady, setIsChartReady] = useState(false);

  const chartOptions = {
    chart: {
      type: 'bubble',
      height: '100%',
      width: '100%',
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const { seriesIndex, dataPointIndex } = config;
          const selectedData = chartSeries[seriesIndex]?.data[dataPointIndex];
          if (onBubbleClick && selectedData) {
            onBubbleClick(selectedData); 
          }
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 0.8,
    },
    title: {
      text: 'Bubble Chart of Profiles and Skills',
      align: 'center',
    },
    xaxis: {
      type: 'category',
      tickPlacement: 'on',
      title: {
        text: 'Categories (Profiles and Skills)',
      },
      labels: {
        rotate: -45,
      },
    },
    yaxis: {
      max: 100,
      min: 0,
      tickAmount: 10,
      title: {
        text: 'Category Count',
      },
    },
    grid: {
      padding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
      },
    },
    plotOptions: {
      bubble: {
        maxBubbleRadius: 30,
        minBubbleRadius: 10,
      },
    },
    tooltip: {
      enabled: true,
      shared: false,
    },
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const [profileResponse, skillResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/links`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/link`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setProfiles(profileResponse.data.profiles || []);
      setSkills(skillResponse.data.skills || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const generateSeries = () => {
    const scaleFactor = 10;
    const profileSeries = {
      name: 'Profiles',
      data: profiles.map((profile, index) => ({
        x: `${profile.header_name} - ${profile.header_value}`,
        y: index * 10 + 10,
        z: Math.min(profile.v_id || 20, 50) * scaleFactor,
        metadata: profile, // Add metadata for filtering
      })),
    };

    const skillSeries = {
      name: 'Skills',
      data: skills.map((skill, index) => ({
        x: skill.skill_name,
        y: index * 10 + 10,
        z: Math.min(skill.skill_id || 10, 50) * scaleFactor,
        metadata: skill, // Add metadata for filtering
      })),
    };

    setChartSeries([profileSeries, skillSeries]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (profiles.length > 0 && skills.length > 0) {
      generateSeries();
    }
  }, [profiles, skills]);

  useEffect(() => {
    setTimeout(() => {
      setIsChartReady(true);
    }, 200);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="chart-container" style={{ maxWidth: '70%', height: '500px', margin: 'auto' }}>
      {isChartReady && chartSeries.length > 0 ? (
        <Chart options={chartOptions} series={chartSeries} type="bubble" height="500px" />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};

export default BubbleChart;
