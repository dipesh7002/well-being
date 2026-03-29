import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { moodOptions } from "../../data/moodMeta";

export function MoodDistributionChart({ distribution = {} }) {
  const data = moodOptions
    .map((mood) => ({
      name: mood.label,
      value: distribution[mood.value] || 0,
      color: mood.color
    }))
    .filter((item) => item.value > 0);

  if (data.length === 0) {
    return <p className="text-sm text-stone-500">Your mood distribution will appear after a few entries.</p>;
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={86}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

