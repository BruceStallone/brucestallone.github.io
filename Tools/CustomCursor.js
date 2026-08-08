/*:
 * @target MZ
 * @plugindesc 简单的自定义鼠标图案插件
 * @author 图南工作室（TunanStudio）
 * 
 *  * @help
 * * 使用说明：
 * 1.用于自定义鼠标图案（PNG格式）
 * 2.默认目录为：img/system/
 * * 使用条款：免费用于任何商业或非商业目的;允许在保留原作者信息的前提下修改代码;请在你的项目中致谢"图南工作室",谢谢！:)
 * 
 * @param defaultCursor
 * @text 默认光标
 * @desc 替换默认鼠标光标的图像文件名（不需要扩展名）
 * @default cursor
 * 
 * @param clickCursor
 * @text 点击时光标
 * @desc 鼠标点击时光标的图像文件名（不需要扩展名）
 * @default cursor_click
 * @parent defaultCursor
 * 
 * @param cursorHotspotX
 * @text 光标热点X坐标
 * @desc 光标热点X坐标（点击生效位置）
 * @type number
 * @min 0
 * @default 0
 * @parent defaultCursor
 * 
 * @param cursorHotspotY
 * @text 光标热点Y坐标
 * @desc 光标热点Y坐标（点击生效位置）
 * @type number
 * @min 0
 * @default 0
 * @parent defaultCursor
 * 
 * @param hideSystemCursor
 * @text 隐藏系统光标
 * @desc 是否隐藏系统默认光标
 * @type boolean
 * @default true
 */

(function() {
    // 获取插件参数
    const parameters = PluginManager.parameters('CustomCursor');
    const defaultCursor = parameters['defaultCursor'] || 'cursor';
    const clickCursor = parameters['clickCursor'] || 'cursor_click';
    const cursorHotspotX = Number(parameters['cursorHotspotX']) || 0;
    const cursorHotspotY = Number(parameters['cursorHotspotY']) || 0;
    const hideSystemCursor = parameters['hideSystemCursor'] === 'true';
    
    // 存储当前是否正在点击
    let isClicking = false;
    
    // 缓存光标样式字符串
    const cursorStyles = {};
    
    // 确保document和body存在
    const isDocumentAvailable = () => {
        return typeof document !== 'undefined' && document.body;
    };
    
    // 设置光标样式的函数
    const setCursorStyle = (cursorName, x, y) => {
        if (!isDocumentAvailable()) return;
        
        try {
            // 构建路径（不使用./或/前缀，让系统自动处理）
            const path = `img/system/${cursorName}.png`;
            
            // 尝试设置光标样式
            if (hideSystemCursor) {
                document.body.style.cursor = `url("${path}") ${x} ${y}, none`;
            } else {
                document.body.style.cursor = `url("${path}") ${x} ${y}, auto`;
            }
        } catch (e) {
            console.error('设置光标样式失败:', e);
            // 失败时回退到默认光标
            document.body.style.cursor = hideSystemCursor ? 'none' : 'auto';
        }
    };
    
    // 根据点击状态更新光标
    const updateCursor = () => {
        const cursorName = isClicking ? clickCursor : defaultCursor;
        setCursorStyle(cursorName, cursorHotspotX, cursorHotspotY);
    };
    
    // 监听鼠标事件
    const setupEventListeners = () => {
        if (!isDocumentAvailable()) return;
        
        // 鼠标按下时切换到点击光标
        document.addEventListener('mousedown', function(event) {
            if (event.button === 0) { // 左键点击
                isClicking = true;
                updateCursor();
            }
        });
        
        // 鼠标释放时切换回默认光标
        document.addEventListener('mouseup', function(event) {
            if (event.button === 0) { // 左键释放
                isClicking = false;
                updateCursor();
            }
        });
    };
    
    // 在游戏启动时设置光标
    const _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        _Scene_Boot_start.call(this);
        setupEventListeners();
        updateCursor();
    };
    
    // 在场景切换时重新应用光标（避免场景切换导致光标重置）
    const _SceneManager_changeScene = SceneManager.changeScene;
    SceneManager.changeScene = function() {
        _SceneManager_changeScene.call(this);
        // 延迟一帧更新光标，确保场景已经切换完成
        setTimeout(updateCursor, 0);
    };
    
    // 导出插件命令（可选功能）
    PluginManager.registerCommand('CustomCursor', 'setCursor', function(args) {
        const cursorName = args.cursorName || defaultCursor;
        const x = Number(args.x) || cursorHotspotX;
        const y = Number(args.y) || cursorHotspotY;
        setCursorStyle(cursorName, x, y);
    });
    
    // 预加载光标图像
    const _Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
    Scene_Boot.prototype.onDatabaseLoaded = function() {
        _Scene_Boot_onDatabaseLoaded.call(this);
        
        // 使用ImageManager预加载图像，确保它们在需要时可用
        if (defaultCursor) {
            ImageManager.loadSystem(defaultCursor);
        }
        if (clickCursor) {
            ImageManager.loadSystem(clickCursor);
        }
    };
    
})();