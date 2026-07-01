import { useEffect, useState } from "react";

import {
  getDatasetRows,
  type ExplorePagination,
  type ExploreResponse,
} from "../../api/explore";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import LoadingState from "../ui/LoadingState";
import DataTable from "./DataTable";
import PaginationControls from "./PaginationControls";
import TableToolbar from "./TableToolbar";

type DataExplorerProps = {
  filename: string;
};

type ExplorerState =
  | { status: "loading" }
  | { status: "success"; data: ExploreResponse }
  | { status: "error"; message: string };

const defaultPagination: ExplorePagination = {
  page: 1,
  page_size: 25,
  total_rows: 0,
  total_pages: 1,
};

function DataExplorer({ filename }: DataExplorerProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [explorerState, setExplorerState] = useState<ExplorerState>({
    status: "loading",
  });

  useEffect(() => {
    let isMounted = true;

    setExplorerState({ status: "loading" });

    getDatasetRows(filename, {
      page,
      pageSize,
      search: search.trim() || undefined,
      sortBy,
      sortOrder,
    })
      .then((data) => {
        if (isMounted) {
          setExplorerState({ status: "success", data });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setExplorerState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unable to load dataset rows.",
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filename, page, pageSize, search, sortBy, sortOrder]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  function handleSortChange(column: string) {
    if (column === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      setPage(1);
      return;
    }

    setSortBy(column);
    setSortOrder("asc");
    setPage(1);
  }

  const pagination =
    explorerState.status === "success"
      ? explorerState.data.pagination
      : defaultPagination;

  const columns =
    explorerState.status === "success" ? explorerState.data.columns : [];
  const rows = explorerState.status === "success" ? explorerState.data.rows : [];

  return (
    <Card className="overflow-hidden">
      <TableToolbar
        search={search}
        pageSize={pageSize}
        totalRows={pagination.total_rows}
        onSearchChange={handleSearchChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {explorerState.status === "loading" && (
        <div className="p-4">
          <LoadingState
            title="Loading dataset rows"
            description="Preparing a paginated preview of the uploaded file."
          />
        </div>
      )}

      {explorerState.status === "error" && (
        <div className="p-4">
          <EmptyState
            title="Unable to load data explorer"
            description={explorerState.message}
          />
        </div>
      )}

      {explorerState.status === "success" && (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
          <PaginationControls
            page={pagination.page}
            totalPages={pagination.total_pages}
            totalRows={pagination.total_rows}
            pageSize={pagination.page_size}
            onPageChange={setPage}
          />
        </>
      )}
    </Card>
  );
}

export default DataExplorer;
