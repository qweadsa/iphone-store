import TrafficDashboard from "@/components/admin/TrafficDashboard";

export const dynamic = "force-dynamic";

export default function AdminTrafficPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">访问统计</h1>
      <p className="mt-1 text-white/50">直播引流时查看有多少人打开了网站</p>
      <div className="mt-8">
        <TrafficDashboard />
      </div>
    </div>
  );
}
