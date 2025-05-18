import { NextResponse } from "next/server";

export async function GET() {
  try {
    // YouTube Data API v3 の API キー（実際の開発では環境変数から取得する）
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API キーが設定されていません" },
        { status: 500 }
      );
    }

    // YouTube API の trending エンドポイントから動画を取得する
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=5&regionCode=JP&key=${apiKey}`,
      { next: { revalidate: 3600 } } // 1時間でキャッシュを再検証
    );

    if (!response.ok) {
      throw new Error(`YouTube API エラー: ${response.status}`);
    }

    const data = await response.json();
    
    // 必要なデータだけを抽出してクライアントに返す
    const formattedItems = data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
    }));

    return NextResponse.json({ items: formattedItems });
  } catch (error) {
    console.error("YouTube API エラー:", error);
    return NextResponse.json(
      { error: "トレンド動画の取得に失敗しました" },
      { status: 500 }
    );
  }
}
