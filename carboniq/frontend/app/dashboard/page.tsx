"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, CATEGORIES, getToken, Rec, setToken, Summary } from "@/lib/api";

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 1 });

export default function Dashboard() {
  const router = useRouter();
  const [records, setRecords] = useState<Rec[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    source: "",
    category: CATEGORIES[0],
    amount: "",
    date: today(),
  });

  const logout = useCallback(() => {
    setToken(null);
    router.replace("/");
  }, [router]);

  const load = useCallback(async () => {
    try {
      const [recs, sum] = await Promise.all([
        api<Rec[]>("/records"),
        api<Summary>("/summary"),
      ]);
      setRecords(recs);
      setSummary(sum);
    } catch {
      logout(); // token missing or expired
    }
  }, [logout]);

  useEffect(() => {
    if (!getToken()) router.replace("/");
    else load();
  }, [load, router]);

  async function addRecord(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/records", {
        method: "POST",
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      setForm({ ...form, source: "", amount: "" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save record");
    }
  }

  async function remove(id: number) {
    await api(`/records/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="page">
      <header className="top">
        <h1>CarbonIQ</h1>
        <button className="link" onClick={logout}>
          Log out
        </button>
      </header>

      <section className="panel stats">
        <div>
          <span className="muted">Total emissions</span>
          <strong className="big">{fmt(summary?.total ?? 0)}</strong>
          <span className="muted">kg CO₂e</span>
        </div>
        <ul className="cats">
          {summary?.by_category.map((c) => (
            <li key={c.category}>
              <span>{c.category}</span>
              <span>{fmt(c.amount)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Emissions by month</h2>
        {summary && summary.by_month.length > 0 ? (
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.by_month}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => `${fmt(v)} kg CO₂e`} />
                <Bar dataKey="amount" fill="#2f6f4f" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="muted">Add a record to see your monthly chart.</p>
        )}
      </section>

      <section className="panel">
        <h2>Add a record</h2>
        <form className="row" onSubmit={addRecord}>
          <input
            placeholder="Source (e.g. Plant 1 boiler)"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            required
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            step="any"
            min="0.01"
            placeholder="kg CO₂e"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <button type="submit">Save record</button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="panel">
        <h2>Records</h2>
        {records.length === 0 ? (
          <p className="muted">No records yet. Add your first one above.</p>
        ) : (
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Category</th>
                  <th className="num">kg CO₂e</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.source}</td>
                    <td>{r.category}</td>
                    <td className="num">{fmt(r.amount)}</td>
                    <td>
                      <button className="link danger" onClick={() => remove(r.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
