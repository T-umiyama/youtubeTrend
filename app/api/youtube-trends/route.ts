import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Function to calculate trending score
function calculateRisingScore(viewCount: number, publishedAt: string): number {
  const now = new Date();
  const publishDate = new Date(publishedAt);
  
  // Calculate time elapsed in days
  const diffTime = now.getTime() - publishDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  // Use minimum 1 day to avoid division by zero
  const effectiveDays = Math.max(diffDays, 1);
  
  // Trending score = view count ÷ days elapsed
  return viewCount / effectiveDays;
}

// Convert ISO 8601 duration format to readable format
function formatDuration(isoDuration: string): string {
  // Extract hours, minutes, seconds from format like PT1H23M45S
  const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return '';
  
  const hours = matches[1] ? `${matches[1]}h` : '';
  const minutes = matches[2] ? `${matches[2]}m` : '';
  const seconds = matches[3] ? `${matches[3]}s` : '';
  
  return `${hours} ${minutes} ${seconds}`.trim();
}

// Determine if a video is a short video
function isShortVideo(duration: string): boolean {
  // Consider videos <= 5 minutes as short videos
  // This is a simple heuristic, more accurate determination may require additional factors
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return false;
  
  const hours = parseInt(matches[1] || '0');
  const minutes = parseInt(matches[2] || '0');
  const seconds = parseInt(matches[3] || '0');
  
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return totalSeconds <= 300; // 5 minutes = 300 seconds
}

export async function GET(request: NextRequest) {
  try {
    // YouTube Data API v3 key
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API key is not configured" },
        { status: 500 }
      );
    }

    // Get parameters from URL
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const type = searchParams.get('type') || 'long'; // Default is long video

    if (!keyword) {
      return NextResponse.json(
        { error: "No search keyword provided" },
        { status: 400 }
      );
    }

    // Set search period (7-30 days ago)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Step 1: Search API - find videos with specific keyword from 7-30 days ago
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&order=viewCount&publishedAfter=${encodeURIComponent(thirtyDaysAgo.toISOString())}&publishedBefore=${encodeURIComponent(sevenDaysAgo.toISOString())}&maxResults=50&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!searchResponse.ok) {
      throw new Error(`YouTube Search API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Extract video IDs from search results
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // Step 2: Videos API - get detailed information (view count and video duration)
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!videosResponse.ok) {
      throw new Error(`YouTube Videos API error: ${videosResponse.status}`);
    }

    const videosData = await videosResponse.json();

    // Step 3: Filter by video type, calculate trending score, and sort
    let formattedItems = videosData.items.map((item: any) => {
      const viewCount = parseInt(item.statistics.viewCount || "0");
      const publishedAt = item.snippet.publishedAt;
      const duration = item.contentDetails.duration;
      const isShort = isShortVideo(duration);
      
      return {
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        publishedAt: publishedAt,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        viewCount: item.statistics.viewCount || "0",
        duration: formatDuration(duration),
        isShort: isShort,
        risingScore: calculateRisingScore(viewCount, publishedAt)
      };
    });

    // Filter based on video type
    if (type === 'short') {
      formattedItems = formattedItems.filter((item: any) => item.isShort);
    } else {
      formattedItems = formattedItems.filter((item: any) => !item.isShort);
    }

    // Sort by trending score (descending)
    formattedItems.sort((a: any, b: any) => b.risingScore - a.risingScore);

    // Return top 10 results
    return NextResponse.json({ items: formattedItems.slice(0, 10) });
  } catch (error) {
    console.error("YouTube API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
