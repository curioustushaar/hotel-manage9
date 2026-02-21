import { useState, useRef } from "react";
import chatbotGirl from "../assets/chatbot-girl.png";
import botVideo from "../assets/bot-video.mp4";

export default function AdvikaAI() {
    const [open, setOpen] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const videoRef = useRef(null);

    const handleOpen = () => {
        setOpen(true);
        setShowVideo(true);

        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.play();
            }
        }, 200);
    };

    const handleVideoEnd = () => {
        setShowVideo(false);
    };

    return (
        <div className="absolute -bottom-[25px] right-[140px] z-[999] flex flex-col items-end gap-3">

            {/* CHAT PANEL */}
            {open && (
                <div className="w-[360px] h-[540px] bg-white rounded-3xl shadow-2xl border border-pink-200 overflow-hidden flex flex-col transition-all duration-500">

                    {/* HEADER */}
                    <div className="bg-gradient-to-r from-pink-500 to-rose-400 text-white p-4 flex justify-between items-center">
                        <div className="font-semibold text-lg">Advika AI</div>
                        <button
                            onClick={() => {
                                setOpen(false);
                                setShowVideo(false);
                            }}
                            className="text-white text-xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* VIDEO SECTION */}
                    {showVideo ? (
                        <div className="flex-1 flex items-center justify-center bg-pink-50">
                            <video
                                ref={videoRef}
                                src={botVideo}
                                autoPlay
                                playsInline
                                onEnded={handleVideoEnd}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    ) : (
                        <>
                            {/* MESSAGE AREA */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-50">

                                <div className="bg-white p-3 rounded-xl shadow text-sm w-fit max-w-[85%]">
                                    👋 Welcome to Bireena Atithi!
                                    How can I assist you today?
                                </div>

                                {/* QUICK OPTIONS */}
                                <div className="space-y-2">
                                    {[
                                        "Make Reservation",
                                        "Order Food",
                                        "Pricing Information",
                                        "Table Booking",
                                        "About Bireena Atithi",
                                    ].map((item, i) => (
                                        <button
                                            key={i}
                                            className="w-full text-left px-4 py-2 rounded-lg bg-white hover:bg-pink-100 shadow-sm text-sm transition"
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>

                            </div>

                            {/* INPUT SECTION */}
                            <div className="p-4 border-t border-pink-100 bg-white flex items-center gap-2">
                                <button className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center">
                                    🎤
                                </button>

                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 rounded-full border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                                />

                                <button className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center">
                                    ➤
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* BOT ICON */}
            <div
                onClick={() => (open ? setOpen(false) : handleOpen())}
                className="relative w-[65px] h-[65px] rounded-full bg-gradient-to-br from-pink-200 to-rose-300 shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 transition duration-300"
            >
                <img
                    src={chatbotGirl}
                    alt="Advika AI"
                    className="w-[55px] h-[55px] rounded-full object-cover"
                />
            </div>
        </div>
    );
}
