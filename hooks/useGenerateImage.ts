import { FormDataTypes } from "@/types/formDataTypes";
import { useState } from "react";

const DEFAULT_VALUES = {
  width: 1024,
  height: 1024,
  model: "turbo",
};

const useGenerateImage = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateImages = async (formData: FormDataTypes) => {
    setLoading(true);
    setImageUrls([]);
    setError(null);

    const prompt = formData.prompt;
    const width = formData.width || DEFAULT_VALUES.width;
    const height = formData.height || DEFAULT_VALUES.height;

    // Generate 4 images with different seeds
    const imagePromises = [];

    for (let i = 0; i < 4; i++) {
      const seed = Math.floor(Math.random() * 100000);

      const promise = fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          width,
          height,
          seed,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to generate image");
          }
          return res.json();
        })
        .then((data) => data.imageUrl)
        .catch((err) => {
          console.error("Error generating image:", err);
          setError(err.message);
          return null;
        });

      imagePromises.push(promise);
    }

    // Wait for all images to complete
    const results = await Promise.all(imagePromises);

    // Filter out null values (failed requests)
    const successfulImages = results.filter((url) => url !== null) as string[];

    setImageUrls(successfulImages);

    if (successfulImages.length === 0) {
      setError("Failed to generate any images. Please try again.");
    }

    setLoading(false);
  };

  return { imageUrls, loading, error, generateImages };
};

export default useGenerateImage;
