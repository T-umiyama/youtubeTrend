"use client";

import { useState } from "react";

interface Video {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingVideos = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/youtube-trends");
      
      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }
      
      const data = await response.json();
      setVideos(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container">
      <h1 className="text-3xl font-bold mb-6">🔥 YouTube トレンド動画</h1>
      <p className="mb-4">ボタンを押すと、世界中でトレンドになっている動画を5つ表示します。</p>
      
      <button 
        className="button mb-8" 
        onClick={fetchTrendingVideos}
        disabled={isLoading}
      >
        トレンド動画を取得
        {isLoading && <span className="loading"></span>}
      </button>
      
      {error && (
        <div className="text-red-500 mb-4">
          エラー: {error}
        </div>
      )}
      
      {videos.length > 0 && (
        <div className="grid gap-4">
          {videos.map((video) => (
            <div key={video.id} className="video-card">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full md:w-48 h-auto rounded"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
                  <p className="text-gray-300 mb-1">{video.channelTitle}</p>
                  <p className="text-sm text-gray-400">
                    公開日: {new Date(video.publishedAt).toLocaleDateString()}
                  </p>
                  <a 
                    href={`https://www.youtube.com/watch?v=${video.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-red-500 hover:underline"
                  >
                    YouTubeで視聴 →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
