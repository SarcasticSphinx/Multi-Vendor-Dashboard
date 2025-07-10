import axios from "axios";

const uploadToImgBB = async (file: File): Promise<string | null> => {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    console.error("IMGBB API key is not set");
    return null;
  }
  const formData = new FormData();

  formData.append("image", file);

  try {
    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      formData
    );

    const imageUrl = res.data?.data?.url;
    return imageUrl;
  } catch (err) {
    console.error("Image upload failed in Server", err);
    return null;
  }
};

export default uploadToImgBB;
