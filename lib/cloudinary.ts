const uploadToCloudinary = async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url || null;
  } catch (err) {
    console.error("Upload failed:", err);
    return null;
  }
};

export default uploadToCloudinary;
