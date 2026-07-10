"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function TopBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const cache = useRef(new Map());
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setResults([]);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);

    return () =>
      window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      if (cache.current.has(query)) {
        setResults(cache.current.get(query));
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/search/users/?query=${encodeURIComponent(query)}`
        );

        const data = await res.json();

        cache.current.set(query, data);
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="h-10 shrink-0 bg-[#481349] flex items-center px-3 text-white">
      <div className="flex-1 flex justify-center">
        <div
          ref={wrapperRef}
          className="relative w-[420px]"
        >
          <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-md px-3 py-1.5">
            <Search className="size-4 shrink-0" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Hack Club"
              className="bg-transparent outline-none flex-1 text-[13px] placeholder:text-[#d1c8d3]"
            />
          </div>

          {(loading || results.length > 0) && (
            <div className="absolute left-0 right-0 mt-2 rounded-sm bg-[#4b044b] border border-white/10 shadow-xl overflow-hidden z-50">
              {loading ? (
                <div className="p-3 text-sm text-gray-400">
                  Searching...
                </div>
              ) : (
                results.map((user) => (
                  <button
                    key={user.id}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/10 text-left"
                  >
                    <img
                      src={user.profilePicture}
                      alt=""
                      className="w-8 h-8 rounded-md"
                    />

                    <span>{user.displayName}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}