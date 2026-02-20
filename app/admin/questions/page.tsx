"use client";

import Link from "next/link";
import { useState } from "react";

type AdminQuestion = {
  id: string;
  externalId: string | null;
  slug: string;
  topic: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  evidenceStatus: "SUFFICIENT" | "INSUFFICIENT_RULE_BASIS";
};

export default function AdminQuestionsPage() {
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadQuestions() {
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/v1/admin/questions", {
      headers: {
        "x-admin-password": password,
      },
    });

    const data = (await response.json()) as { questions?: AdminQuestion[]; error?: string };

    if (!response.ok) {
      setMessage(data.error ?? "Nepavyko gauti klausimu.");
      setLoading(false);
      return;
    }

    setQuestions(data.questions ?? []);
    setLoading(false);
  }

  async function importInitial() {
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/v1/admin/questions/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({}),
    });

    const data = (await response.json()) as { importedQuestions?: number; error?: string };

    if (!response.ok) {
      setMessage(data.error ?? "Importas nepavyko.");
      setLoading(false);
      return;
    }

    setMessage(`Importuota klausimu: ${data.importedQuestions ?? 0}`);
    await loadQuestions();
  }

  async function publish(questionId: string) {
    setLoading(true);
    setMessage(null);

    const response = await fetch(`/api/v1/admin/questions/${questionId}/publish`, {
      method: "POST",
      headers: {
        "x-admin-password": password,
      },
    });

    const data = (await response.json()) as { ok?: boolean; blockedReasons?: string[]; error?: string };

    if (!response.ok && response.status !== 409) {
      setMessage(data.error ?? "Publikavimas nepavyko.");
      setLoading(false);
      return;
    }

    if (response.status === 409) {
      setMessage(`Nepublikuota: ${(data.blockedReasons ?? []).join(", ")}`);
    } else {
      setMessage("Klausimas publikuotas.");
    }

    await loadQuestions();
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Admin: klausimai</h1>
        <Link href="/admin" className="text-sm font-semibold text-amber-700">
          Atgal
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
        <label className="text-sm font-semibold text-slate-800" htmlFor="admin-password">
          Admin slaptažodis
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-80"
          />
          <button
            type="button"
            onClick={() => void loadQuestions()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Ikelti
          </button>
          <button
            type="button"
            onClick={() => void importInitial()}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Importuoti initial-15
          </button>
        </div>
        {message ? <p className="mt-2 text-sm text-slate-700">{message}</p> : null}
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Tema</th>
              <th className="px-3 py-2">Statusas</th>
              <th className="px-3 py-2">Evidence</th>
              <th className="px-3 py-2">Veiksmai</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id} className="border-t border-slate-200">
                <td className="px-3 py-2">{question.externalId ?? question.id.slice(0, 8)}</td>
                <td className="px-3 py-2">{question.slug}</td>
                <td className="px-3 py-2">{question.topic}</td>
                <td className="px-3 py-2">{question.status}</td>
                <td className="px-3 py-2">{question.evidenceStatus}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void publish(question.id)}
                    className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                  >
                    Publikuoti
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
