import React, { useState } from "react";
import "./AdvikaAI.css";
import chatbotGirl from "../assets/chatbot-girl.png";

function AdvikaAI() {
    const [isClicked, setIsClicked] = useState(false);

    return (
        <div
            className={`advika-container ${isClicked ? "active" : ""}`}
            onClick={() => setIsClicked(!isClicked)}
        >
            <div className="advika-tooltip">Advika AI</div>
            <div className="advika-avatar">
                <img src={chatbotGirl} alt="Advika AI" />
            </div>
        </div>
    );
}

export default AdvikaAI;
