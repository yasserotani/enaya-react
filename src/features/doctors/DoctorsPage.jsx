import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  fetchDepartments,
  fetchDoctors,
  restoreDoctor,
} from "./api/doctorsApi";

function getDoctorName(doctor) {
  return doctor.full_name ?? doctor.name ?? "Unknown";
}

function getInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatGender(gender) {
  if (!gender) return "—";
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

export default function DoctorsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage ?? null,
  );

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" (Active Only), "inactive", or "all"
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const [restoreError, setRestoreError] = useState(null);
  const [specialtyOptions, setSpecialtyOptions] = useState([]);

  useEffect(() => {
    if (!location.state?.successMessage) return;

    setSuccessMessage(location.state.successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function loadDepartments() {
      try {
        const result = await fetchDepartments();
        if (!cancelled) {
          setDepartments(Array.isArray(result) ? result : (result.data ?? []));
        }
      } catch {
        if (!cancelled) setDepartments([]);
      }
    }

    void loadDepartments();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadDoctors = useCallback(async () => {
    setIsLoading(true);
    setListError(null);

    try {
      const params = { page: currentPage };

      if (debouncedSearch) params.search = debouncedSearch;
      if (specialtyFilter) params.specialty = specialtyFilter;
      if (departmentFilter) params.department_id = departmentFilter;
      if (genderFilter) params.gender = genderFilter;

      // Exactly as per API Guide: Use with_trashed=true to include soft-deleted records
      if (statusFilter === "all" || statusFilter === "inactive") {
        params.with_trashed = "true";
      }

      const result = await fetchDoctors(params);

      setDoctors(result.data ?? []);
      setCurrentPage(result.current_page ?? 1);
      setLastPage(result.last_page ?? 1);
    } catch (err) {
      setListError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load doctors",
      );
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    debouncedSearch,
    specialtyFilter,
    departmentFilter,
    genderFilter,
    statusFilter,
  ]);

  useEffect(() => {
    void loadDoctors();
  }, [loadDoctors]);

  const displayedDoctors = useMemo(() => {
    if (statusFilter === "inactive") {
      return doctors.filter((doctor) => Boolean(doctor.deleted_at));
    }
    return doctors;
  }, [doctors, statusFilter]);

  useEffect(() => {
    setSpecialtyOptions((prevOptions) => {
      const newSpecialties = doctors
        .map((doctor) => doctor.specialty)
        .filter(Boolean);

      const combinedUnique = [...new Set([...prevOptions, ...newSpecialties])];

      return combinedUnique.sort();
    });
  }, [doctors]);

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setCurrentPage(1);
  };
  const handleRestore = async (id) => {
    setRestoringId(id);
    setRestoreError(null);
    try {
      await restoreDoctor(id);
      setSuccessMessage("Doctor restored successfully");
      await loadDoctors();
    } catch (err) {
      setRestoreError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to restore doctor",
      );
    } finally {
      setRestoringId(null);
    }
  };
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Doctors</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Browse and manage doctors by specialty and department.
          </p>
        </div>

        <Link
          to="/doctors/new"
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-secondary"
        >
          Add doctor
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4">
        <div className="min-w-[220px] flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialty, or department..."
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/35 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <select
          value={specialtyFilter}
          onChange={handleFilterChange(setSpecialtyFilter)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        >
          <option value="">All specialties</option>
          {specialtyOptions.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>

        <select
          value={departmentFilter}
          onChange={handleFilterChange(setDepartmentFilter)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        >
          <option value="">All departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          value={genderFilter}
          onChange={handleFilterChange(setGenderFilter)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        >
          <option value="">All genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        {/* Status Filter Component dropdown */}
        <select
          value={statusFilter}
          onChange={handleFilterChange(setStatusFilter)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        >
          <option value="">Active Only</option>
          <option value="inactive">Inactive / Deleted</option>
          <option value="all">All Statuses</option>
        </select>
      </div>

      {successMessage && (
        <div className="mx-6 mt-4 rounded-xl border border-success-border bg-success-light px-4 py-3 text-sm text-success">
          {successMessage}
        </div>
      )}

      {listError && (
        <div className="mx-6 mt-4 rounded-xl border border-error-border bg-error-light px-4 py-3 text-sm text-error">
          {listError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-foreground/50">
            Loading doctors...
          </p>
        ) : displayedDoctors.length === 0 ? (
          <p className="py-12 text-center text-sm text-foreground/50">
            No doctors found
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {displayedDoctors.map((doctor) => {
              const name = getDoctorName(doctor);
              const departmentName =
                doctor.department?.name ?? doctor.department_name ?? "—";
              const isDeleted = Boolean(doctor.deleted_at);

              return (
                <article
                  key={doctor.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/doctors/${doctor.id}`)}
                  className="group cursor-pointer rounded-2xl border border-border bg-surface/80 p-4 shadow-sm transition hover:border-primary/60 hover:bg-surface hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                        {getInitials(name)}
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-foreground">
                          {name}
                        </h2>
                        <p className="text-xs text-foreground/60">
                          {doctor.specialty || "—"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        isDeleted
                          ? "border-error/40 bg-error/15 text-error"
                          : "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                      }`}
                    >
                      {isDeleted ? "Inactive" : "Active"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground/55">Department</span>
                      <span className="rounded-full bg-muted-light px-2 py-0.5 text-[11px] font-medium text-foreground/80">
                        {departmentName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground/55">Gender</span>
                      <span className="text-foreground/80">
                        {formatGender(doctor.gender)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground/55">Phone</span>
                      <span className="font-mono text-[11px] text-foreground/85">
                        {doctor.phone || "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground/55">Email</span>
                      <span
                        className="truncate max-w-[140px] text-[11px] text-foreground/80"
                        title={doctor.email || doctor.user?.email || "No email"}
                      >
                        {doctor.email || doctor.user?.email || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-xs font-medium text-primary transition group-hover:text-secondary">
                      View profile →
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {lastPage > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-foreground/60">
              Page {currentPage} of {lastPage}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-muted-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= lastPage || isLoading}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-muted-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
