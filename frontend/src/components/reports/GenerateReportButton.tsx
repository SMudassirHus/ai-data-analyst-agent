import Button from "../ui/Button";

type GenerateReportButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
  onClick: () => void;
};

function GenerateReportButton({
  disabled = false,
  isLoading = false,
  onClick,
}: GenerateReportButtonProps) {
  return (
    <Button disabled={disabled || isLoading} onClick={onClick}>
      {isLoading ? "Generating Report..." : "Generate Report"}
    </Button>
  );
}

export default GenerateReportButton;
