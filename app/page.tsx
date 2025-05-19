"use client";

import { useState } from "react";

interface Video {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: string;
  risingScore?: number; // 急上昇度
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");

  const fetchTrendingVideos = async () => {
    if (!keyword.trim()) {
      setError("キーワードを入力してください");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/youtube-trends?keyword=${encodeURIComponent(keyword)}`);
      
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
      <h1 className="text-3xl font-bold mb-6">🔥 YouTube 急上昇動画検索</h1>
      <p className="mb-4">キーワードを入力して、関連する急上昇中の動画を表示します。</p>
      
      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="検索キーワードを入力"
          className="px-4 py-2 rounded border border-gray-700 bg-gray-800 text-white flex-grow"
          onKeyDown={(e) => e.key === 'Enter' && fetchTrendingVideos()}
        />
        
        <button 
          className="button" 
          onClick={fetchTrendingVideos}
          disabled={isLoading}
        >
          検索
          {isLoading && <span className="loading"></span>}
        </button>
      </div>
      
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
                  <div className="flex gap-4 text-sm text-gray-400 mb-1">
                    <p>公開日: {new Date(video.publishedAt).toLocaleDateString()}</p>
                    <p>再生回数: {parseInt(video.viewCount).toLocaleString()}</p>
                  </div>
                  {video.risingScore && (
                    <p className="text-yellow-400 font-medium mb-1">
                      急上昇度: {Math.round(video.risingScore).toLocaleString()}
                    </p>
                  )}
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
