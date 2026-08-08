//=============================================================================
// Custom_TextAnimation.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 自定义文本渲染动画效果插件
 * @author 图南工作室（TunanStudio）
 * @orderAfter VisuMZ_1_MessageCore
 *
 * @help Custom_TextAnimation.js
 *  使用条款：免费用于任何商业或非商业目的;允许在保留原作者信息的前提下修改代码;请在你的项目中致谢"图南工作室",谢谢！:)
 * 这个插件提供了可自定义的文本渲染动画效果，可以在游戏运行时切换不同的显示效果。
 * 
 * ============================================================================
 * 功能特性
 * ============================================================================
 * 
 * 1. 效果一：文字淡入淡出循环效果
 *    - 文字逐渐显现后逐渐消失，然后重复此过程
 * 
 * 2. 效果二：文字上下浮动效果
 *    - 文字在显示位置进行上下浮动的动画
 * 
 * 3. 实时控制功能
 *    - 可以在游戏过程中随时启用或禁用该自定义效果
 *
 * ============================================================================
 * 插件命令
 * ============================================================================
 * 
 * 本插件提供以下插件命令，可在事件编辑器中使用：
 * 
 * ● 设置文本动画模式
 *   设置当前文本动画的显示模式
 *   参数：
 *   - 模式：选择动画效果（禁用/淡入淡出/浮动跳跃）
 * 
 * ● 启用文本动画
 *   启用文本动画系统（使用当前设置的模式）
 * 
 * ● 禁用文本动画
 *   禁用文本动画系统，恢复正常文本显示
 *
 * ============================================================================
 * 脚本调用
 * ============================================================================
 * 
 * 也可以通过脚本命令来控制文本动画效果：
 * 
 * TextAnimation.setMode(mode)
 *   - mode: 0 = 禁用, 1 = 淡入淡出效果, 2 = 浮动跳跃效果
 *   - 示例: TextAnimation.setMode(1)
 * 
 * TextAnimation.enable()
 *   - 启用当前设置的动画效果
 * 
 * TextAnimation.disable()
 *   - 禁用所有动画效果
 *
 * ============================================================================
 * 按键控制
 * ============================================================================
 * 
 * 可以通过参数设置的按键来快速切换效果（默认禁用）
 *
 * @param enableKeySwitch
 * @text 启用按键切换
 * @type boolean
 * @desc 是否启用按键切换动画效果
 * @default false
 *
 * @param switchKey
 * @text 切换按键
 * @type select
 * @option Tab
 * @value tab
 * @option Shift
 * @value shift
 * @option Control
 * @value control
 * @desc 用于切换动画效果的按键
 * @default tab
 *
 * @param fadeSpeed
 * @text 淡入淡出速度
 * @type number
 * @min 1
 * @max 100
 * @desc 淡入淡出效果的速度（数值越小变化越慢，推荐 1-10）
 * @default 3
 *
 * @param fadeMinOpacity
 * @text 淡入淡出最小不透明度
 * @type number
 * @min 0
 * @max 100
 * @desc 淡入淡出效果的最小不透明度（%），避免文字完全透明
 * @default 30
 *
 * @param floatSpeed
 * @text 浮动速度
 * @type number
 * @min 1
 * @max 100
 * @desc 浮动跳跃效果的速度（数值越大越快）
 * @default 3
 *
 * @param floatHeight
 * @text 浮动高度
 * @type number
 * @min 1
 * @max 50
 * @desc 浮动跳跃效果的高度（像素）
 * @default 8
 *
 * @param defaultMode
 * @text 默认模式
 * @type select
 * @option 禁用
 * @value 0
 * @option 淡入淡出
 * @value 1
 * @option 浮动跳跃
 * @value 2
 * @desc 游戏开始时的默认动画模式
 * @default 0
 *
 * @command setMode
 * @text 设置文本动画模式
 * @desc 设置当前文本动画的显示模式
 *
 * @arg mode
 * @text 动画模式
 * @type select
 * @option 禁用
 * @value 0
 * @option 淡入淡出
 * @value 1
 * @option 浮动跳跃
 * @value 2
 * @default 0
 * @desc 选择要使用的文本动画效果
 *
 * @command enable
 * @text 启用文本动画
 * @desc 启用文本动画系统（使用当前设置的模式）
 *
 * @command disable
 * @text 禁用文本动画
 * @desc 禁用文本动画系统，恢复正常文本显示
 */

(() => {
    'use strict';

    const pluginName = 'Custom_TextAnimation';
    const parameters = PluginManager.parameters(pluginName);
    
    const enableKeySwitch = parameters['enableKeySwitch'] === 'true';
    const switchKey = parameters['switchKey'] || 'tab';
    const fadeSpeed = Number(parameters['fadeSpeed']) || 3;
    const fadeMinOpacity = Number(parameters['fadeMinOpacity']) || 30;
    const floatSpeed = Number(parameters['floatSpeed']) || 3;
    const floatHeight = Number(parameters['floatHeight']) || 8;
    const defaultMode = Number(parameters['defaultMode']) || 0;

    //=============================================================================
    // TextAnimation - 核心管理器
    //=============================================================================
    
    window.TextAnimation = {
        mode: defaultMode,  // 0: 禁用, 1: 淡入淡出, 2: 浮动跳跃
        enabled: defaultMode > 0,
        
        setMode: function(mode) {
            this.mode = Math.max(0, Math.min(2, mode));
            this.enabled = this.mode > 0;
        },
        
        enable: function() {
            this.enabled = true;
        },
        
        disable: function() {
            this.enabled = false;
        },
        
        cycleMode: function() {
            this.mode = (this.mode + 1) % 3;
            this.enabled = this.mode > 0;
        },
        
        isEnabled: function() {
            return this.enabled && this.mode > 0;
        },
        
        getMode: function() {
            return this.mode;
        }
    };

    //=============================================================================
    // Plugin Commands - 插件命令
    //=============================================================================
    
    PluginManager.registerCommand(pluginName, 'setMode', args => {
        const mode = Number(args.mode) || 0;
        TextAnimation.setMode(mode);
        
        if ($gameTemp.isPlaytest()) {
            const modeText = ['禁用', '淡入淡出', '浮动跳跃'][mode];
            console.log(`[${pluginName}] 文本动画模式已设置为: ${modeText}`);
        }
    });

    PluginManager.registerCommand(pluginName, 'enable', args => {
        TextAnimation.enable();
        
        if ($gameTemp.isPlaytest()) {
            console.log(`[${pluginName}] 文本动画已启用`);
        }
    });

    PluginManager.registerCommand(pluginName, 'disable', args => {
        TextAnimation.disable();
        
        if ($gameTemp.isPlaytest()) {
            console.log(`[${pluginName}] 文本动画已禁用`);
        }
    });

    //=============================================================================
    // Input - 按键处理
    //=============================================================================
    
    if (enableKeySwitch) {
        const _Scene_Map_update = Scene_Map.prototype.update;
        Scene_Map.prototype.update = function() {
            _Scene_Map_update.call(this);
            this.updateTextAnimationKeyInput();
        };

        Scene_Map.prototype.updateTextAnimationKeyInput = function() {
            if (Input.isTriggered(switchKey)) {
                TextAnimation.cycleMode();
                const modeText = ['禁用', '淡入淡出', '浮动跳跃'][TextAnimation.mode];
                console.log('文本动画模式: ' + modeText);
            }
        };
    }

    //=============================================================================
    // Sprite_TextCharacter - 文字精灵类
    //=============================================================================
    
    class Sprite_TextCharacter extends Sprite {
        initialize(character, x, y, width, height, textState) {
            Sprite.prototype.initialize.call(this);
            this._character = character;
            this._baseX = x;
            this._baseY = y;
            this._textWidth = width;
            this._textHeight = height;
            this._textState = textState;
            this._animationCount = Math.random() * 60; // 随机起始相位
            this._lifeTime = 0;
            
            this.createBitmap();
            this.updatePosition();
        }
        
        createBitmap() {
            // 创建一个临时画布来渲染单个字符
            const bitmap = new Bitmap(this._textWidth + 20, this._textHeight + 20);
            
            // 复制字体设置（从 contents Bitmap 中复制）
            if (this._textState && this._textState.contents) {
                const contents = this._textState.contents;
                bitmap.fontFace = contents.fontFace;
                bitmap.fontSize = contents.fontSize;
                bitmap.fontItalic = contents.fontItalic || false;
                bitmap.fontBold = contents.fontBold || false;
                bitmap.textColor = contents.textColor;
                bitmap.outlineColor = contents.outlineColor;
                bitmap.outlineWidth = contents.outlineWidth;
            }
            
            // 绘制字符（使用 Bitmap.drawText 方法）
            bitmap.drawText(this._character, 10, 0, this._textWidth, this._textHeight, 'left');
            this.bitmap = bitmap;
        }
        
        update() {
            Sprite.prototype.update.call(this);
            this._animationCount++;
            this._lifeTime++;
            this.updateAnimation();
        }
        
        updateAnimation() {
            const mode = TextAnimation.getMode();
            
            if (mode === 1) {
                // 淡入淡出效果
                this.updateFadeAnimation();
            } else if (mode === 2) {
                // 浮动跳跃效果
                this.updateFloatAnimation();
            }
        }
        
        updateFadeAnimation() {
            // 使用优化的淡入淡出算法
            // 1. 计算周期：速度参数直接影响周期长度，速度越小周期越长
            const cycleDuration = 300 / fadeSpeed; // 基础周期 300 帧，速度为 1 时周期为 300 帧（5秒）
            
            // 2. 计算当前在周期中的位置（0-1）
            const phase = (this._animationCount % cycleDuration) / cycleDuration;
            
            // 3. 使用优化的正弦波 + smoothstep 缓动函数
            let t = phase * Math.PI * 2; // 转换为弧度
            let rawOpacity = (Math.sin(t) + 1) / 2; // 0-1 范围的原始值
            
            // 4. 应用 smootherstep 缓动函数，比 smoothstep 更平滑
            // smootherstep: 6t^5 - 15t^4 + 10t^3
            const t2 = rawOpacity * rawOpacity;
            const t3 = t2 * rawOpacity;
            const t4 = t3 * rawOpacity;
            const t5 = t4 * rawOpacity;
            const smoothOpacity = 6 * t5 - 15 * t4 + 10 * t3;
            
            // 5. 限制不透明度范围，避免完全透明或过度昏暗
            const minOpacity = Math.max(0, Math.min(1, fadeMinOpacity / 100)); // 转换为 0-1 范围
            const maxOpacity = 1.0; // 最大不透明度 100%
            const opacity = minOpacity + smoothOpacity * (maxOpacity - minOpacity);
            
            // 6. 设置精灵不透明度，使用四舍五入减少额外的闪烁
            this.opacity = Math.round(opacity * 255);
        }
        
        updateFloatAnimation() {
            // 使用正弦波实现上下浮动
            const cycle = Math.PI * 2 / (60 / floatSpeed);
            const offset = Math.sin(this._animationCount * cycle) * floatHeight;
            this.y = this._baseY + offset;
        }
        
        updatePosition() {
            this.x = this._baseX - 10;
            this.y = this._baseY - 10;
        }
        
        isFinished() {
            return false; // 持续显示
        }
    }

    //=============================================================================
    // Window_Base - 重写文本渲染
    //=============================================================================
    
    const _Window_Base_initialize = Window_Base.prototype.initialize;
    Window_Base.prototype.initialize = function(rect) {
        _Window_Base_initialize.call(this, rect);
        this._textSprites = [];
    };

    const _Window_Base_destroy = Window_Base.prototype.destroy;
    Window_Base.prototype.destroy = function(options) {
        this.clearTextSprites();
        _Window_Base_destroy.call(this, options);
    };

    Window_Base.prototype.clearTextSprites = function() {
        if (this._textSprites) {
            for (const sprite of this._textSprites) {
                if (sprite && sprite.parent) {
                    sprite.parent.removeChild(sprite);
                }
                if (sprite && sprite.bitmap) {
                    sprite.bitmap.destroy();
                }
            }
            this._textSprites = [];
        }
    };

    const _Window_Base_update = Window_Base.prototype.update;
    Window_Base.prototype.update = function() {
        _Window_Base_update.call(this);
        this.updateTextSprites();
    };

    Window_Base.prototype.updateTextSprites = function() {
        if (!this._textSprites) return;
        
        // 清理已完成的精灵
        this._textSprites = this._textSprites.filter(sprite => {
            if (sprite.isFinished && sprite.isFinished()) {
                if (sprite.parent) {
                    sprite.parent.removeChild(sprite);
                }
                if (sprite.bitmap) {
                    sprite.bitmap.destroy();
                }
                return false;
            }
            return true;
        });
    };

    // 重写 flushTextState 方法以支持动画
    const _Window_Base_flushTextState = Window_Base.prototype.flushTextState;
    Window_Base.prototype.flushTextState = function(textState) {
        // 只有在动画启用且是消息窗口时才使用自定义渲染
        if (TextAnimation.isEnabled() && this instanceof Window_Message && textState.drawing) {
            // 使用动画渲染
            this.flushTextStateWithAnimation(textState);
        } else {
            // 否则使用原始方法（确保正常文本显示）
            _Window_Base_flushTextState.call(this, textState);
        }
    };

    Window_Base.prototype.flushTextStateWithAnimation = function(textState) {
        const text = textState.buffer;
        const rtl = textState.rtl;
        const width = this.textWidth(text);
        const height = textState.height;
        const x = rtl ? textState.x - width : textState.x;
        const y = textState.y;

        // 先清空底层Canvas（避免重复显示）
        if (textState.drawing && text.length > 0) {
            // 清除这个区域，为精灵渲染让路
            this.contents.clearRect(x, y, width, height);
        }

        if (text.length > 0 && text.trim() !== '') {
            // 创建文字精灵
            const sprite = new Sprite_TextCharacter(
                text, 
                x + this.padding, 
                y + this.padding, 
                width, 
                height,
                {
                    contents: this.contents
                }
            );
            
            if (!this._textSprites) {
                this._textSprites = [];
            }
            this._textSprites.push(sprite);
            
            // 添加到窗口容器
            if (!this._textSpriteContainer) {
                this._textSpriteContainer = new Sprite();
                this.addInnerChild(this._textSpriteContainer);
            }
            this._textSpriteContainer.addChild(sprite);
        }

        // 更新文本状态位置（必须保持与原始方法一致）
        textState.x += rtl ? -width : width;
        textState.buffer = this.createTextBuffer(rtl);
        
        const outputWidth = Math.abs(textState.x - textState.startX);
        if (textState.outputWidth < outputWidth) {
            textState.outputWidth = outputWidth;
        }
        textState.outputHeight = y - textState.startY + height;
    };

    // 扩展 filterArea 以防止文字特效被裁剪
    const _Window_Base_updateFilterArea = Window_Base.prototype._updateFilterArea;
    Window_Base.prototype._updateFilterArea = function() {
        _Window_Base_updateFilterArea.call(this);
        if (this._textSprites && this._textSprites.length > 0) {
            // 获取最大可能的溢出值
            // 20 是 Sprite_TextCharacter 中 bitmap 创建时的额外宽度 (左右各 10)
            const padding = 20; 
            const vPadding = padding + floatHeight; // 加上浮动高度
            
            if (this._clientArea && this._clientArea.filterArea) {
                this._clientArea.filterArea.x -= padding;
                this._clientArea.filterArea.y -= vPadding;
                this._clientArea.filterArea.width += padding * 2;
                this._clientArea.filterArea.height += vPadding * 2;
            }
        }
    };

    //=============================================================================
    // Window_Message - 消息窗口特殊处理
    //=============================================================================
    
    const _Window_Message_newPage = Window_Message.prototype.newPage;
    Window_Message.prototype.newPage = function(textState) {
        // 清理旧的文字精灵
        if (TextAnimation.isEnabled()) {
            this.clearTextSprites();
        }
        _Window_Message_newPage.call(this, textState);
    };

    const _Window_Message_terminateMessage = Window_Message.prototype.terminateMessage;
    Window_Message.prototype.terminateMessage = function() {
        // 消息结束时清理精灵
        if (TextAnimation.isEnabled()) {
            this.clearTextSprites();
        }
        _Window_Message_terminateMessage.call(this);
    };

    //=============================================================================
    // 调试信息
    //=============================================================================
    
    console.log(`${pluginName} 已加载`);
    console.log(`默认模式: ${['禁用', '淡入淡出', '浮动跳跃'][defaultMode]}`);
    if (enableKeySwitch) {
        console.log(`按键切换已启用: ${switchKey}`);
    }

})();
