"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function SearchInput({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery !== initialQuery) {
      if (debouncedQuery) {
        router.push(`/posts?q=${encodeURIComponent(debouncedQuery)}`);
      } else {
        router.push("/posts");
      }
    }
  }, [debouncedQuery, router, initialQuery]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <div className="glass-card" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Search size={20} className="text-muted" />
        <input 
          type="text" 
          placeholder="Search for articles, topics, or authors..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'white', 
            width: '100%', 
            outline: 'none',
            fontSize: '1rem'
          }}
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            style={{ background: 'none', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
