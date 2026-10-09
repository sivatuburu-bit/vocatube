const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export async function searchYouTubeVideos(query) {
  const url =
    `https://www.googleapis.com/youtube/v3/search` +
    `?part=snippet` +
    `&q=${encodeURIComponent(query)}` +
    `&type=video` +
    `&maxResults=12` +
    `&key=${API_KEY}`;

  console.log("YouTube Search Query:", query);
  console.log(
    "YouTube API Key exists:",
    Boolean(API_KEY)
  );

  const response = await fetch(url);

  const data = await response.json();

  console.log(
    "YouTube API Response:",
    data
  );

  if (!response.ok) {
    const apiMessage =
      data?.error?.message ||
      "YouTube API request failed";

    throw new Error(apiMessage);
  }

  return data.items || [];
}