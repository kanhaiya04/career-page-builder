import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type JobFilterFormProps = {
  slug: string;
  filters: {
    q: string;
    location: string;
    jobType: string;
  };
  locations: string[];
  jobTypes: string[];
  primaryColor: string;
};

export function JobFilterForm({
  slug,
  filters,
  locations,
  jobTypes,
  primaryColor,
}: JobFilterFormProps) {
  return (
    <form
      method="get"
      action={`/${slug}/careers`}
      className="grid gap-4 md:grid-cols-4"
    >
      <div className="space-y-2">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          name="q"
          placeholder="Role or keyword"
          defaultValue={filters.q}
        />
      </div>
      <SelectField
        id="location"
        label="Location"
        name="location"
        defaultValue={filters.location || "all"}
        options={["all", ...locations]}
      />
      <SelectField
        id="jobType"
        label="Job type"
        name="jobType"
        defaultValue={filters.jobType || "all"}
        options={["all", ...jobTypes]}
      />
      <div className="flex items-end">
        <Button
          type="submit"
          className="w-full text-white"
          style={{ backgroundColor: primaryColor }}
        >
          Apply filters
        </Button>
      </div>
    </form>
  );
}
function SelectField({
  id,
  label,
  name,
  defaultValue,
  options,
}: {
  id: string;
  label: string;
  name: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-full border border-slate-200 px-4 text-sm text-slate-700"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? `All ${label.toLowerCase()}s` : option}
          </option>
        ))}
      </select>
    </div>
  );
}


