export const getFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const getFileIcon = (fileName) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const icons = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    xls: "📊",
    xlsx: "📊",
    ppt: "🎞️",
    pptx: "🎞️",
    txt: "📃",
    zip: "📦",
    rar: "📦",
  };
  return icons[ext] || "📎";
};

export const getDocumentType = (fileName) => {
  const ext = fileName.split(".").pop()?.toUpperCase();
  return ext || "FILE";
};
