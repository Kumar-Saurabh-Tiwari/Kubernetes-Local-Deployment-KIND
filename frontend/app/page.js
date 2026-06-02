"use client";

import { useState } from "react";

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
      <div className="header">
        <span className="pill">Kubernetes Lab</span>
        <h1 className="title">Groq AI Field Notes</h1>
        <p className="subtitle">
          A tiny, production-flavored stack: Next.js on the edge, Express in the middle,
          and Groq running the intelligence.
        </p>
      </div>

      <section className="card">
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
      </section>

      <section className="card">
        <h2 className="section-title">Response</h2>
        {error ? (
          <p className="error">{error}</p>
        ) : (
          <p className="output">{reply || "Your reply will appear here."}</p>
        )}
      </section>
    </main>
  );
}
