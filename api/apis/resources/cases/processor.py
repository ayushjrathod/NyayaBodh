import pdfplumber
import json
import re

def extract_metadata(pdf_path, section_name):
    """
    Extracts text up to a specified section name from the first page of the PDF.
    """
    with pdfplumber.open(pdf_path) as pdf:
        # Ensure the PDF has at least one page
        if len(pdf.pages) < 1:
            print("The PDF does not contain any pages.")
            return None
        
        # Extract text from the first page
        first_page = pdf.pages[0]
        text = first_page.extract_text()

        # Find the index of the section_name
        if text:
            index = text.find(section_name)
            if index != -1:
                # Return text up to the section_name
                return text[:index].strip()
            else:
                # If section_name is not found, return the entire text
                return text.strip()
        else:
            print("No text found on the first page.")
            return None

def extract_sections(pdf_path):
    """
    Extracts specified sections from the PDF and returns them in a dictionary.
    """
    # Initialize the dictionary with section names
    section_names = [
        "Issue for Consideration",
        "Headnotes",
        "Case Law Cited",
        "List of Acts",
        "List of Keywords",
        "Case Arising From",
        "Appearances for Parties",
        "Judgment / Order of the Supreme Court",
        "CONCLUSION"
    ]
    
    sections = {name: "" for name in section_names}
    current_section = None
    
    # Regular expression for detecting section headings
    section_heading_pattern = re.compile('|'.join(section_names))
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                lines = text.split('\n')
                for line in lines:
                    line = line.strip()
                    # Detect section headings
                    match = section_heading_pattern.match(line)
                    if match:
                        current_section = match.group(0)
                    elif current_section:
                        sections[current_section] += line + '\n'
    
    return sections

def save_as_json(data, output_path):
    """
    Saves the data dictionary as a JSON file.
    """
    with open(output_path, 'w') as json_file:
        json.dump(data, json_file, indent=4)

# Paths for PDF and output JSON
pdf_path = '/home/prathamesh/Downloads/cases/bda980fee73361180449be9ba8f33c4d58812a39bf989284d91d388e8ab4eb271724494305.pdf'
output_path = 'sections.json'

# Extract metadata
metadata = extract_metadata(pdf_path, "Issue for Consideration")

# Extract sections
sections = extract_sections(pdf_path)

# Combine metadata and sections into one dictionary
output_data = {
    "metadata": metadata,
    "sections": sections
}

# Save the combined data as a JSON file
save_as_json(output_data, output_path)
