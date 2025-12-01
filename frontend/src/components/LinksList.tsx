import React, { useEffect, useState } from "react";
import { listLinks } from "../api";

type Item = {
  code: string;
  originalUrl: string;
  createdAt: string;
  short?: string;
};

export default function LinksList() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await listLinks();
        setItems(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <div className="card">
      <h3>Recent Links</h3>
      <div className="links">
        {items.length === 0 && <div className="muted">No links yet</div>}
        {items.map((i) => (
          <div className="link-item" key={i.code}>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              <div style={{ fontSize: 12, color: "#9fb5c6" }}>
                {new Date(i.createdAt).toLocaleString()}
              </div>
              <div>{i.originalUrl}</div>
            </div>
            <div>
              <a
                href={i.short || `${window.location.origin}/r/${i.code}`}
                target="_blank"
                rel="noreferrer"
              >
                {i.short ? i.short : `/r/${i.code}`}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
