'use client'

type AssetChartProps = {
  title: string;
};

export default function AssetChart({ title }: AssetChartProps) {
  return (
    <section className="p-4 rounded-xl shadow bg-white">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="h-64 flex items-center justify-center text-gray-500">
        [Chart goes here]
      </div>
    </section>
  );
}