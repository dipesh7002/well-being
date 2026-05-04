import { useEffect, useState } from "react";
import { http } from "../api/http";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { MoodDistributionChart } from "../components/charts/MoodDistributionChart";
import { useAuth } from "../hooks/useAuth";

export function AdminDashboardPage() {
  const { user: currentUser } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

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

  async function changeRole(userId, role) {
    try {
      await http.patch(`/admin/users/${userId}/role`, { role });
      loadAdminData();
    } catch (roleError) {
      setError(roleError.response?.data?.message || "Unable to update role.");
    }
  }

  async function handleDeleteUser(userId, name) {
    if (!window.confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await http.delete(`/admin/users/${userId}`);
      loadAdminData();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Unable to delete user.");
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
        <Card title="Role distribution" subtitle="Breakdown of accounts by role.">
          <div className="space-y-3">
            {Object.entries(overview.roleDistribution ?? {}).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between rounded-[24px] bg-stone-50/90 px-4 py-3">
                <span className="text-sm capitalize text-stone-600">{role}</span>
                <span className="font-semibold text-stone-800">{count}</span>
              </div>
            ))}
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

      <Card title="User account management" subtitle="Manage roles, status, and accounts. Private journal text is never exposed.">
        <div className="space-y-3">
          {users.map((account) => {
            const isSelf = account._id === currentUser?._id;
            const isExpanded = expandedId === account._id;

            return (
              <div key={account._id} className="rounded-[28px] border border-stone-200 bg-white/80 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => setExpandedId(isExpanded ? null : account._id)}
                  >
                    <p className="font-semibold text-stone-800">{account.fullName}</p>
                    <p className="mt-1 text-sm text-stone-500">{account.email}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-stone-400">
                      streak {account.streakCount} · {account.isActive ? "active" : "inactive"}
                    </p>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={account.role}
                      disabled={isSelf}
                      onChange={(e) => changeRole(account._id, e.target.value)}
                      className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 disabled:opacity-40"
                    >
                      <option value="user">user</option>
                      <option value="helper">helper</option>
                      <option value="admin">admin</option>
                    </select>

                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={isSelf}
                      onClick={() => toggleUser(account._id, !account.isActive)}
                    >
                      {account.isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => handleDeleteUser(account._id, account.fullName)}
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 border-t border-stone-100 pt-3 grid grid-cols-2 gap-2 text-sm text-stone-500">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-stone-400">Joined</p>
                      <p className="mt-1 text-stone-700">
                        {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-stone-400">Last journal</p>
                      <p className="mt-1 text-stone-700">
                        {account.lastJournalDate ? new Date(account.lastJournalDate).toLocaleDateString() : "Never"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
