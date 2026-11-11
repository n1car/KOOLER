"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityCard } from "@/components/ActivityCard";
import {
  cn,
  EmptyState,
  ErrorState,
  LoadingState,
  Select,
} from "@/components/ui";
import { FilterIcon, SearchIcon } from "@/components/icons";
import { api, ApiError } from "@/lib/api";
import type { Activity, ActivityType } from "@/lib/types";

const PAGE_SIZE = 6;

export default function HomePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [types, setTypes] = useState<ActivityType[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [list, catalog, enrollments] = await Promise.all([
        api.activities.list(),
        api.catalog.activityTypes(),
        api.activities.myEnrollments(),
      ]);
      setActivities(list.filter((activity) => activity.status !== "CANCELLED"));
      setTypes(catalog);
      setEnrolledIds(new Set(enrollments.map((item) => item.activity.id)));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudieron cargar las actividades.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return activities.filter((activity) => {
      const matchesTerm = !term || activity.name.toLowerCase().includes(term);
      const matchesType =
        !typeFilter || activity.activityType?.id === Number(typeFilter);
      return matchesTerm && matchesType;
    });
  }, [activities, search, typeFilter]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
          <SearchIcon width={18} height={18} />
        </span>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          placeholder="Buscar actividades..."
          className="w-full rounded-full border border-[#E2E8F0] bg-white py-3.5 pl-11 pr-12 text-[15px] outline-none placeholder:text-muted focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setShowFilters((value) => !value)}
          aria-label="Filtros"
          className={cn(
            "absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition-colors",
            showFilters ? "bg-primary/10 text-primary" : "text-muted",
          )}
        >
          <FilterIcon width={18} height={18} />
        </button>
      </div>

      {showFilters && (
        <Select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
        >
          <option value="">Todas las categorías</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </Select>
      )}

      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-bold text-foreground lg:text-2xl">Actividades</h1>
        <p className="text-sm text-muted">Encuentra, inscríbete y participa</p>
      </div>

      {loading ? (
        <LoadingState label="Cargando actividades..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No hay actividades disponibles"
          description="Prueba con otra búsqueda o cambia el filtro de categoría."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
            {visible.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                enrolled={enrolledIds.has(activity.id)}
              />
            ))}
          </div>

          {visibleCount < filtered.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="self-center rounded-full border border-[#E2E8F0] bg-white px-6 py-2.5 text-sm font-semibold text-foreground active:bg-surface-2"
            >
              Cargar más
            </button>
          )}
        </div>
      )}
    </>
  );
}
