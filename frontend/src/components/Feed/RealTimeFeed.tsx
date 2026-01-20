import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, Twitter, Video, Share2 } from 'lucide-react';

interface SocialMention {
    id: string;
    platform: string;
    content: string;
    author: string;
    timestamp: string;
    sentiment: string;
}

const SOCKET_URL = 'http://localhost:3000';

export function RealTimeFeed() {
    const [mentions, setMentions] = useState<SocialMention[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('connect', () => {
            console.log('Connected to WebSocket Gateway');
        });

        socket.on('new-mention', (mention: SocialMention) => {
            setMentions((prev) => [mention, ...prev].slice(0, 50));
        });

        return () => {
            socket.off('connect');
            socket.off('new-mention');
        };
    }, [socket]);

    const getPlatformIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'twitter':
                return <Twitter className="w-4 h-4 text-sky-400" />;
            case 'tiktok':
                return <Video className="w-4 h-4 text-pink-500" />;
            case 'reddit':
                return <MessageSquare className="w-4 h-4 text-orange-500" />;
            default:
                return <Share2 className="w-4 h-4 text-slate-400" />;
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment.toLowerCase()) {
            case 'positive':
                return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'negative':
                return 'text-red-400 bg-red-400/10 border-red-400/20';
            default:
                return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-white">Live Feed</h1>
                <div className="flex items-center space-x-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                    </span>
                    <span className="text-xs text-sky-500 font-medium">LIVE</span>
                </div>
            </div>

            <div className="grid gap-4">
                {mentions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                        Waiting for live signals...
                    </div>
                ) : (
                    mentions.map((mention) => (
                        <div
                            key={mention.id}
                            className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors animate-in fade-in slide-in-from-top-4 duration-300"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                        {getPlatformIcon(mention.platform)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-white">
                                            {mention.author}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {new Date(mention.timestamp).toLocaleTimeString()} • via {mention.platform}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getSentimentColor(
                                        mention.sentiment
                                    )}`}
                                >
                                    {mention.sentiment}
                                </span>
                            </div>
                            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                                {mention.content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
