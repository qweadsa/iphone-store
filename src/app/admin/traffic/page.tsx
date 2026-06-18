import TrafficDashboard from "@/components/admin/TrafficDashboard";

export const dynamic = "force-dynamic";

export default function AdminTrafficPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">访问统计</h1>
      <p className="mt-1 text-white/50">
        查看每天有多少人打开网站。「今日累计」会自动统计，无需额外设置。
      </p>
      <div className="mt-8">
        <TrafficDashboard />
      </div>
    </div>
  );
}
