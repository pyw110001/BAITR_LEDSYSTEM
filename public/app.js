/**
 * TUIO WebSocket Client
 * 处理触摸事件并发送到 WebSocket 服务器
 */
class TuioWebSocketClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.mode = 'send'; // 'send' 或 'receive'
        this.cursors = new Map(); // sessionId -> {x, y, element}
        this.sessionIdCounter = 0;
        this.frameCounter = 0;
        this.frameInterval = null;

        this.initializeElements();
        this.attachEventListeners();
        this.updateModeUI();
        this.log('TUIO 客户端已启动', 'info');
    }

    initializeElements() {
        this.modeSendBtn = document.getElementById('modeSend');
        this.modeReceiveBtn = document.getElementById('modeReceive');
        this.modeDescription = document.getElementById('modeDescription');
        this.wsUrlInput = document.getElementById('wsUrl');
        this.wsUrlGroup = document.getElementById('wsUrlGroup');
        this.udpHostInput = document.getElementById('udpHost');
        this.udpPortInput = document.getElementById('udpPort');
        this.udpTargetGroup = document.getElementById('udpTargetGroup');
        this.udpPortGroup = document.getElementById('udpPortGroup');
        this.tuioHostInput = document.getElementById('tuioHost');
        this.tuioPortInput = document.getElementById('tuioPort');
        this.tuioHostGroup = document.getElementById('tuioHostGroup');
        this.tuioPortGroup = document.getElementById('tuioPortGroup');
        this.connectBtn = document.getElementById('connectBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.touchArea = document.getElementById('touchArea');
        this.wsStatus = document.getElementById('wsStatus');
        this.wsStatusText = document.getElementById('wsStatusText');
        this.udpTarget = document.getElementById('udpTarget');
        this.logArea = document.getElementById('logArea');
        this.activeCursorsDisplay = document.getElementById('activeCursors');
        this.totalFramesDisplay = document.getElementById('totalFrames');

        // 获取本机IP地址
        this.updateLocalIP();
    }

    async updateLocalIP() {
        try {
            // 尝试通过WebRTC获取本地IP
            const pc = new RTCPeerConnection({ iceServers: [] });
            pc.createDataChannel('');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    const candidate = event.candidate.candidate;
                    const match = candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
                    if (match && !match[0].startsWith('127.')) {
                        this.tuioHostInput.value = match[0];
                        pc.close();
                    }
                }
            };

            // 超时处理
            setTimeout(() => {
                pc.close();
            }, 1000);
        } catch (error) {
            console.log('无法自动获取IP，使用默认值');
        }
    }

    attachEventListeners() {
        // 模式切换
        this.modeSendBtn.addEventListener('click', () => this.setMode('send'));
        this.modeReceiveBtn.addEventListener('click', () => this.setMode('receive'));

        this.connectBtn.addEventListener('click', () => this.toggleConnection());
        this.resetBtn.addEventListener('click', () => this.reset());

        // 触摸区域事件（仅在发送模式下启用）
        this.touchArea.addEventListener('mousedown', (e) => {
            if (this.mode === 'send') this.handlePointerStart(e);
        });
        this.touchArea.addEventListener('touchstart', (e) => {
            if (this.mode === 'send') this.handleTouchStart(e);
        });

        // 全局事件（用于跟踪移动和结束）
        document.addEventListener('mousemove', (e) => {
            if (this.mode === 'send') this.handlePointerMove(e);
        });
        document.addEventListener('mouseup', (e) => {
            if (this.mode === 'send') this.handlePointerEnd(e);
        });
        document.addEventListener('touchmove', (e) => {
            if (this.mode === 'send') this.handleTouchMove(e);
        });
        document.addEventListener('touchend', (e) => {
            if (this.mode === 'send') this.handleTouchEnd(e);
        });
        document.addEventListener('touchcancel', (e) => {
            if (this.mode === 'send') this.handleTouchEnd(e);
        });
    }

    setMode(mode) {
        if (this.isConnected) {
            this.log('请先断开连接再切换模式', 'warn');
            // 自动断开连接
            this.disconnect();
        }
        this.mode = mode;
        this.updateModeUI();
        this.reset();
        this.log(`已切换到${mode === 'send' ? '发送' : '接收'}模式`, 'info');
    }

    updateModeUI() {
        if (this.mode === 'send') {
            this.modeSendBtn.classList.add('active');
            this.modeReceiveBtn.classList.remove('active');
            this.modeDescription.textContent = '发送模式：前端触摸 → WebSocket → UDP/OSC';
            // 显示发送模式相关配置
            this.wsUrlGroup.style.display = 'flex';
            this.udpTargetGroup.style.display = 'flex';
            this.udpPortGroup.style.display = 'flex';
            // 隐藏接收模式相关配置
            this.tuioHostGroup.style.display = 'none';
            this.tuioPortGroup.style.display = 'none';
            this.touchArea.style.pointerEvents = 'auto';
            // 更新触摸区域提示
            const hint = this.touchArea.querySelector('div[style*="position: absolute"]');
            if (hint) {
                hint.textContent = '在此区域进行触摸/点击操作';
                hint.style.color = '#666';
            }
        } else {
            this.modeSendBtn.classList.remove('active');
            this.modeReceiveBtn.classList.add('active');
            this.modeDescription.textContent = '接收模式：手机TUIOpad → TCP/UDP → WebSocket → 前端显示';
            // 隐藏发送模式相关配置
            this.wsUrlGroup.style.display = 'none';
            this.udpTargetGroup.style.display = 'none';
            this.udpPortGroup.style.display = 'none';
            // 显示接收模式相关配置
            this.tuioHostGroup.style.display = 'flex';
            this.tuioPortGroup.style.display = 'flex';
            this.touchArea.style.pointerEvents = 'none';
            // 更新触摸区域提示
            const hint = this.touchArea.querySelector('div[style*="position: absolute"]');
            if (hint) {
                hint.textContent = '等待接收来自手机TUIOpad的触摸信号...';
                hint.style.color = '#00ff88';
            }
        }
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
        // 自动检测主机名，优化打包环境连接
        const hostname = window.location.hostname || 'localhost';
        const wsUrl = this.mode === 'receive' ? `ws://${hostname}:8080` : this.wsUrlInput.value.trim();

        if (this.mode === 'receive') {
            this.log(`正在连接到 WebSocket 服务器 (${wsUrl})...`, 'info');
        } else {
            if (!wsUrl) {
                this.log('请输入 WebSocket 服务器地址', 'error');
                return;
            }
        }

        try {
            this.ws = new WebSocket(wsUrl);

            // 设置连接超时
            const connectTimeout = setTimeout(() => {
                if (!this.isConnected && this.ws.readyState === WebSocket.CONNECTING) {
                    this.ws.close();
                    this.log('连接超时：无法连接到WebSocket服务器', 'error');
                    this.log('请检查：1. 服务器是否已启动 (运行 pnpm start) 2. 端口8080是否被占用', 'error');
                }
            }, 5000);

            this.ws.onopen = () => {
                clearTimeout(connectTimeout);
                this.isConnected = true;
                this.updateConnectionStatus(true);
                if (this.mode === 'receive') {
                    this.log('✓ WebSocket 连接成功，等待接收来自手机TUIOpad的消息...', 'info');
                    this.log(`请在手机TUIOpad中配置：Host=${this.tuioHostInput.value}, Port=${this.tuioPortInput.value}`, 'info');
                } else {
                    this.log('WebSocket 连接成功', 'info');
                }
                this.startFrameLoop();
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('[前端] 收到WebSocket消息:', message);

                    if (this.mode === 'receive' && message.source === 'tuio-app') {
                        // 接收模式：处理来自TUIO app的消息
                        console.log('[前端] 处理TUIO app消息:', message.type, message.action);
                        this.handleServerMessage(message);
                    } else if (this.mode === 'send') {
                        // 发送模式：记录服务器响应
                        this.log(`收到消息: ${event.data}`, 'info');
                    } else {
                        console.log('[前端] 忽略消息 (模式不匹配):', message);
                    }
                } catch (error) {
                    console.error('[前端] 解析消息失败:', error, event.data);
                    if (this.mode === 'receive') {
                        // 接收模式下，非JSON消息可能是调试信息
                        console.log('收到非JSON消息:', event.data);
                    } else {
                        this.log(`收到消息: ${event.data}`, 'info');
                    }
                }
            };

            this.ws.onerror = (error) => {
                clearTimeout(connectTimeout);
                this.log('WebSocket 连接错误', 'error');
                this.log('可能原因：服务器未启动或端口被占用', 'error');
                console.error('WebSocket error:', error);
            };

            this.ws.onclose = (event) => {
                clearTimeout(connectTimeout);
                this.isConnected = false;
                this.updateConnectionStatus(false);
                if (event.code !== 1000) {
                    // 非正常关闭
                    this.log('WebSocket 连接已关闭', 'warn');
                    if (this.mode === 'receive') {
                        this.log('提示：请运行 pnpm start 启动服务器', 'warn');
                    }
                } else {
                    this.log('WebSocket 连接已关闭', 'warn');
                }
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
        // 每 33ms 发送一次帧消息（约 30 FPS）- 仅在发送模式下
        this.frameInterval = setInterval(() => {
            if (this.mode === 'send' && this.isConnected && this.cursors.size > 0) {
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

    /**
     * 处理来自服务器的TUIO消息（来自手机TUIOpad）
     */
    handleServerMessage(message) {
        console.log('[前端] handleServerMessage:', message);
        switch (message.type) {
            case 'cursor':
                console.log('[前端] 处理cursor消息');
                this.handleServerCursor(message);
                break;
            case 'object':
                console.log('[前端] 处理object消息');
                this.handleServerObject(message);
                break;
            case 'blob':
                console.log('[前端] 处理blob消息');
                this.handleServerBlob(message);
                break;
            default:
                console.warn('[前端] 未知消息类型:', message.type);
                this.log(`收到未知消息类型: ${message.type}`, 'warn');
        }
    }

    /**
     * 处理来自服务器的光标消息
     */
    handleServerCursor(message) {
        const { action, sessionId, x, y, xSpeed, ySpeed, motionAccel } = message;
        const rect = this.touchArea.getBoundingClientRect();

        // 将归一化坐标转换为像素坐标
        const rawX = x * rect.width;
        const rawY = y * rect.height;

        if (action === 'add' || action === 'update') {
            // 查找或创建光标
            let cursor = null;
            let identifier = null;

            // 通过sessionId查找现有的光标
            for (const [id, c] of this.cursors.entries()) {
                if (c.sessionId === sessionId) {
                    cursor = c;
                    identifier = id;
                    break;
                }
            }

            if (!cursor) {
                // 创建新光标
                identifier = `tuio-${sessionId}`;
                cursor = {
                    sessionId,
                    x,
                    y,
                    xSpeed: xSpeed || 0,
                    ySpeed: ySpeed || 0,
                    motionAccel: motionAccel || 0,
                    lastX: x,
                    lastY: y,
                    lastTime: Date.now()
                };
                this.cursors.set(identifier, cursor);

                // 创建可视化元素（红色表示来自TUIO app）
                const element = document.createElement('div');
                element.className = 'touch-point';
                element.style.left = `${rawX}px`;
                element.style.top = `${rawY}px`;
                element.textContent = sessionId;
                element.id = `cursor-${sessionId}`;
                element.style.background = 'radial-gradient(circle, rgba(255, 107, 107, 0.4) 0%, rgba(255, 0, 0, 0.3) 100%)';
                element.style.borderColor = '#ff6b6b';
                element.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.6), 0 4px 12px rgba(0, 0, 0, 0.4)';
                this.touchArea.appendChild(element);

                this.log(`[TUIO App] 添加光标 #${sessionId} at (${x.toFixed(3)}, ${y.toFixed(3)})`, 'info');
            } else {
                // 更新现有光标
                cursor.x = x;
                cursor.y = y;
                cursor.xSpeed = xSpeed || 0;
                cursor.ySpeed = ySpeed || 0;
                cursor.motionAccel = motionAccel || 0;

                // 更新可视化元素
                const element = document.getElementById(`cursor-${sessionId}`);
                if (element) {
                    element.style.left = `${rawX}px`;
                    element.style.top = `${rawY}px`;
                }
            }
        } else if (action === 'remove') {
            // 移除光标
            let identifier = null;
            for (const [id, c] of this.cursors.entries()) {
                if (c.sessionId === sessionId) {
                    identifier = id;
                    break;
                }
            }

            if (identifier) {
                const cursor = this.cursors.get(identifier);
                if (cursor) {
                    const element = document.getElementById(`cursor-${sessionId}`);
                    if (element) {
                        element.remove();
                    }
                    this.cursors.delete(identifier);
                    this.log(`[TUIO App] 移除光标 #${sessionId}`, 'info');
                }
            }
        }

        this.updateStats();
    }

    /**
     * 处理来自服务器的对象消息
     */
    handleServerObject(message) {
        this.log(`[TUIO App] 对象消息: ${message.action} #${message.sessionId}`, 'info');
    }

    /**
     * 处理来自服务器的Blob消息
     */
    handleServerBlob(message) {
        this.log(`[TUIO App] Blob消息: ${message.action} #${message.sessionId}`, 'info');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TuioWebSocketClient();

    // 页面加载动画
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

