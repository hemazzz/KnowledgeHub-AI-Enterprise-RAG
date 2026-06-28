import API_BASE from "./api";

export const uploadPdf = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE}/sources/upload-pdf`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
};