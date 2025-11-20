import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState, useEffect } from 'react';

const CommunitySentimentChart = ({ data, title }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // CSV 데이터 파싱
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',');

    const parsed = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        coin: values[0],
        mentions: parseInt(values[1]),
        percentage: parseFloat(values[2])
      };
    });

    setChartData(parsed);
  }, [data]);

  // 코인별 색상
  const getColorForCoin = (coin) => {
    const colors = {
      'BTC': '#f7931a',
      'ETH': '#627eea',
      'XRP': '#00aae4',
      'SOL': '#14f195',
      'DASH': '#008ce7',
      'SWELL': '#4a90e2',
      'PORTA': '#9b59b6',
      'DOGE': '#c2a633',
      'ADA': '#0033ad',
      'MATIC': '#8247e5',
      'DOT': '#e6007a',
      'AVAX': '#e84142',
      'LINK': '#2a5ada',
      'UNI': '#ff007a',
      'ATOM': '#2e3148'
    };
    return colors[coin] || '#6b7280';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
          <p className="font-bold text-gray-900 mb-1">{data.coin}</p>
          <p className="text-sm text-gray-600">언급: {data.mentions}회</p>
          <p className="text-sm text-gray-600">비율: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded border border-gray-200">
      {title && (
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="coin"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: '언급 횟수', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="mentions" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColorForCoin(entry.coin)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600">
        <p className="mb-2">총 분석 게시글: 4,899개 (광고/공지 제외)</p>
        <p className="text-xs text-gray-500">데이터 출처: DCInside 비트코인 갤러리 (2025년 1월)</p>
      </div>
    </div>
  );
};

export default CommunitySentimentChart;
