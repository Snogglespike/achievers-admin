import { Input, Select } from "~/components";

interface Props {
  chapters: {
    id: number;
    name: string;
  }[];
  searchParams: URLSearchParams;
  onFormClear: () => void;
}

export default function FormInputs({
  chapters,
  searchParams,
  onFormClear,
}: Props) {
  const searchTerm = searchParams.get("searchTerm");

  return (
    <div className="mb-6 flex flex-wrap justify-between gap-4">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="w-full sm:w-96">
          <Input
            name="searchTerm"
            placeholder="Search by name or email"
            defaultValue={
              searchParams.get("clearSearchBtn") === null && searchTerm !== null
                ? searchTerm
                : ""
            }
          />
        </div>

        {chapters.length > 1 && (
          <div className="w-full sm:w-44">
            <Select
              name="chapterId"
              defaultValue={searchParams.get("chapterId") ?? ""}
              options={[{ value: "", label: "All chapters" }].concat(
                chapters.map(({ id, name }) => ({
                  label: name,
                  value: id.toString(),
                })),
              )}
            />
          </div>
        )}

        <div className="flex flex-wrap sm:gap-4">
          <div className="form-control">
            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                name="onlyExpiredChecks"
                className="checkbox bg-base-100"
                defaultChecked={searchParams.get("onlyExpiredChecks") === "on"}
              />
              <span className="label-text">
                Only expired or soon to expire checks
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                name="includeArchived"
                className="checkbox bg-base-100"
                defaultChecked={searchParams.get("includeArchived") === "on"}
              />
              <span className="label-text">Include archived</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          className="btn btn-outline sm:w-32"
          type="submit"
          name="clearSearchBtn"
          value="clearSearchBtn"
          onClick={onFormClear}
        >
          Clear
        </button>

        <button
          className="btn btn-primary w-full sm:w-32"
          type="submit"
          name="searchBtn"
          value="searchBtn"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
