import csv
import io
from typing import List

from app.models.lead import Lead


def generate_csv(leads: List[Lead]) -> bytes:
    """Generate a HubSpot-ready CSV from a list of Lead objects.

    Returns UTF-8 BOM encoded CSV bytes ready for download.
    """
    output = io.StringIO()

    # HubSpot column headers
    fieldnames = [
        "First Name",
        "Last Name",
        "Email",
        "Phone Number",
        "Job Title",
        "Company Name",
        "Company Domain Name",
        "Website URL",
        "Description",
        "Industry",
        "Street Address",
        "City",
        "State/Region",
        "Country/Region",
        "Number of Employees",
        "LinkedIn URL",
        "Company LinkedIn URL",
        "Personalized Email Draft",
        "Suggested Approach",
    ]

    writer = csv.DictWriter(output, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
    writer.writeheader()

    for lead in leads:
        # Build a description from headline and scraped context
        description_parts = []
        if lead.headline:
            description_parts.append(lead.headline)
        if lead.scraped_context:
            description_parts.append(lead.scraped_context[:500])
        description = " | ".join(description_parts) if description_parts else ""

        row = {
            "First Name": lead.first_name or "",
            "Last Name": lead.last_name or "",
            "Email": lead.email or "",
            "Phone Number": lead.phone or "",
            "Job Title": lead.job_title or "",
            "Company Name": lead.company_name or "",
            "Company Domain Name": lead.company_domain or "",
            "Website URL": f"https://{lead.company_domain}" if lead.company_domain else "",
            "Description": description,
            "Industry": lead.company_industry or "",
            "Street Address": "",
            "City": lead.city or "",
            "State/Region": lead.state or "",
            "Country/Region": lead.country or "",
            "Number of Employees": lead.company_size or "",
            "LinkedIn URL": lead.linkedin_url or "",
            "Company LinkedIn URL": lead.company_linkedin_url or "",
            "Personalized Email Draft": lead.personalized_email or "",
            "Suggested Approach": lead.suggested_approach or "",
        }
        writer.writerow(row)

    csv_content = output.getvalue()
    output.close()

    # UTF-8 BOM encoding for Excel compatibility
    bom = b"\xef\xbb\xbf"
    return bom + csv_content.encode("utf-8")
