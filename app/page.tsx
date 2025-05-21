"use client";

import { useState } from "react";

interface Video {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: string;
  risingScore?: number; // Rising score
  duration?: string; // Video duration
}

// Type for video type management
type VideoType = "short" | "long";

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [videoType, setVideoType] = useState<VideoType>("long"); // Default is long video

  const fetchTrendingVideos = async () => {
    if (!keyword.trim()) {
      setError("Please enter a keyword");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Add video type to query parameters
      const response = await fetch(`/api/youtube-trends?keyword=${encodeURIComponent(keyword)}&type=${videoType}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      
      const data = await response.json();
      setVideos(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate days ago from a date
  const getDaysAgo = (dateString: string): number => {
    const publishedDate = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - publishedDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Function to toggle video type
  const toggleVideoType = () => {
    setVideoType(prevType => prevType === "short" ? "long" : "short");
  };

  return (
    <main className="container">
      <h1 className="page-title">✨🔥 YouTube Trend Hunter 🔥✨</h1>
      <p className="page-description">Enter a keyword and discover trending videos instantly! 💫</p>
      
      <div className="search-form">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter search keyword"
          onKeyDown={(e) => e.key === 'Enter' && fetchTrendingVideos()}
        />
        
        <div className="toggle-container">
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={videoType === "short"} 
              onChange={toggleVideoType}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="toggle-label">{videoType === "short" ? "Short Video" : "Long Video"}</span>
        </div>
        
        <button 
          className="button"
          onClick={fetchTrendingVideos}
          disabled={isLoading}
        >
          {isLoading ? <span className="loading"></span> : 'Search'}
        </button>
      </div>
      
      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}
      
      {videos.length > 0 && (
        <div className="grid gap-4 w-full">
          {videos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="video-card-link"
            >
              <div className="video-card">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="w-full md:w-48 h-auto"
                    />
                  </div>
                  <div className="video-info">
                    <h2 className="video-title">{video.title}</h2>
                    <p className="channel-name">Channel: {video.channelTitle}</p>
                    
                    <div className="video-stats">
                      <div className="video-stat-item">
                        <span className="stat-label">Published:</span> 
                        <span className="stat-value">
                          {new Date(video.publishedAt).toLocaleDateString()}
                          <br />
                          ({getDaysAgo(video.publishedAt)} days ago)
                        </span>
                      </div>
                      
                      <div className="video-stat-item">
                        <span className="stat-label">Views:</span> 
                        <span className="stat-value">{parseInt(video.viewCount).toLocaleString()}</span>
                      </div>
                      
                      {video.duration && (
                        <div className="video-stat-item">
                          <span className="stat-label">Length:</span> 
                          <span className="stat-value">{video.duration}</span>
                        </div>
                      )}
                    </div>
                    
                    {video.risingScore && (
                      <div className="trending-score-container">
                        <p className="trending-score">
                          Trending Score: {Math.round(video.risingScore).toLocaleString()}
                        </p>
                        <p className="trending-formula">
                          *Trending Score = Views ÷ Days since published
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
