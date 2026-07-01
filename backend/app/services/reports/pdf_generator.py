from datetime import datetime
from pathlib import Path
from uuid import uuid4

from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.core.config import settings


def generate_report_pdf(report_data: dict) -> tuple[str, Path]:
    settings.GENERATED_REPORT_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y_%m_%d_%H%M%S")
    report_id = f"report_{timestamp}_{uuid4().hex[:8]}.pdf"
    output_path = settings.GENERATED_REPORT_DIR / report_id

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=LETTER,
        rightMargin=0.65 * inch,
        leftMargin=0.65 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.65 * inch,
    )

    styles = _build_styles()
    story = []

    story.extend(_cover_page(report_data, styles))
    story.append(PageBreak())
    story.extend(_report_body(report_data, styles))

    doc.build(story)
    return report_id, output_path


def _build_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "ReportTitle",
            parent=base["Title"],
            fontSize=24,
            leading=30,
            textColor=colors.HexColor("#0f172a"),
            spaceAfter=18,
        ),
        "subtitle": ParagraphStyle(
            "ReportSubtitle",
            parent=base["Normal"],
            fontSize=11,
            leading=16,
            textColor=colors.HexColor("#475569"),
        ),
        "section": ParagraphStyle(
            "Section",
            parent=base["Heading2"],
            fontSize=15,
            leading=20,
            textColor=colors.HexColor("#047857"),
            spaceBefore=16,
            spaceAfter=8,
        ),
        "body": ParagraphStyle(
            "ReportBody",
            parent=base["BodyText"],
            fontSize=10,
            leading=15,
            textColor=colors.HexColor("#334155"),
            spaceAfter=8,
        ),
        "bullet": ParagraphStyle(
            "ReportBullet",
            parent=base["BodyText"],
            fontSize=10,
            leading=15,
            leftIndent=12,
            bulletIndent=0,
            textColor=colors.HexColor("#334155"),
            spaceAfter=6,
        ),
    }


def _cover_page(report_data: dict, styles: dict[str, ParagraphStyle]) -> list:
    generated_at = report_data["generated_at"].strftime("%B %d, %Y %H:%M UTC")
    return [
        Spacer(1, 1.2 * inch),
        Paragraph(report_data["title"], styles["title"]),
        Paragraph(f"Dataset: {report_data['dataset_name']}", styles["subtitle"]),
        Paragraph(f"Generated: {generated_at}", styles["subtitle"]),
        Spacer(1, 0.5 * inch),
        Paragraph(
            "Prepared by InsightPilot AI for executive review.",
            styles["body"],
        ),
    ]


def _report_body(report_data: dict, styles: dict[str, ParagraphStyle]) -> list:
    overview = report_data["overview"]
    story = [
        Paragraph("Executive Summary", styles["section"]),
        Paragraph(report_data["executive_summary"], styles["body"]),
        Paragraph("Dataset Overview", styles["section"]),
        _overview_table(overview),
        Paragraph("Data Quality Assessment", styles["section"]),
    ]

    warnings = report_data["data_quality"]["warnings"]
    if warnings:
        story.extend(_bullets(warnings, styles))
    else:
        story.append(Paragraph("No data quality warnings were identified.", styles["body"]))

    story.extend(
        [
            Paragraph("Key Findings", styles["section"]),
            *_bullets(report_data["key_findings"], styles),
            Paragraph("Risks", styles["section"]),
            *_bullets_or_empty(report_data["risks"], styles, "No material risks identified."),
            Paragraph("Opportunities", styles["section"]),
            *_bullets_or_empty(
                report_data["opportunities"],
                styles,
                "No specific opportunities identified.",
            ),
            Paragraph("Recommended Actions", styles["section"]),
            *_bullets(report_data["recommended_actions"], styles),
            Paragraph("Forecast Summary", styles["section"]),
            Paragraph(report_data["forecast_summary"], styles["body"]),
            Paragraph("Generated Charts", styles["section"]),
            Paragraph(
                "No saved chart artifacts are attached to this report version.",
                styles["body"],
            ),
            Paragraph("Final Conclusions", styles["section"]),
            Paragraph(report_data["final_conclusions"], styles["body"]),
        ]
    )

    return story


def _overview_table(overview: dict) -> Table:
    data = [
        ["Metric", "Value"],
        ["Total rows", f"{overview['total_rows']:,}"],
        ["Total columns", f"{overview['total_columns']:,}"],
        ["Memory usage", f"{overview['memory_usage_mb']} MB"],
        ["Missing values", f"{overview['missing_values']:,}"],
        ["Duplicate rows", f"{overview['duplicate_rows']:,}"],
    ]
    table = Table(data, colWidths=[2.4 * inch, 3.6 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#ecfdf5")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#065f46")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("PADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table


def _bullets(items: list[str], styles: dict[str, ParagraphStyle]) -> list:
    return [Paragraph(item, styles["bullet"], bulletText="-") for item in items]


def _bullets_or_empty(
    items: list[str],
    styles: dict[str, ParagraphStyle],
    empty_text: str,
) -> list:
    if items:
        return _bullets(items, styles)

    return [Paragraph(empty_text, styles["body"])]
