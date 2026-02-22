import { useState, useRef } from "react";
import "./AdvikaAI.css";
import botVideo from "../assets/bot-video.mp4";
import avatar from "../assets/chatbot-girl.png";

export default function AdvikaAI() {
    const [showVideo, setShowVideo] = useState(false);
    const [showChat, setShowChat] = useState(false);

    const videoRef = useRef(null);

    const handleIconClick = () => {
        setShowVideo(true);     // video show

        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.play();
            }
        }, 150);
    };

    const handleVideoEnd = () => {
        setShowVideo(false);
        setShowChat(true);      // open chatbody
    };

    const handleCloseChat = () => {
        setShowChat(false);
    };

    return (
        <div className="advika-wrapper">

            {/* VIDEO OUTSIDE CHATBODY (Floating Circle View) */}
            {showVideo && (
                <div className="w-[240px] h-[240px] bg-black rounded-full overflow-hidden shadow-2xl border-4 border-pink-400 z-[1000] flex items-center justify-center mb-5">
                    <video
                        ref={videoRef}
                        src={botVideo}
                        autoPlay
                        playsInline
                        onEnded={handleVideoEnd}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* CHATBODY */}
            {showChat && (
                <div className="chat-container">

                    <div className="chat-header">
                        <span>✨ Advika AI</span>
                        <button onClick={handleCloseChat}>✕</button>
                    </div>

                    <div className="chat-body">

                        <div className="bot-message">
                            👋 Welcome to Bireena Atithi!
                            <br />
                            How can I assist you today?
                        </div>

                        <div className="quick-options">
                            <button>Make Reservation</button>
                            <button>Order Food</button>
                            <button>Pricing Information</button>
                            <button>Table Booking</button>
                            <button>About Bireena Atithi</button>
                        </div>

                    </div>

                    <div className="chat-input-wrapper">
                        <div className="chat-input">
                            <button className="mic">🎤</button>
                            <input placeholder="Type a message..." />
                            <button className="send">➤</button>
                        </div>
                    </div>

                </div>
            )}

            {/* BOT ICON */}
            <div
                className={`bot-icon transition-all duration-300 ${showChat ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100"
                    }`}
                onClick={handleIconClick}
            >
                <img src={avatar} alt="Advika AI" />
            </div>

        </div>
    );
}
