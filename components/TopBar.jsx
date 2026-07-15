"use client";

import { Hash, Search, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
const Channel = ({ label, profilePicture, hash, id, isPublic = true, setResults }) => (
  <Link
    onClick={()=>{setResults([])}}
    href={hash ? `/channels/${id}` : `/dm/${id}`}
    className="mx-2 flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-white/10"
  >
    {hash ? (
      <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-white/10">
        {isPublic ? (
          <Hash className="size-4 text-neutral-300" />
        ) : (
          <Lock className="size-4 text-neutral-300" />
        )}
      </div>
    ) : (
      <Image
        src={profilePicture}
        alt={label}
        width={32}
        height={32}
        className="size-8 rounded-sm object-cover"
      />
    )}

    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-white">{label}</p>

      <p className="text-xs text-neutral-400">{hash ? "Channel" : "User"}</p>
    </div>
  </Link>
);
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

    return () => window.removeEventListener("mousedown", handleClickOutside);
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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/search/general/?query=${encodeURIComponent(query)}`,
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
        <div ref={wrapperRef} className="relative w-[420px]">
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
            <div className="absolute py-2 left-0 right-0 mt-2 rounded-sm bg-[#5E2C5f] border border-white/10 shadow-xl overflow-hidden z-50">
              {loading ? (
                <div className="p-3 text-sm text-gray-400">Searching...</div>
              ) : (
                results
                  .slice(0, 7)
                  .map((item) => (
                    <Channel
                    setResults={setResults}
                      key={item.id}
                      hash={item.type == "channel"}
                      label={item.name || item.displayName}
                      id={item.id}
                      profilePicture={item?.profilePicture}
                    />
                  ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
