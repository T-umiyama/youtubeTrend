import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// 急上昇度の計算関数
function calculateRisingScore(viewCount: number, publishedAt: string): number {
  const now = new Date();
  const publishDate = new Date(publishedAt);
  
  // 公開からの経過時間（日単位）
  const diffTime = now.getTime() - publishDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  // 最低1日として計算（0での除算を防ぐ）
  const effectiveDays = Math.max(diffDays, 1);
  
  // 急上昇度 = 再生回数 ÷ 経過日数
  return viewCount / effectiveDays;
}

export async function GET(request: NextRequest) {
  try {
    // YouTube Data API v3 の API キー
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API キーが設定されていません" },
        { status: 500 }
      );
    }

    // URLからキーワードパラメータを取得
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword) {
      return NextResponse.json(
        { error: "検索キーワードが指定されていません" },
        { status: 400 }
      );
    }

    // 検索期間の設定（7日前～30日前の動画を検索）
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // ステップ1: Search API で特定キーワードの7日以上前の動画を検索
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&order=viewCount&publishedAfter=${encodeURIComponent(thirtyDaysAgo.toISOString())}&publishedBefore=${encodeURIComponent(sevenDaysAgo.toISOString())}&maxResults=25&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!searchResponse.ok) {
      throw new Error(`YouTube Search API エラー: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // 検索結果から動画IDを抽出
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // ステップ2: Videos API で詳細情報を取得（視聴回数などを含む）
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!videosResponse.ok) {
      throw new Error(`YouTube Videos API エラー: ${videosResponse.status}`);
    }

    const videosData = await videosResponse.json();

    // ステップ3: 急上昇度を計算してソート
    const formattedItems = videosData.items.map((item: any) => {
      const viewCount = parseInt(item.statistics.viewCount || "0");
      const publishedAt = item.snippet.publishedAt;
      
      return {
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        publishedAt: publishedAt,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        viewCount: item.statistics.viewCount || "0",
        risingScore: calculateRisingScore(viewCount, publishedAt)
      };
    });

    // 急上昇度でソート（降順）
    formattedItems.sort((a: any, b: any) => b.risingScore - a.risingScore);

    // 上位10件を返す
    return NextResponse.json({ items: formattedItems.slice(0, 10) });
  } catch (error) {
    console.error("YouTube API エラー:", error);
    return NextResponse.json(
      { error: "動画の取得に失敗しました" },
      { status: 500 }
    );
  }
}
