import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const moodScale = {
  sad: 1,
  anxious: 2,
  stressed: 2.5,
  neutral: 3,
  calm: 4,
  happy: 5
};

export function MoodTrendChart({ data = [] }) {
  const chartData = data.map((item) => ({
    day: item.day,
    moodScore: moodScale[item.mood] || 3
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="moodScore"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ fill: "#f97316", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

