"use client";

import { useMemo, useState } from "react";
import { ActivityCard } from "@/components/ActivityCard";
import { Alert, cn, EmptyState, Select } from "@/components/ui";
import { FilterIcon, SearchIcon } from "@/components/icons";
import { mockActivities, mockActivityTypes } from "@/lib/mock";
import type { Activity } from "@/lib/types";

export default function HomePage() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(
    () => new Set([1, 3]),
  );
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return activities.filter((activity) => {
      const matchesTerm = !term || activity.name.toLowerCase().includes(term);
      const matchesType =
        !typeFilter || activity.activityType?.id === Number(typeFilter);
      return matchesTerm && matchesType;
    });
  }, [activities, search, typeFilter]);

  function handleEnroll(activity: Activity) {
    setEnrolledIds((prev) => new Set(prev).add(activity.id));
    setActivities((prev) =>
      prev.map((item) =>
        item.id === activity.id
          ? {
              ...item,
              availableSpots: Math.max(0, (item.availableSpots ?? 1) - 1),
              enrolledCount: (item.enrolledCount ?? 0) + 1,
            }
          : item,
      ),
    );
    setToast(`Te inscribiste en "${activity.name}".`);
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
              <SearchIcon width={18} height={18} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar actividades..."
              className="w-full rounded-input border border-transparent bg-surface-2 py-3 pl-11 pr-4 text-[15px] outline-none placeholder:text-muted focus:border-primary focus:bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            aria-label="Filtros"
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-input border transition-colors",
              showFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent bg-surface-2 text-foreground",
            )}
          >
            <FilterIcon />
          </button>
        </div>

        {showFilters && (
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {mockActivityTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      {toast && <Alert tone="success">{toast}</Alert>}

      {filtered.length === 0 ? (
        <EmptyState
          title="No hay actividades disponibles"
          description="Prueba con otra búsqueda o cambia el filtro de categoría."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              enrolled={enrolledIds.has(activity.id)}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      )}
    </>
  );
}
