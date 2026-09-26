import { useEffect, useRef, useState } from "react";
import { searchPlaces } from "../lib/api";
import { SearchIcon, LocateIcon } from "./Icons";

export default function SearchBar({ onSelect, onLocate, locating }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  // Debounced autocomplete.
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await searchPlaces(query, ctrl.signal));
        setActive(0);
      } catch (e) {
        if (e.name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  useEffect(() => {
    const close = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function choose(place) {
    onSelect(place);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showList = open && query.trim().length >= 2;

  return (
    <div className="search" ref={boxRef}>
      <div className="search-field glass">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search any city…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label="Search city"
          aria-expanded={showList}
          aria-controls="search-results"
          role="combobox"
          autoComplete="off"
        />
        {loading && <span className="spinner" aria-hidden="true" />}
        <button
          type="button"
          className={`icon-btn${locating ? " pulsing" : ""}`}
          onClick={onLocate}
          title="Use my location"
          aria-label="Use my location"
        >
          <LocateIcon />
        </button>
      </div>
      {showList && (
        <ul className="search-results glass" id="search-results" role="listbox">
          {results.length === 0 && !loading && <li className="empty">No places found</li>}
          {results.map((r, i) => (
            <li
              key={r.id}
              role="option"
              aria-selected={i === active}
              className={i === active ? "active" : ""}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(r)}
            >
              <span className="name">{r.name}</span>
              <span className="region">{r.region}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
