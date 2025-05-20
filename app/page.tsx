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

  // 日付から経過日数を計算する関数
  const getDaysAgo = (dateString: string): number => {
    const publishedDate = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - publishedDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <main className="container">
      <h1 className="page-title text-3xl font-bold">🔥YouTube 急上昇動画検索ツール 🔥</h1>
      <p className="page-description">キーワードを入力して、関連する急上昇中の動画を表示します。</p>
      
      <div className="search-form">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="検索キーワードを入力"
          className="px-4 py-2 rounded-md border border-gray-600 bg-gray-800 text-white"
          onKeyDown={(e) => e.key === 'Enter' && fetchTrendingVideos()}
        />
        
        <button 
          className="button" 
          onClick={fetchTrendingVideos}
          disabled={isLoading}
        >
          {isLoading ? '検索中...' : '検索'}
          {isLoading && <span className="loading ml-2"></span>}
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
                  <p className="text-gray-300 mb-1">チャンネル名: {video.channelTitle}</p>
                  <div className="flex gap-4 text-sm text-gray-400 mb-1">
                    <p>公開日: {new Date(video.publishedAt).toLocaleDateString()} （{getDaysAgo(video.publishedAt)}日前）</p>
                    <p>再生回数: {parseInt(video.viewCount).toLocaleString()}</p>
                  </div>
                  {video.risingScore && (
                    <>
                      <p className="text-yellow-400 font-medium mb-1">
                        急上昇度: {Math.round(video.risingScore).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        ※急上昇度 ＝再生数 ÷ 経過日数
                      </p>
                    </>
                  )}
                  <a 
                    href={`https://www.youtube.com/watch?v=${video.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="youtube-link mt-2"
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
