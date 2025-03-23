import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Loader,
  Download,
  FileText,
  File,
} from "lucide-react";

// The worker source should be set up in your main component, but we include it here for completeness
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const FileComp = ({ file, fileName }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get file type
  const getFileType = () => {
    if (!file) return null;

    // If file is string (URL), try to determine from extension
    if (typeof file === "string") {
      if (file.endsWith(".pdf")) return "pdf";
      if (/\.(jpe?g|png|gif|bmp|webp)$/i.test(file)) return "image";
      if (/\.(docx?|xlsx?|pptx?|txt|csv)$/i.test(file)) return "document";
      return "unknown";
    }

    // If file is a File object
    if (file instanceof File || (file.type && file.name)) {
      if (file.type === "application/pdf") return "pdf";
      if (file.type.startsWith("image/")) return "image";
      if (
        file.type.includes("officedocument") ||
        file.type.includes("document") ||
        file.type.includes("text/")
      )
        return "document";
      return "unknown";
    }

    // If file is a Blob with type
    if (file instanceof Blob && file.type) {
      if (file.type === "application/pdf") return "pdf";
      if (file.type.startsWith("image/")) return "image";
      return "document";
    }

    return "unknown";
  };

  // PDF handling functions
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
  }

  function onDocumentLoadError(err) {
    console.error("Error loading file:", err);
    setError("Failed to load document");
    setIsLoading(false);
  }

  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  // Get file URL (whether it's a string URL or File/Blob object)
  const getFileUrl = () => {
    if (!file) return null;
    if (typeof file === "string") return file;
    return URL.createObjectURL(file);
  };

  // Handle download
  const handleDownload = () => {
    const url = getFileUrl();
    if (!url) return;

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Component for unknown file types
  const UnknownFileView = () => (
    <div className="flex flex-col items-center justify-center p-6">
      <FileText className="size-12 mb-3 text-base-content/70" />
      <p className="mb-4 text-center">{fileName || "File"}</p>
      <button onClick={handleDownload} className="btn btn-sm btn-primary">
        <Download className="size-4 mr-2" />
        Download File
      </button>
    </div>
  );

  // Component for image files
  const ImageView = () => (
    <div className="flex flex-col items-center">
      <div className="relative max-h-[450px] overflow-hidden rounded-md border">
        <img
          src={getFileUrl()}
          alt={fileName || "Image"}
          className="max-w-full max-h-[450px] object-contain"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError("Failed to load image");
            setIsLoading(false);
          }}
        />
      </div>
      {fileName && <p className="mt-2 text-sm text-center">{fileName}</p>}
    </div>
  );

  // Component for document files (non-PDF)
  const DocumentView = () => (
    <div className="flex flex-col items-center justify-center p-6">
      <File className="size-12 mb-3 text-base-content/70" />
      <p className="mb-4 text-center">{fileName || "Document"}</p>
      <button onClick={handleDownload} className="btn btn-sm btn-primary">
        <Download className="size-4 mr-2" />
        Download Document
      </button>
    </div>
  );

  // PDF view component
  const PdfView = () => (
    <>
      <Document
        file={getFileUrl()}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="flex justify-center items-center h-32">
            <Loader className="size-8 animate-spin" />
          </div>
        }
      >
        <Page
          pageNumber={pageNumber}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          width={450}
        />
      </Document>

      {numPages > 0 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="btn btn-sm btn-outline"
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>

          <p className="text-sm">
            Page {pageNumber} of {numPages}
          </p>

          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className="btn btn-sm btn-outline"
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </>
  );

  if (!file) {
    return <div className="p-4 text-center">No file selected</div>;
  }

  const fileType = getFileType();

  return (
    <div className="file-container border rounded-lg p-4">
      {isLoading && fileType !== "image" && (
        <div className="flex justify-center items-center h-32">
          <Loader className="size-8 animate-spin" />
        </div>
      )}

      {error && <div className="text-error p-4 text-center">{error}</div>}

      {!error && !isLoading && (
        <div className="file-preview">
          {fileType === "pdf" && <PdfView />}
          {fileType === "image" && <ImageView />}
          {fileType === "document" && <DocumentView />}
          {fileType === "unknown" && <UnknownFileView />}
        </div>
      )}
    </div>
  );
};

export default FileComp;
