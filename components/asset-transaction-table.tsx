'use client'

type Transaction = {
  id: number;
  date: string;
  description: string;
  amount: number;
};

const mockData: Transaction[] = [
  { id: 1, date: "2025-09-01", description: "BTC Buy", amount: -5000 },
  { id: 2, date: "2025-09-05", description: "BTC Sell", amount: +2500 },
  { id: 3, date: "2025-09-05", description: "BTC Sell", amount: +2500 },
  { id: 4, date: "2025-09-05", description: "BTC Sell", amount: +2500 },
  { id: 5, date: "2025-09-05", description: "BTC Sell", amount: +2500 },
  { id: 6, date: "2025-09-05", description: "BTC Sell", amount: +2500 },
  { id: 7, date: "2025-09-05", description: "BTC Sell", amount: +2500 },
  { id: 8, date: "2025-09-05", description: "BTC Sell", amount: +2500 },
  { id: 9, date: "2025-09-05", description: "BTC Sell", amount: +2500 },
  { id: 10, date: "2025-09-05", description: "BTC Sell", amount: +2500 },
];

export default function AssetTransactionTable() {
  return (
    <section className="p-4 rounded-xl shadow bg-white">
      <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b">
              <th className="p-2">Date</th>
              <th className="p-2">Description</th>
              <th className="p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="p-2">{t.date}</td>
                <td className="p-2">{t.description}</td>
                <td
                  className={`p-2 ${t.amount < 0 ? "text-red-600" : "text-green-600"
                    }`}
                >
                  {t.amount < 0 ? "-" : "+"}${Math.abs(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}