// DoctorsPage.jsx
const doctors = [
  {
    id: 1,
    name: "Dr. Glen Emmerich",
    specialty: "Cardiology",
    department: "Heart Center",
    phone: "+963904845993",
    gender: "Female",
    status: "Active",
  },
  {
    id: 2,
    name: "Dr. Kelsie Boehm",
    specialty: "Neurology",
    department: "Neuro Clinic",
    phone: "+963963420022",
    gender: "Female",
    status: "On leave",
  },
  {
    id: 3,
    name: "Dr. Mohammad Littel",
    specialty: "Orthopedics",
    department: "Bone & Joint",
    phone: "+963910739149",
    gender: "Male",
    status: "Available",
  },
];

const statusStyles = {
  Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  Available: "bg-sky-500/15 text-sky-400 border-sky-500/40",
  "On leave": "bg-amber-500/15 text-amber-400 border-amber-500/40",
};

export default function DoctorsPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Doctors</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Browse and manage doctors by specialty and department.
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-secondary"
        >
          Add doctor
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-border flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="Search by name, specialty, or department..."
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/35 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <select className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15">
          <option value="">All specialties</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Neurology">Neurology</option>
          <option value="Orthopedics">Orthopedics</option>
        </select>

        <select className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15">
          <option value="">All departments</option>
          <option value="Heart Center">Heart Center</option>
          <option value="Neuro Clinic">Neuro Clinic</option>
          <option value="Bone & Joint">Bone & Joint</option>
        </select>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => (
            <article
              key={doctor.id}
              className="group rounded-2xl border border-border bg-surface/80 p-4 shadow-sm transition hover:border-primary/60 hover:shadow-lg hover:bg-surface"
            >
              {/* Top row: avatar + name + status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {doctor.name
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      {doctor.name}
                    </h2>
                    <p className="text-xs text-foreground/60">
                      {doctor.specialty}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    statusStyles[doctor.status] ?? statusStyles["Active"]
                  }`}
                >
                  {doctor.status}
                </span>
              </div>

              {/* Middle: department + gender + phone */}
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-foreground/55">Department</span>
                  <span className="rounded-full bg-muted-light px-2 py-0.5 text-[11px] font-medium text-foreground/80">
                    {doctor.department}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-foreground/55">Gender</span>
                  <span className="text-foreground/80">{doctor.gender}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-foreground/55">Phone</span>
                  <span className="font-mono text-[11px] text-foreground/85">
                    {doctor.phone}
                  </span>
                </div>
              </div>

              {/* Bottom: actions */}
              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-muted-light"
                >
                  View profile
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-muted-light"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-error px-3 py-1.5 text-xs font-medium text-background transition hover:bg-error/80"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
