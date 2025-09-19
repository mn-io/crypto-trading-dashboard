'use client'

//TODO: add logo

export default function AssetAccountSummary() {
  return (
    <section className="p-4 flex items-center justify-between">
      <div className="font-medium">
       <img src="/icon.png" />
      </div>
      <div className="text-right">
        <p>Aavilable</p>
        <p>12,345.67 BTC</p>
        <p>2333.01 $</p>
      </div>
    </section>
  );
}