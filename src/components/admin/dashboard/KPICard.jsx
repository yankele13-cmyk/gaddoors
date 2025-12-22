export default function KPICard({ title, value, icon: Icon, trend, color = "text-[#d4af37]" }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-[#d4af37]/30 transition duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-400 font-medium text-sm">{title}</h3>
        <div className={`p-2 rounded-lg bg-zinc-800 ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white font-heading">{value}</p>
        {trend && (
          <p className={`text-xs mt-2 font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}% depuis le mois dernier
          </p>
        )}
      </div>
    </div>
  );
}
