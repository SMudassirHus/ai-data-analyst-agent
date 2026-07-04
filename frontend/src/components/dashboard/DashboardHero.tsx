import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";

function DashboardHero() {
  function scrollToUpload() {
    document.getElementById("upload-dataset")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <Card
      id="dashboard"
      className="overflow-hidden p-4 lg:p-5"
    >
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr] xl:items-center">
        <div>
          <Badge variant="blue">Enterprise AI analytics workspace</Badge>
          <h2 className="mt-3 max-w-4xl text-2xl font-semibold tracking-normal text-[#111827] lg:text-3xl">
            Turn raw datasets into decisions.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Upload CSV or Excel files, profile datasets, detect data quality
            issues, ask business questions, generate charts, forecast trends,
            and package the work into executive reports.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={scrollToUpload}>Upload Dataset</Button>
            <Button variant="secondary" onClick={scrollToUpload}>
              Try Sample Data
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] p-4">
          <p className="text-sm font-semibold text-[#111827]">
            Analytics operating model
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["Profile", "Structure and quality"],
              ["Explore", "Rows and columns"],
              ["Visualize", "AI chart planning"],
              ["Report", "Executive output"],
            ].map(([label, description], index) => (
              <div
                key={label}
                className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-3"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#635BFF] text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm font-semibold text-[#111827]">{label}</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#6B7280]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default DashboardHero;
