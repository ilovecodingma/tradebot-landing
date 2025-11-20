import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useState, useEffect } from 'react';

const TradingSentimentChart = ({ overallData, coinData, title }) => {
  const [overallSentiment, setOverallSentiment] = useState([]);
  const [coinSentiment, setCoinSentiment] = useState([]);

  useEffect(() => {
    // 전체 매매 의견 데이터 파싱
    const lines = overallData.trim().split('\n');
    const parsed = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        name: values[0],
        value: parseInt(values[1]),
        percentage: parseFloat(values[2])
      };
    }).filter(item => item.name !== '중립'); // 중립 제외

    setOverallSentiment(parsed);

    // 코인별 매매 의견 데이터 파싱
    const coinLines = coinData.trim().split('\n');
    const coinParsed = coinLines.slice(1).map(line => {
      const values = line.split(',');
      return {
        coin: values[0],
        sentiment: values[1],
        count: parseInt(values[2]),
        percentage: parseFloat(values[3])
      };
    });

    // 코인별로 그룹화 (중립 제외)
    const groupedByCoin = {};
    coinParsed.forEach(item => {
      if (item.sentiment !== '중립') {
        if (!groupedByCoin[item.coin]) {
          groupedByCoin[item.coin] = [];
        }
        groupedByCoin[item.coin].push(item);
      }
    });

    setCoinSentiment(groupedByCoin);
  }, [overallData, coinData]);

  const COLORS = {
    '매수': '#10b981',
    '매도': '#ef4444',
    '관망': '#f59e0b',
    '중립': '#6b7280'
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
          <p className="font-bold text-gray-900 mb-1">{data.name}</p>
          <p className="text-sm text-gray-600">{data.value}회</p>
          <p className="text-sm text-gray-600">{data.payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percentage < 5) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-8">
      {title && (
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      )}

      {/* 전체 매매 의견 파이 차트 */}
      <div className="bg-white p-6 rounded border border-gray-200">
        <h4 className="text-base font-bold text-gray-900 mb-4">전체 커뮤니티 매매 의견 분포</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={overallSentiment}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {overallSentiment.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          {overallSentiment.map((item) => (
            <div key={item.name} className="p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold" style={{ color: COLORS[item.name] }}>
                {item.percentage}%
              </div>
              <div className="text-sm text-gray-600 mt-1">{item.name}</div>
              <div className="text-xs text-gray-500">{item.value}회</div>
            </div>
          ))}
        </div>
      </div>

      {/* 코인별 매매 의견 비교 */}
      <div className="bg-white p-6 rounded border border-gray-200">
        <h4 className="text-base font-bold text-gray-900 mb-4">주요 코인별 매매 의견 비교</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(coinSentiment).map(([coin, sentiments]) => (
            <div key={coin} className="border border-gray-200 rounded p-4">
              <h5 className="text-center font-bold text-gray-900 mb-3">{coin}</h5>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sentiments}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ percentage }) => percentage > 5 ? `${percentage.toFixed(0)}%` : ''}
                  >
                    {sentiments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.sentiment]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {sentiments.map((item) => (
                  <div key={item.sentiment} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[item.sentiment] }}></div>
                      <span className="text-gray-700">{item.sentiment}</span>
                    </div>
                    <span className="font-bold text-gray-900">{item.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingSentimentChart;
