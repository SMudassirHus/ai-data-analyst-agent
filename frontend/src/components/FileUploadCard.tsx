import { useRef, useState } from "react";
import { Database, FileSpreadsheet, UploadCloud } from "lucide-react";

import {
  uploadDataFile,
  uploadSampleDataset,
  type UploadResponse,
} from "../api/upload";
import { sampleDatasets, type SampleDataset } from "../data/sampleDatasets";
import { formatBytes } from "../utils/format";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";

const acceptedExtensions = ".csv,.xlsx,.xls";

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; data: UploadResponse }
  | { status: "error"; message: string };

type FileUploadCardProps = {
  onUploadComplete?: (data: UploadResponse) => void;
};

function isSupportedFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension === "csv" || extension === "xlsx" || extension === "xls";
}

function FileUploadCard({ onUploadComplete }: FileUploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
  });

  function chooseFile(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!isSupportedFile(file)) {
      setSelectedFile(null);
      setUploadState({
        status: "error",
        message: "Unsupported file type. Please choose a CSV or Excel file.",
      });
      return;
    }

    setSelectedFile(file);
    setUploadState({ status: "idle" });
  }

  async function handleUpload() {
    if (!selectedFile || uploadState.status === "uploading") {
      return;
    }

    setUploadState({ status: "uploading" });

    try {
      const data = await uploadDataFile(selectedFile);
      setUploadState({ status: "success", data });
      onUploadComplete?.(data);
    } catch (error: unknown) {
      setUploadState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to upload the selected file.",
      });
    }
  }

  async function handleSampleDataset(sample: SampleDataset) {
    if (uploadState.status === "uploading") {
      return;
    }

    setSelectedFile(null);
    setUploadState({ status: "uploading" });

    try {
      const data = await uploadSampleDataset(sample.id);
      setUploadState({ status: "success", data });
      onUploadComplete?.(data);
    } catch (error: unknown) {
      setUploadState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load sample dataset.",
      });
    }
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="border-b border-slate-200 bg-white p-4 lg:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-[#635BFF] ring-1 ring-indigo-100">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Dataset intake
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              Upload Dataset
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Add a CSV or Excel file to start the analytics workflow.
            </p>
          </div>
        </div>
        <Badge variant="blue">CSV, XLSX, XLS</Badge>
      </div>
      </div>

      <div
        className={`m-4 flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed p-5 text-center transition lg:m-5 ${
          isDragging
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-300 bg-slate-50 hover:border-indigo-300"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          chooseFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedExtensions}
          className="hidden"
          onChange={(event) => chooseFile(event.target.files?.[0])}
        />

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-[#635BFF]">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <p className="text-base font-semibold text-slate-950">
          Drop your data file here
        </p>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
          Supported formats are .csv, .xlsx, and .xls.
        </p>
        <Button
          variant="secondary"
          className="mt-5"
          onClick={() => inputRef.current?.click()}
        >
          Choose File
        </Button>
      </div>

      {selectedFile && (
        <div className="mx-4 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:mx-5">
          <p className="text-sm font-semibold text-slate-950">Selected file</p>
          <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <p className="truncate">
              <span className="font-medium text-slate-950">Name:</span>{" "}
              {selectedFile.name}
            </p>
            <p>
              <span className="font-medium text-slate-950">Size:</span>{" "}
              {formatBytes(selectedFile.size)}
            </p>
            <p>
              <span className="font-medium text-slate-950">Type:</span>{" "}
              {selectedFile.name.split(".").pop()?.toUpperCase()}
            </p>
          </div>
        </div>
      )}

      <div className="mx-4 mt-5 flex flex-col gap-3 sm:flex-row sm:items-center lg:mx-5">
        <Button
          disabled={!selectedFile || uploadState.status === "uploading"}
          onClick={handleUpload}
        >
          {uploadState.status === "uploading" ? "Uploading..." : "Upload File"}
        </Button>

        {uploadState.status === "error" && (
          <p className="text-sm font-medium text-rose-700">
            {uploadState.message}
          </p>
        )}

        {uploadState.status === "success" && (
          <p className="text-sm font-medium text-[#635BFF]">
            Upload complete.
          </p>
        )}
      </div>

      <div className="mt-6 border-t border-slate-200 bg-slate-50/70 px-4 py-5 lg:px-5">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-[#635BFF]" />
          <p className="text-sm font-semibold text-slate-950">
            Try a sample dataset
          </p>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {sampleDatasets.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={uploadState.status === "uploading"}
              className="rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-100"
              onClick={() => handleSampleDataset(sample)}
            >
              <p className="text-sm font-semibold text-slate-950">
                {sample.name}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {uploadState.status === "success" && (
        <div className="m-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-[#635BFF] lg:m-5">
          <p className="font-semibold">Uploaded file metadata</p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="font-medium">Filename</dt>
              <dd className="mt-1 break-all">{uploadState.data.filename}</dd>
            </div>
            <div>
              <dt className="font-medium">Original filename</dt>
              <dd className="mt-1 break-all">
                {uploadState.data.original_filename}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Size</dt>
              <dd className="mt-1">{formatBytes(uploadState.data.size_bytes)}</dd>
            </div>
            <div>
              <dt className="font-medium">File type</dt>
              <dd className="mt-1">{uploadState.data.file_type}</dd>
            </div>
          </dl>
        </div>
      )}
    </Card>
  );
}

export default FileUploadCard;
