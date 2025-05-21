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
  duration?: string; // 動画の長さ
}

// 動画タイプを管理するための型
type VideoType = "short" | "long";

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [videoType, setVideoType] = useState<VideoType>("long"); // デフォルトはロング動画

  const fetchTrendingVideos = async () => {
    if (!keyword.trim()) {
      setError("キーワードを入力してください");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // クエリパラメータにビデオタイプを追加
      const response = await fetch(`/api/youtube-trends?keyword=${encodeURIComponent(keyword)}&type=${videoType}`);
      
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

  // ビデオタイプを切り替える関数
  const toggleVideoType = () => {
    setVideoType(prevType => prevType === "short" ? "long" : "short");
  };

  return (
    <main className="container">
      <h1 className="page-title">✨🔥 YouTubeトレンドハンター 🔥✨</h1>
      <p className="page-description">気になるワードを入れるだけ！今アツい動画をサクッと発見！💫</p>
      
      <div className="search-form">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="検索キーワードを入力"
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
          <span className="toggle-label">{videoType === "short" ? "ショート動画" : "ロング動画"}</span>
        </div>
        
        <button 
          className="button"
          onClick={fetchTrendingVideos}
          disabled={isLoading}
        >
          {isLoading ? <span className="loading"></span> : '検索'}
        </button>
      </div>
      
      {error && (
        <div className="text-red-500 mb-4">
          エラー: {error}
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
                    <h2>{video.title}</h2>
                    <p className="text-gray-300">チャンネル名: {video.channelTitle}</p>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-sm text-gray-400">
                      <p>公開日: {new Date(video.publishedAt).toLocaleDateString()} （{getDaysAgo(video.publishedAt)}日前）</p>
                      <p>再生回数: {parseInt(video.viewCount).toLocaleString()}</p>
                      {video.duration && <p>長さ: {video.duration}</p>}
                    </div>
                    {video.risingScore && (
                      <>
                        <p className="text-yellow-400">
                          急上昇度: {Math.round(video.risingScore).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          ※急上昇度 ＝再生数 ÷ 経過日数
                        </p>
                      </>
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
