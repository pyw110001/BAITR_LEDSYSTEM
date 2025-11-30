// 文字显示模块 JavaScript
class TextDisplayController {
    constructor() {
        this.text = '欢迎使用LED灯带控制系统';
        this.font = '宋体';
        this.fontSize = 3;
        this.textColor = '#00d9ff';
        this.scrollDirection = 'left-to-right';
        this.scrollSpeed = 2; // 改为数字级别 1-5
        this.stayDuration = 3;
        this.sendStatus = 'idle';
        this.animationFrame = null;
        this.position = 0;
        this.lastTime = Date.now();

        this.initializeElements();
        this.attachEventListeners();
        this.initializeColorPresets();
        this.startPreviewAnimation();
        this.updateCharCount();
    }

    initializeElements() {
        this.textInput = document.getElementById('textInput');
        this.fontSelect = document.getElementById('fontSelect');
        this.fontSizeSlider = document.getElementById('fontSizeSlider');
        this.fontSizeValue = document.getElementById('fontSizeValue');
        this.colorPicker = document.getElementById('colorPicker');
        this.colorInput = document.getElementById('colorInput');
        this.directionButtons = document.querySelectorAll('.direction-btn');
        this.speedButtons = document.querySelectorAll('.speed-btn');
        this.durationInput = document.getElementById('durationInput');
        this.durationSlider = document.getElementById('durationSlider');
        this.speedInput = document.getElementById('speedInput');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
        this.ledText = document.getElementById('ledText');
        this.ledGrid = document.getElementById('ledGrid');
        this.sendButton = document.getElementById('sendButton');
        this.backButton = document.getElementById('backButton');
        this.previewFont = document.getElementById('previewFont');
        this.previewFontSize = document.getElementById('previewFontSize');
        this.previewSpeed = document.getElementById('previewSpeed');
        this.previewColor = document.getElementById('previewColor');
        this.previewColorBox = document.getElementById('previewColorBox');
    }

    initializeColorPresets() {
        const presets = [
            '#00d9ff', '#ff0080', '#00ff88', '#ffaa00',
            '#8800ff', '#ff3333', '#ffff00', '#ffffff'
        ];

        const container = document.getElementById('colorPresets');
        presets.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'color-preset';
            if (color === this.textColor) btn.classList.add('active');
            btn.style.backgroundColor = color;
            btn.addEventListener('click', () => this.setColor(color));
            container.appendChild(btn);
        });
    }

    attachEventListeners() {
        // 文字输入
        this.textInput.addEventListener('input', (e) => {
            this.text = e.target.value;
            this.updateCharCount();
            this.updatePreview();
        });

        // 字体选择
        this.fontSelect.addEventListener('change', (e) => {
            this.font = e.target.value;
            this.updatePreview();
        });

        // 字号滑块
        this.fontSizeSlider.addEventListener('input', (e) => {
            this.fontSize = parseInt(e.target.value);
            this.fontSizeValue.textContent = this.fontSize;
            this.updatePreview();
        });

        // 颜色选择器
        this.colorPicker.addEventListener('input', (e) => {
            this.setColor(e.target.value);
        });

        // 颜色输入框
        this.colorInput.addEventListener('input', (e) => {
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                this.setColor(e.target.value);
            }
        });

        // 滚动方向
        this.directionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.directionButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.scrollDirection = btn.getAttribute('data-direction');
                this.position = 0;
                this.updatePreview();
            });
        });

        // 滚动速度
        this.speedInput.addEventListener('input', (e) => {
            const value = Math.max(1, Math.min(5, parseInt(e.target.value) || 2));
            this.scrollSpeed = value;
            this.speedSlider.value = value;
            this.speedValue.textContent = value;
            this.updatePreview();
        });

        this.speedSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.scrollSpeed = value;
            this.speedInput.value = value;
            this.speedValue.textContent = value;
            this.updatePreview();
        });

        // 停留时间
        this.durationInput.addEventListener('input', (e) => {
            this.stayDuration = parseInt(e.target.value);
            this.durationSlider.value = this.stayDuration;
        });

        this.durationSlider.addEventListener('input', (e) => {
            this.stayDuration = parseInt(e.target.value);
            this.durationInput.value = this.stayDuration;
        });

        // 发送按钮
        this.sendButton.addEventListener('click', () => this.handleSend());

        // 返回按钮过渡
        this.backButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.transitionToPage('navigation.html');
        });
    }

    setColor(color) {
        this.textColor = color;
        this.colorPicker.value = color;
        this.colorInput.value = color;
        
        // 更新预设按钮状态
        document.querySelectorAll('.color-preset').forEach(btn => {
            if (btn.style.backgroundColor === color || 
                this.rgbToHex(btn.style.backgroundColor) === color) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.updatePreview();
    }

    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return rgb;
        return '#' + match.slice(1).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
    }

    updateCharCount() {
        const count = document.getElementById('charCount');
        count.textContent = this.text.length;
    }

    updatePreview() {
        // 更新文字
        this.ledText.textContent = this.text || '请输入文字...';
        this.ledText.style.fontFamily = this.font;
        this.ledText.style.color = this.textColor;
        
        // 更新字号
        const fontSizeMap = {
            1: '1rem', 2: '1.5rem', 3: '2rem', 4: '2.5rem', 5: '3rem'
        };
        this.ledText.style.fontSize = fontSizeMap[this.fontSize];
        
        // 更新网格颜色
        this.ledGrid.style.color = this.textColor;
        
        // 更新预览信息
        this.previewFont.textContent = this.font;
        this.previewFontSize.textContent = this.fontSize;
        this.previewSpeed.textContent = `级别 ${this.scrollSpeed}`;
        this.previewColor.textContent = this.textColor;
        this.previewColorBox.style.backgroundColor = this.textColor;
    }

    startPreviewAnimation() {
        // 速度级别映射：1-5 对应不同的速度倍数（降低整体速度）
        const getSpeedMultiplier = (level) => {
            return 0.05 + (level - 1) * 0.08; // 1级=0.05, 2级=0.13, 3级=0.21, 4级=0.29, 5级=0.37
        };

        const animate = () => {
            const now = Date.now();
            const delta = now - this.lastTime;
            this.lastTime = now;

            const speed = getSpeedMultiplier(this.scrollSpeed);
            const container = document.getElementById('ledPreview');
            const textEl = this.ledText;

            if (container && textEl) {
                const containerWidth = container.offsetWidth;
                const containerHeight = container.offsetHeight;
                const textWidth = textEl.offsetWidth;
                const textHeight = textEl.offsetHeight;

                this.position += delta * speed;

                if (this.scrollDirection === 'left-to-right') {
                    if (this.position > containerWidth + textWidth) {
                        this.position = -textWidth;
                    }
                    textEl.style.transform = `translateY(-50%) translateX(${this.position}px)`;
                    textEl.style.left = '0';
                    textEl.style.top = '50%';
                } else if (this.scrollDirection === 'right-to-left') {
                    if (this.position > containerWidth + textWidth) {
                        this.position = -textWidth;
                    }
                    textEl.style.transform = `translateY(-50%) translateX(${-this.position}px)`;
                    textEl.style.left = '0';
                    textEl.style.top = '50%';
                } else if (this.scrollDirection === 'top-to-bottom') {
                    if (this.position > containerHeight + textHeight) {
                        this.position = -textHeight;
                    }
                    textEl.style.transform = `translateX(-50%) translateY(${this.position}px)`;
                    textEl.style.left = '50%';
                    textEl.style.top = '0';
                }
            }

            this.animationFrame = requestAnimationFrame(animate);
        };

        this.animationFrame = requestAnimationFrame(animate);
    }

    handleSend() {
        this.sendStatus = 'sending';
        this.sendButton.disabled = true;
        this.sendButton.classList.add('sending');
        this.sendButton.innerHTML = '<div class="spinner"></div><span>发送中...</span>';

        // 模拟发送
        setTimeout(() => {
            if (Math.random() > 0.1) {
                // 成功
                this.sendStatus = 'success';
                this.sendButton.classList.remove('sending');
                this.sendButton.classList.add('success');
                this.sendButton.innerHTML = '<span>✓ 发送成功</span>';
                
                setTimeout(() => {
                    this.sendStatus = 'idle';
                    this.sendButton.disabled = false;
                    this.sendButton.classList.remove('success');
                    this.sendButton.innerHTML = '<span>发送到LED灯带</span>';
                }, 2000);
            } else {
                // 失败
                this.sendStatus = 'error';
                this.sendButton.classList.remove('sending');
                this.sendButton.classList.add('error');
                this.sendButton.innerHTML = '<span>✗ 发送失败</span>';
                
                setTimeout(() => {
                    this.sendStatus = 'idle';
                    this.sendButton.disabled = false;
                    this.sendButton.classList.remove('error');
                    this.sendButton.innerHTML = '<span>发送到LED灯带</span>';
                }, 3000);
            }
        }, 1500);
    }

    transitionToPage(url) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #0a1628; z-index: 9999; opacity: 0; transition: opacity 0.4s ease;';
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            window.location.href = url;
        }, 400);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new TextDisplayController();
});

