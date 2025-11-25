import { memo, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
} from 'recharts';

// 데이터 다운샘플링 함수
function downsampleData(data, maxPoints = 300) {
  if (data.length <= maxPoints) return data;

  const step = Math.ceil(data.length / maxPoints);
  const downsampled = [];

  for (let i = 0; i < data.length; i += step) {
    downsampled.push(data[i]);
  }

  return downsampled;
}

// 십자가 커서 컴포넌트
const CustomCursor = ({ points, width, height, coordinate }) => {
  if (!points || points.length === 0) return null;

  const { x } = points[0];
  // coordinate.y는 실제 마우스 Y 위치를 제공
  const mouseY = coordinate?.y || points[0].y;

  return (
    <g>
      {/* 세로선 */}
      <line
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke="#888"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      {/* 가로선 */}
      <line
        x1={0}
        y1={mouseY}
        x2={width}
        y2={mouseY}
        stroke="#888"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
    </g>
  );
};

function BacktestChart({ data, result, strategy }) {
  if (!data || !result) return null;

  // 날짜 포맷 함수 (월 일 시:분)
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}월 ${day}일 ${hours}:${minutes}`;
  };

  // 차트 데이터 준비 (메모이제이션)
  const chartData = useMemo(() => {
    const fullData = data.map((candle, idx) => {
      const trade = result.trades.find(t => t.index === idx);

      return {
        index: idx,
        timestamp: formatDate(candle.timestamp),
        price: candle.close,
        macd: result.indicators.macd[idx] || null,
        signal: result.indicators.signal[idx] || null,
        histogram: result.indicators.histogram[idx] || null,
        ma20: result.indicators.ma20[idx] || null,
        ma60: result.indicators.ma60[idx] || null,
        buy: trade && trade.type === 'BUY' ? candle.close : null,
        sell: trade && trade.type === 'SELL' ? candle.close : null,
      };
    });

    // 500개 이상이면 다운샘플링
    return downsampleData(fullData, 300);
  }, [data, result]);

  // 자산 차트 데이터 (메모이제이션)
  const equityData = useMemo(() => {
    const fullEquity = result.equity.map(e => ({
      timestamp: formatDate(e.timestamp),
      equity: e.equity,
      initialEquity: result.stats.initialCash,
    }));

    return downsampleData(fullEquity, 300);
  }, [result]);

  // Custom Tooltip (메모이제이션)
  const CustomTooltip = useMemo(() => {
    return ({ active, payload }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-gray-800 bg-opacity-90 p-3 rounded border border-purple-500 text-xs">
            <p className="text-white mb-1">{payload[0].payload.timestamp}</p>
            {payload.map((entry, idx) => (
              <p key={idx} style={{ color: entry.color }}>
                {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };
  }, []);

  // X축 표시 간격 계산
  const xAxisInterval = useMemo(() => {
    return Math.floor(chartData.length / 10);
  }, [chartData.length]);

  return (
    <div className="space-y-6">
      {/* 가격 & MACD 차트 */}
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-purple-500">
        <h3 className="text-xl font-semibold mb-4">가격 차트</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis
              dataKey="timestamp"
              tick={{ fill: '#888', fontSize: 10 }}
              interval={xAxisInterval}
            />
            <YAxis
              tick={{ fill: '#888', fontSize: 12 }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} cursor={<CustomCursor />} />
            <Legend wrapperStyle={{ color: '#fff' }} />

            {/* 가격 */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
              name="가격"
            />

            {/* MA */}
            {strategy.aboveMA20Enabled && (
              <Line
                type="monotone"
                dataKey="ma20"
                stroke="#FCD34D"
                strokeWidth={1}
                dot={false}
                strokeDasharray="5 5"
                name="MA20"
              />
            )}
            {strategy.aboveMA60Enabled && (
              <Line
                type="monotone"
                dataKey="ma60"
                stroke="#F97316"
                strokeWidth={1}
                dot={false}
                strokeDasharray="5 5"
                name="MA60"
              />
            )}

            {/* 매수/매도 마커 */}
            <Scatter
              dataKey="buy"
              fill="#10B981"
              name="매수"
              shape="triangle"
            />
            <Scatter
              dataKey="sell"
              fill="#EF4444"
              name="매도"
              shape="triangle"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* MACD 차트 */}
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-purple-500">
        <h3 className="text-xl font-semibold mb-4">MACD</h3>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis
              dataKey="timestamp"
              tick={{ fill: '#888', fontSize: 10 }}
              interval={xAxisInterval}
            />
            <YAxis
              tick={{ fill: '#888', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={<CustomCursor />} />
            <Legend wrapperStyle={{ color: '#fff' }} />

            {/* Histogram */}
            <Bar
              dataKey="histogram"
              fill="#6366F1"
              name="Histogram"
              opacity={0.6}
            />

            {/* MACD & Signal */}
            <Line
              type="monotone"
              dataKey="macd"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              name="MACD"
            />
            <Line
              type="monotone"
              dataKey="signal"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
              name="Signal"
            />

            {/* Threshold 선 */}
            {strategy.macdThreshold !== 0 && (
              <Line
                type="monotone"
                dataKey={() => strategy.macdThreshold}
                stroke="#10B981"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Threshold"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 자산 변화 차트 */}
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 border border-purple-500">
        <h3 className="text-xl font-semibold mb-4">자산 변화</h3>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={equityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis
              dataKey="timestamp"
              tick={{ fill: '#888', fontSize: 10 }}
              interval={Math.floor(equityData.length / 10) || 1}
            />
            <YAxis
              tick={{ fill: '#888', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={<CustomCursor />} />
            <Legend wrapperStyle={{ color: '#fff' }} />

            {/* 초기 자산 기준선 */}
            <Line
              type="monotone"
              dataKey="initialEquity"
              stroke="#888"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              name="초기 자산"
            />

            {/* 현재 자산 */}
            <Line
              type="monotone"
              dataKey="equity"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              name="자산"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// React.memo로 불필요한 재렌더링 방지
export default memo(BacktestChart);
