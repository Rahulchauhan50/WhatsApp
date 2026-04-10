import React, { useRef } from "react";

const DocumentPicker = React.forwardRef(({ onChange }, ref) => {
  const fileInputRef = ref || useRef(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 25MB for documents)
      const maxSize = 25 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("File size should not exceed 25MB");
        return;
      }
      onChange(e);
    }
  };

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
      onChange={handleChange}
      style={{ display: "none" }}
      id="document-picker"
    />
  );
});

DocumentPicker.displayName = "DocumentPicker";

export default DocumentPicker;
