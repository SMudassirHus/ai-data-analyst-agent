import { buildReportDownloadUrl } from "../../api/reports";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { Download, ShieldCheck } from "lucide-react";

type DownloadReportCardProps = {
  reportId: string;
  downloadUrl: string;
};

function DownloadReportCard({ reportId, downloadUrl }: DownloadReportCardProps) {
  return (
    <Card className="border-indigo-100 bg-indigo-50/70 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#635BFF] shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#635BFF]">
              Report generated successfully
            </p>
            <p className="mt-1 break-all text-sm text-slate-600">
              {reportId}
            </p>
          </div>
        </div>
        <a href={buildReportDownloadUrl(downloadUrl)} download>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </a>
      </div>
    </Card>
  );
}

export default DownloadReportCard;
