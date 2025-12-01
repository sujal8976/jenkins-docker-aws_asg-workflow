import React, { useState } from "react";
import { shorten } from "../api";

export default function CreateForm() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      const data = await shorten(url);
      // backend now returns an absolute `short` URL (uses BASE_URL or req host)
      setResult(data.short || window.location.origin + `/r/${data.code}`);
      setUrl("");
    } catch (err) {
      console.error(err);
      alert("Failed to shorten");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="Paste a URL to shorten"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : "Shorten"}
        </button>
      </form>
      {result && (
        <div style={{ marginTop: 12 }}>
          <strong>Short URL:</strong>
          <div>
            <a href={result} target="_blank" rel="noreferrer">
              {result}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
