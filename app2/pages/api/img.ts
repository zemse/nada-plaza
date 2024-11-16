import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid URL parameter" });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch image" });
    }

    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.startsWith("image")) {
      return res.status(400).json({ error: "URL does not point to an image" });
    }

    const imageBuffer = await response.arrayBuffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
    res.status(200).send(Buffer.from(imageBuffer));
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch the image",
      details: (error as any).message,
    });
  }
}
