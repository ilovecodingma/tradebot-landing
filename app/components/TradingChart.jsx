import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot, ComposedChart, Bar, Area } from 'recharts';

const TradingChart = ({ data, title }) => {
  // Parse CSV data if it's a string
  const parseCSVData = (csvData) => {
    if (typeof csvData !== 'string') return [];

    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).filter(line => line.trim()).map((line, index) => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, i) => {
        const key = header.trim();
        let value = values[i]?.trim() || '';

        // Parse numeric values
        if (key === 'price' || key === 'macd' || key === 'signal' || key === 'entry_price' || key === 'tp' || key === 'sl' || key === 'highest') {
          value = parseFloat(value) || null;
        }

        obj[key] = value;
      });
      obj.index = index;
      return obj;
    }).reverse(); // Reverse to show chronological order
  };

  const chartData = parseCSVData(data);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-600 mb-1">{data.timestamp}</p>
          {data.type && (
            <p className={`text-xs mb-1 ${data.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
              {data.type} - {data.reason}
            </p>
          )}
          {data.price && <p className="text-xs text-gray-700">Price: {data.price.toLocaleString()}</p>}
          {data.macd !== null && data.macd !== undefined && (
            <p className="text-xs text-blue-600">MACD: {data.macd.toFixed(2)}</p>
          )}
          {data.signal !== null && data.signal !== undefined && (
            <p className="text-xs text-orange-600">Signal: {data.signal.toFixed(2)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Get buy and sell points
  const buyPoints = chartData.filter(d => d.type === 'BUY');
  const sellPoints = chartData.filter(d => d.type === 'SELL');

  return (
    <div className="w-full space-y-6 mb-8">
      {title && (
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}

      {/* MACD Chart */}
      <div className="bg-white p-4 rounded border border-gray-200">
        <h4 className="text-base font-semibold text-gray-800 mb-3">
          MACD vs Signal
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorMacd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSignal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="index"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `#${value + 1}`}
            />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
            />
            <Area
              type="monotone"
              dataKey="macd"
              stroke="#3B82F6"
              fill="url(#colorMacd)"
              strokeWidth={2}
              name="MACD"
            />
            <Line
              type="monotone"
              dataKey="signal"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ fill: '#F59E0B', r: 3 }}
              name="Signal"
            />
            {buyPoints.map((point, i) => (
              <ReferenceDot
                key={`buy-${i}`}
                x={point.index}
                y={point.macd}
                r={8}
                fill="#10B981"
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
            {sellPoints.map((point, i) => (
              <ReferenceDot
                key={`sell-${i}`}
                x={point.index}
                y={point.macd}
                r={8}
                fill="#EF4444"
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>BUY</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>SELL</span>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-white p-4 rounded border border-gray-200">
        <h4 className="text-base font-semibold text-gray-800 mb-3">
          Price Movement
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="index"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `#${value + 1}`}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 12 }}
              domain={['dataMin - 20', 'dataMax + 20']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#8B5CF6"
              fill="url(#colorPrice)"
              strokeWidth={3}
              name="Price (KRW)"
            />
            {chartData.map((point, i) => {
              if (point.tp) {
                return (
                  <ReferenceDot
                    key={`tp-${i}`}
                    x={point.index}
                    y={point.tp}
                    r={4}
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                );
              }
              return null;
            })}
            {chartData.map((point, i) => {
              if (point.sl) {
                return (
                  <ReferenceDot
                    key={`sl-${i}`}
                    x={point.index}
                    y={point.sl}
                    r={4}
                    fill="#EF4444"
                    fillOpacity={0.6}
                  />
                );
              }
              return null;
            })}
            {buyPoints.map((point, i) => (
              <ReferenceDot
                key={`buy-price-${i}`}
                x={point.index}
                y={point.price}
                r={10}
                fill="#10B981"
                stroke="#fff"
                strokeWidth={3}
              />
            ))}
            {sellPoints.map((point, i) => (
              <ReferenceDot
                key={`sell-price-${i}`}
                x={point.index}
                y={point.price}
                r={10}
                fill="#EF4444"
                stroke="#fff"
                strokeWidth={3}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>BUY</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>SELL</span>
          </div>
        </div>
      </div>

      {/* Trading Summary Table */}
      <div className="bg-white p-4 rounded border border-gray-200">
        <h4 className="text-base font-semibold text-gray-800 mb-3">
          Trading Events
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Time</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Type</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Reason</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Price</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">MACD</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Signal</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-600">{row.timestamp?.substring(11, 19) || '-'}</td>
                  <td className="py-2 px-3">
                    {row.type && (
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        row.type === 'BUY'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {row.type}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-gray-700">{row.reason || '-'}</td>
                  <td className="py-2 px-3 text-right text-gray-900">
                    {row.price ? row.price.toLocaleString() : '-'}
                  </td>
                  <td className="py-2 px-3 text-right text-blue-600">
                    {row.macd !== null && row.macd !== undefined ? row.macd.toFixed(2) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right text-orange-600">
                    {row.signal !== null && row.signal !== undefined ? row.signal.toFixed(2) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;
