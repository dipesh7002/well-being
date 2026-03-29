import { useEffect, useState } from "react";
import { http } from "../api/http";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { MoodDistributionChart } from "../components/charts/MoodDistributionChart";

export function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  async function loadAdminData() {
    try {
      const [overviewResponse, usersResponse] = await Promise.all([
        http.get("/admin/overview"),
        http.get("/admin/users")
      ]);

      setOverview(overviewResponse.data);
      setUsers(usersResponse.data.users);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load admin data.");
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function toggleUser(userId, nextStatus) {
    try {
      await http.patch(`/admin/users/${userId}/status`, { isActive: nextStatus });
      loadAdminData();
    } catch (toggleError) {
      setError(toggleError.response?.data?.message || "Unable to update account status.");
    }
  }

  if (error) {
    return <EmptyState title="Admin data unavailable" description={error} />;
  }

  if (!overview) {
    return <Card title="Loading admin dashboard">Aggregating anonymized system data...</Card>;
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Total users">
          <p className="text-3xl font-semibold text-stone-900">{overview.totalUsers}</p>
        </Card>
        <Card title="Active users">
          <p className="text-3xl font-semibold text-stone-900">{overview.activeUsers}</p>
        </Card>
        <Card title="Backup status">
          <p className="text-3xl font-semibold text-stone-900">
            {overview.securityOverview.backupEnabled ? "Enabled" : "Planned"}
          </p>
        </Card>
        <Card title="Environment">
          <p className="text-3xl font-semibold text-stone-900 capitalize">{overview.securityOverview.environment}</p>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <Card title="Aggregated mood distribution" subtitle="Anonymous mood totals across completed entries only.">
          <MoodDistributionChart distribution={overview.moodCountsAggregated} />
        </Card>
        <Card title="Security overview" subtitle="Private journal text is not exposed here.">
          <div className="space-y-3">
            <div className="rounded-[28px] bg-orange-50 p-4">
              <p className="font-semibold text-stone-800">JWT authentication</p>
              <p className="mt-1 text-sm text-stone-500">{overview.securityOverview.jwtEnabled ? "Enabled" : "Disabled"}</p>
            </div>
            <div className="rounded-[28px] bg-amber-50 p-4">
              <p className="font-semibold text-stone-800">Password hashing</p>
              <p className="mt-1 text-sm text-stone-500">{overview.securityOverview.passwordHashing}</p>
            </div>
            <div className="rounded-[28px] bg-rose-50 p-4">
              <p className="font-semibold text-stone-800">Backup support</p>
              <p className="mt-1 text-sm text-stone-500">
                {overview.securityOverview.backupEnabled
                  ? "Environment flag indicates backup support is enabled."
                  : "Backup workflow is structured for future activation."}
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card title="Entries over time" subtitle="Completed journal entries by day.">
          <div className="space-y-2">
            {overview.entryCountsByDay.slice(-10).map((item) => (
              <div key={item.day} className="flex items-center justify-between rounded-[24px] bg-stone-50/90 px-4 py-3">
                <span className="text-sm text-stone-600">{item.day}</span>
                <span className="font-semibold text-stone-800">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Streak participation" subtitle="How users are distributed across current streak ranges.">
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(overview.streakCountsAggregated).map(([bucket, count]) => (
              <div key={bucket} className="rounded-[24px] bg-orange-50 p-4">
                <p className="text-sm text-stone-500">Streak {bucket}</p>
                <p className="mt-2 text-2xl font-semibold text-stone-900">{count}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card title="User account management" subtitle="Admins can activate or deactivate accounts without viewing private journal text.">
        <div className="space-y-3">
          {users.map((account) => (
            <div key={account._id} className="rounded-[28px] border border-stone-200 bg-white/80 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-stone-800">{account.fullName}</p>
                  <p className="mt-1 text-sm text-stone-500">{account.email}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-stone-400">
                    {account.role} · streak {account.streakCount}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => toggleUser(account._id, !account.isActive)}
                >
                  {account.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
