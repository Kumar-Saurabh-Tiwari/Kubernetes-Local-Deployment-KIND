"use client";

import { useState } from "react";

const promptPresets = [
  "Summarize the top three Kubernetes deployment pitfalls.",
  "Explain how to design a liveness vs readiness probe.",
  "Give a step-by-step plan to scale this app to 5 replicas."
];

const learningChecklist = [
  "Build images locally and load into Kind",
  "Observe rollouts and readiness probes",
  "Inspect logs and trace a Groq request",
  "Rotate secrets without redeploying",
  "Scale deployments and watch traffic"
];

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setReply("");
    setError("");

    if (!message.trim()) {
      setError("Write a question before sending.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Request failed");
      }

      setReply(data.reply || "No reply returned.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="content">
      <section className="hero">
        <div className="hero-copy">
          <span className="pill">Kubernetes Lab</span>
          <h1 className="title">Groq AI Deployment Desk</h1>
          <p className="subtitle">
            A compact, production-flavored stack for Kubernetes practice: Next.js at the edge,
            Express in the middle, and Groq powering the intelligence.
          </p>
          <div className="chip-row">
            <span className="chip">Namespace: groq-demo</span>
            <span className="chip">Model: llama-3.3-70b-versatile</span>
            <span className="chip">Ports: 3000 / 8080</span>
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-card">
            <p className="panel-title">System Map</p>
            <ul className="flow">
              <li>Browser UI</li>
              <li>Next.js API route</li>
              <li>Express service</li>
              <li>Groq chat completion</li>
            </ul>
            <p className="panel-note">Follow the request from the UI to the Groq response.</p>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        <div className="stat">
          <h3>2 Services</h3>
          <p>Frontend + API with a clear request boundary.</p>
        </div>
        <div className="stat">
          <h3>1 Namespace</h3>
          <p>Keep resources isolated and easy to clean up.</p>
        </div>
        <div className="stat">
          <h3>Fast Iteration</h3>
          <p>Docker Compose locally, Kind for cluster practice.</p>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2 className="section-title">Prompt Studio</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label className="label" htmlFor="prompt">
              Ask anything
            </label>
            <textarea
              id="prompt"
              className="input"
              rows={5}
              placeholder="Try: Summarize the top three Kubernetes deployment pitfalls."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <div className="preset-row">
              {promptPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="preset"
                  onClick={() => setMessage(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
            <div className="actions">
              <button className="button" type="submit" disabled={isLoading}>
                {isLoading ? "Calling Groq..." : "Send to Groq"}
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => {
                  setMessage("");
                  setReply("");
                  setError("");
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <h2 className="section-title">Response</h2>
          {error ? (
            <p className="error">{error}</p>
          ) : (
            <p className="output">{reply || "Your reply will appear here."}</p>
          )}
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2 className="section-title">Hands-on Runbook</h2>
          <ol className="steps">
            {learningChecklist.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="card callout">
          <h2 className="section-title">Observability Checklist</h2>
          <p className="callout-text">
            Use the logs and probes to understand exactly where a request goes.
          </p>
          <ul className="list">
            <li>Check API logs for latency and errors.</li>
            <li>Verify readiness before sending traffic.</li>
            <li>Rotate secrets and observe reloads.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
