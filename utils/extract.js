import PDFParser from "pdf2json";

export const extractTextFromPDF = async (pdfPath) => {
  try {
    console.log("Processing PDF");
    
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
    let text = pdfData.Pages.map(page =>
      page.Texts.map(text =>
        decodeURIComponent(text.R[0].T)
      ).join(' ')
    ).join('\n');

    // 1. Remove extra spaces between letters:
    text = text.replace(/ +/g, ' '); // Replace multiple spaces with single space

    // 2. Attempt to fix common encoding issues (this might need refinement):
    text = text.replace(/�/g, "'"); // Example: Replace a strange character with an apostrophe
    text = text.replace(/’/g, "'");
    text = text.replace(/“/g, "\"");
    text = text.replace(/”/g, "\"");
    text = text.replace(/–/g, "-"); // Fix encoded hyphens
    text = text.replace(/—/g, "-");
    text = text.replace(/…/g, "...");
    text = text.replace(/’/g, "'");


    // 3. Basic structure improvement (very basic example - needs work):
    text = text.replace(/\n+/g, '\n'); // Remove extra newlines
    text = text.replace(/ +(\.|\,|\:|\;)/g, '$1'); // Remove spaces before punctuation

    resolve(text);
  });

      pdfParser.on("pdfParser_dataError", (error) => {
        console.error("Error parsing PDF:", error);
        reject(error);
      });

      pdfParser.loadPDF(pdfPath);
    });
  } catch (error) {
    console.error("Error extracting text:", error);
    throw error;
  }
};