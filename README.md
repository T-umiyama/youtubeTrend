# YouTube Trend Hunter

A sleek and modern application designed to discover trending YouTube videos based on your search keywords. This application allows you to find trending videos from the past month and analyze their popularity.

## ✨ Features

- 🔍 **Keyword Search**: Find trending videos based on your interests
- 📊 **Trending Score**: Discover videos gaining momentum with our unique trending algorithm
- 🎬 **Video Type Filter**: Toggle between short videos and long-form content
- 📱 **Responsive Design**: Optimized for all devices from mobile to desktop
- 🌐 **Multilingual Support**: Interface available in English (default)
- 🎨 **Modern UI**: Sleek glass-morphism design with vibrant colors

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- YouTube Data API key

### Installation

1. Clone this repository

```bash
git clone <repository-url>
cd youtubeTrend
```

2. Install dependencies

```bash
npm install
# or
yarn
# or
pnpm install
```

3. Create a `.env.local` file and add your YouTube API key

```
YOUTUBE_API_KEY=your_youtube_api_key_here
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## 🔑 How to Get a YouTube API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the YouTube Data API v3
4. Navigate to the Credentials page and create an API key
5. Restrict the API key to YouTube Data API v3 (optional but recommended)
6. Copy the API key to your `.env.local` file

## 📊 How the Trending Score Works

The application calculates a trending score for each video using the following formula:

```
Trending Score = Total Views ÷ Days since published
```

This formula helps identify videos that are gaining views rapidly relative to their age, highlighting content that is currently trending rather than just popular overall.

## 🖼️ Preview

The application features a modern, visually appealing interface with:

- Gradient background with subtle patterns
- Glass-morphism UI elements
- Animated interactions
- Responsive card layout for video results

## 🛠️ Technology Stack

- **Framework**: Next.js
- **Styling**: CSS with Tailwind utility classes
- **API**: YouTube Data API v3
- **Deployment**: Vercel (recommended)

## ⚠️ Important Notes

- YouTube Data API has quota limitations on the free tier. Frequent API calls may exceed your quota
- This application is optimized for discovery, not for streaming videos
- For production use, consider implementing caching mechanisms to reduce API calls

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue to improve the application.
