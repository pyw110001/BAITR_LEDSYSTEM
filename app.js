/**
 * TUIO WebSocket Client
 * 处理触摸事件并发送到 WebSocket 服务器
 */
class TuioWebSocketClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.cursors = new Map(); // sessionId -> {x, y, element}
        this.sessionIdCounter = 0;
        this.frameCounter = 0;
        this.frameInterval = null;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.wsUrlInput = document.getElementById('wsUrl');
        this.udpHostInput = document.getElementById('udpHost');
        this.udpPortInput = document.getElementById('udpPort');
        this.connectBtn = document.getElementById('connectBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.touchArea = document.getElementById('touchArea');
        this.wsStatus = document.getElementById('wsStatus');
        this.wsStatusText = document.getElementById('wsStatusText');
        this.udpTarget = document.getElementById('udpTarget');
        this.logArea = document.getElementById('logArea');
        this.activeCursorsDisplay = document.getElementById('activeCursors');
        this.totalFramesDisplay = document.getElementById('totalFrames');
    }

    attachEventListeners() {
        this.connectBtn.addEventListener('click', () => this.toggleConnection());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // 触摸区域事件
        this.touchArea.addEventListener('mousedown', (e) => this.handlePointerStart(e));
        this.touchArea.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        
        // 全局事件（用于跟踪移动和结束）
        document.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        document.addEventListener('mouseup', (e) => this.handlePointerEnd(e));
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        document.addEventListener('touchcancel', (e) => this.handleTouchEnd(e));
    }

    log(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        this.logArea.appendChild(entry);
        this.logArea.scrollTop = this.logArea.scrollHeight;
        
        // 限制日志条目数量
        if (this.logArea.children.length > 100) {
            this.logArea.removeChild(this.logArea.firstChild);
        }
    }

    toggleConnection() {
        if (this.isConnected) {
            this.disconnect();
        } else {
            this.connect();
        }
    }

    connect() {
        const wsUrl = this.wsUrlInput.value.trim();
        if (!wsUrl) {
            this.log('请输入 WebSocket 服务器地址', 'error');
            return;
        }

        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                this.isConnected = true;
                this.updateConnectionStatus(true);
                this.log('WebSocket 连接成功', 'info');
                this.startFrameLoop();
            };

            this.ws.onmessage = (event) => {
                // 可以处理服务器返回的消息
                this.log(`收到消息: ${event.data}`, 'info');
            };

            this.ws.onerror = (error) => {
                this.log('WebSocket 连接错误', 'error');
                console.error('WebSocket error:', error);
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                this.updateConnectionStatus(false);
                this.log('WebSocket 连接已关闭', 'warn');
                this.stopFrameLoop();
            };

        } catch (error) {
            this.log(`连接失败: ${error.message}`, 'error');
            console.error('Connection error:', error);
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.stopFrameLoop();
    }

    updateConnectionStatus(connected) {
        if (connected) {
            this.wsStatus.className = 'status-indicator connected';
            this.wsStatusText.textContent = '已连接';
            this.connectBtn.textContent = '断开连接';
            this.resetBtn.disabled = false;
        } else {
            this.wsStatus.className = 'status-indicator disconnected';
            this.wsStatusText.textContent = '未连接';
            this.connectBtn.textContent = '连接服务器';
            this.resetBtn.disabled = true;
        }
        
        const udpHost = this.udpHostInput.value || '127.0.0.1';
        const udpPort = this.udpPortInput.value || '3333';
        this.udpTarget.textContent = `${udpHost}:${udpPort}`;
    }

    getTouchPosition(event) {
        const rect = this.touchArea.getBoundingClientRect();
        let x, y;
        
        if (event.touches) {
            // 触摸事件
            const touch = event.touches[0] || event.changedTouches[0];
            x = touch.clientX - rect.left;
            y = touch.clientY - rect.top;
        } else {
            // 鼠标事件
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        }
        
        // 归一化坐标 (0-1)
        const normalizedX = Math.max(0, Math.min(1, x / rect.width));
        const normalizedY = Math.max(0, Math.min(1, y / rect.height));
        
        return { x: normalizedX, y: normalizedY, rawX: x, rawY: y };
    }

    handlePointerStart(event) {
        if (event.button !== 0) return; // 只处理左键
        event.preventDefault();
        
        const pos = this.getTouchPosition(event);
        this.addCursor(event.pointerId || Date.now(), pos.x, pos.y, pos.rawX, pos.rawY);
    }

    handleTouchStart(event) {
        event.preventDefault();
        
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            const pos = this.getTouchPosition({
                touches: [touch],
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.addCursor(touch.identifier, pos.x, pos.y, pos.rawX, pos.rawY);
        }
    }

    handlePointerMove(event) {
        if (event.buttons !== 1) return; // 只在按下时移动
        event.preventDefault();
        
        const pos = this.getTouchPosition(event);
        const sessionId = event.pointerId || Array.from(this.cursors.keys())[0];
        if (sessionId !== undefined) {
            this.updateCursor(sessionId, pos.x, pos.y, pos.rawX, pos.rawY);
        }
    }

    handleTouchMove(event) {
        event.preventDefault();
        
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            const pos = this.getTouchPosition({
                touches: [touch],
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.updateCursor(touch.identifier, pos.x, pos.y, pos.rawX, pos.rawY);
        }
    }

    handlePointerEnd(event) {
        const sessionId = event.pointerId || Array.from(this.cursors.keys())[0];
        if (sessionId !== undefined) {
            this.removeCursor(sessionId);
        }
    }

    handleTouchEnd(event) {
        event.preventDefault();
        
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            this.removeCursor(touch.identifier);
        }
    }

    addCursor(identifier, x, y, rawX, rawY) {
        if (this.cursors.has(identifier)) {
            return; // 已存在
        }

        const sessionId = this.sessionIdCounter++;
        const cursor = {
            sessionId,
            x,
            y,
            xSpeed: 0,
            ySpeed: 0,
            motionAccel: 0,
            lastX: x,
            lastY: y,
            lastTime: Date.now()
        };

        this.cursors.set(identifier, cursor);

        // 创建可视化元素
        const element = document.createElement('div');
        element.className = 'touch-point';
        element.style.left = `${rawX}px`;
        element.style.top = `${rawY}px`;
        element.textContent = sessionId;
        element.id = `cursor-${sessionId}`;
        this.touchArea.appendChild(element);

        // 发送消息
        if (this.isConnected) {
            this.sendMessage({
                type: 'cursor',
                action: 'add',
                sessionId: cursor.sessionId,
                x: cursor.x,
                y: cursor.y,
                xSpeed: cursor.xSpeed,
                ySpeed: cursor.ySpeed,
                motionAccel: cursor.motionAccel
            });
        }

        this.updateStats();
        this.log(`添加光标 #${sessionId} at (${x.toFixed(3)}, ${y.toFixed(3)})`, 'info');
    }

    updateCursor(identifier, x, y, rawX, rawY) {
        const cursor = this.cursors.get(identifier);
        if (!cursor) return;

        const now = Date.now();
        const dt = (now - cursor.lastTime) / 1000; // 秒
        const dx = x - cursor.lastX;
        const dy = y - cursor.lastY;

        // 计算速度（像素/秒，归一化）
        cursor.xSpeed = dt > 0 ? dx / dt : 0;
        cursor.ySpeed = dt > 0 ? dy / dt : 0;

        // 计算加速度（简化）
        cursor.motionAccel = Math.sqrt(cursor.xSpeed * cursor.xSpeed + cursor.ySpeed * cursor.ySpeed);

        cursor.x = x;
        cursor.y = y;
        cursor.lastX = x;
        cursor.lastY = y;
        cursor.lastTime = now;

        // 更新可视化
        const element = document.getElementById(`cursor-${cursor.sessionId}`);
        if (element) {
            element.style.left = `${rawX}px`;
            element.style.top = `${rawY}px`;
        }

        // 发送消息
        if (this.isConnected) {
            this.sendMessage({
                type: 'cursor',
                action: 'update',
                sessionId: cursor.sessionId,
                x: cursor.x,
                y: cursor.y,
                xSpeed: cursor.xSpeed,
                ySpeed: cursor.ySpeed,
                motionAccel: cursor.motionAccel
            });
        }
    }

    removeCursor(identifier) {
        const cursor = this.cursors.get(identifier);
        if (!cursor) return;

        // 发送移除消息
        if (this.isConnected) {
            this.sendMessage({
                type: 'cursor',
                action: 'remove',
                sessionId: cursor.sessionId
            });
        }

        // 移除可视化元素
        const element = document.getElementById(`cursor-${cursor.sessionId}`);
        if (element) {
            element.remove();
        }

        this.cursors.delete(identifier);
        this.updateStats();
        this.log(`移除光标 #${cursor.sessionId}`, 'info');
    }

    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    startFrameLoop() {
        // 每 33ms 发送一次帧消息（约 30 FPS）
        this.frameInterval = setInterval(() => {
            if (this.isConnected && this.cursors.size > 0) {
                this.sendMessage({ type: 'frame' });
                this.frameCounter++;
                this.totalFramesDisplay.textContent = this.frameCounter;
            }
        }, 33);
    }

    stopFrameLoop() {
        if (this.frameInterval) {
            clearInterval(this.frameInterval);
            this.frameInterval = null;
        }
    }

    reset() {
        // 移除所有光标
        const identifiers = Array.from(this.cursors.keys());
        identifiers.forEach(id => {
            const cursor = this.cursors.get(id);
            if (cursor) {
                const element = document.getElementById(`cursor-${cursor.sessionId}`);
                if (element) {
                    element.remove();
                }
            }
        });

        this.cursors.clear();
        this.sessionIdCounter = 0;
        this.frameCounter = 0;

        if (this.isConnected) {
            this.sendMessage({ type: 'reset' });
        }

        this.updateStats();
        this.log('已重置所有状态', 'info');
    }

    updateStats() {
        this.activeCursorsDisplay.textContent = this.cursors.size;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TuioWebSocketClient();
});

