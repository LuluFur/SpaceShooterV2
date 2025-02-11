// Message configuration with different types and their styling
const MESSAGE_CONFIG = {
    ACHIEVEMENT: {
        duration: 3000,
        style: {
            color: '#FFD700', // Gold
            fontSize: '24px',
            fontWeight: 'bold',
            prefix: '- '
        }
    },
    WARNING: {
        duration: 2000,
        style: {
            color: '#FF4444', // Red
            fontSize: '20px',
            fontWeight: 'bold',
            prefix: '- '
        }
    },
    INFO: {
        duration: 2000,
        style: {
            color: '#FFFFFF', // White
            fontSize: '18px',
            fontWeight: 'normal',
            prefix: '- '
        }
    },
    SCORE: {
        duration: 1500,
        style: {
            color: '#44FF44', // Green
            fontSize: '20px',
            fontWeight: 'bold',
            prefix: '- '
        }
    },
    DANGER: {
        duration: 2500,
        style: {
            color: '#FF0000', // Bright Red
            fontSize: '24px',
            fontWeight: 'bold',
            prefix: '- '
        }
    },
    SKILL_UPGRADE: {
        duration: 2500,
        style: {
            color: '#00FFFF', // Cyan
            fontSize: '22px',
            fontWeight: 'bold',
            prefix: '- '
        }
    }
};

class GameMessager {
    constructor() {
        this.messages = [];
        this.maxMessages = 3; // Maximum number of messages shown at once
        this.spacing = 40; // Vertical spacing between messages
        this.baseY = 100; // Starting Y position for first message
    }

    show(text, type = 'INFO') {
        const config = MESSAGE_CONFIG[type];
        if (!config) {
            console.error(`Invalid message type: ${type}`);
            return;
        }
    
        // Define banner decorations based on message type
        // In the show method, update the decorations object:
        const decorations = {
            ACHIEVEMENT: ['🌟', '🌟'],
            WARNING: ['🔸', '🔸'],
            INFO: ['💠', '💠'],
            SCORE: ['🔥', '🔥'],
            DANGER: ['❗', '❗'],
            SKILL_UPGRADE: ['✨', '✨']
        };
    
        // Get the decoration emojis for this type or default to generic ones
        const [leftEmoji, rightEmoji] = decorations[type] || ['•', '•'];
    
        // Create banner text with decorative elements
        const bannerText = `${leftEmoji} ${config.style.prefix}${text} ${rightEmoji}`;
    
        const message = {
            text: bannerText,
            type: type,
            config: config,
            startTime: Date.now(),
            opacity: 1,
            y: this.baseY,
            // Add banner effect properties
            bannerWidth: 0,
            targetWidth: 0,
            padding: 20, // Padding for the banner
            height: parseInt(config.style.fontSize) + 16 // Banner height based on font size
        };
    
        // Add new message and maintain max message limit
        this.messages.push(message);
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }
    
        // Adjust positions of all messages
        this.updateMessagePositions();
    }

    updateMessagePositions() {
        for (let i = 0; i < this.messages.length; i++) {
            this.messages[i].y = this.baseY + (i * this.spacing);
        }
    }

    draw(p5) {
    const currentTime = Date.now();

    for (let i = this.messages.length - 1; i >= 0; i--) {
        const message = this.messages[i];
        const elapsedTime = currentTime - message.startTime;
        const config = message.config;

        if (elapsedTime >= config.duration) {
            this.messages.splice(i, 1);
            this.updateMessagePositions();
            continue;
        }

        // Calculate fade out
        if (elapsedTime > config.duration - 500) {
            message.opacity = 1 - (elapsedTime - (config.duration - 500)) / 500;
        }

        // Calculate banner width animation
        if (!message.targetWidth) {
            p5.textSize(parseInt(config.style.fontSize));
            message.targetWidth = p5.textWidth(message.text) + message.padding * 2;
        }
        
        // Animate banner width
        message.bannerWidth = p5.lerp(message.bannerWidth, message.targetWidth, 0.2);

        // Draw banner background
        p5.push();
        p5.noStroke();
        const bgColor = p5.color(config.style.color);
        bgColor.setAlpha(50 * message.opacity);
        p5.fill(bgColor);
        p5.rectMode(p5.CENTER);
        p5.rect(p5.width / 2, message.y - message.height/3, 
                message.bannerWidth, message.height, 
                message.height/2);

        // Draw text (moved up by 5 pixels)
        p5.textAlign(p5.CENTER);
        p5.textSize(parseInt(config.style.fontSize));
        p5.textStyle(config.style.fontWeight === 'bold' ? p5.BOLD : p5.NORMAL);
        p5.fill(p5.color(config.style.color + Math.floor(message.opacity * 255).toString(16).padStart(2, '0')));
        p5.text(message.text, p5.width / 2, message.y - 5); // Subtracted 5 from message.y
        p5.pop();
    }
}
}

// Export a single instance
export const gameMessager = new GameMessager();