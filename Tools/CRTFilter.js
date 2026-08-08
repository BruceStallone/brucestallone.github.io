/*:
 * @target     RMMZ
 * @plugindesc v1.1 为游戏画面添加老式CRT显示器的视觉效果滤镜。
 * @author     图南工作室（TunanStudio）
 *
 * @help
 * * 使用说明：
 * 1、设置好插件参数,并确保激活CRT滤镜,进入游戏场景后自动生效。
 * 2、可在任意事件中调用"更改(激活)CRT滤镜"插件指令来更改滤镜数据,若滤镜效
 * 果已禁用,则激活。
 * 3、可在任意事件中调用"禁用CRT滤镜",以禁用滤镜效果。
 *
 * * CRT效果说明：
 * - 扫描线(LineWidth/LineContrast): 模拟CRT显示器的水平/垂直扫描线效果,通过调整线宽(0~10)和对比度(0~1)来控制扫描线的粗细和明显程度
 * - 屏幕曲率(Curvature): 模拟CRT显示器的屏幕弯曲效果,参数范围0~3,数值越大屏幕边缘越向内凹陷弯曲,0为完全平面
 * - 噪点(Noise/NoiseSize): 模拟CRT显示器产生的电子噪点效果,通过强度(0~1)和尺寸(0~10)来控制噪点的密集程度和大小
 * - 暗角(Vignetting/VignettingAlpha/VignettingBlur): 模拟CRT屏幕边缘变暗的效果,通过半径(0~1)、不透明度(0~1)和模糊度(0~1)来调整边缘暗化的范围、深度和过渡效果
 * - 磷光余辉(PhosphorGlow): 模拟CRT磷光材料的光晕扩散特性,当画面亮区超过阈值时会产生向外扩散的柔和光晕效果,参数范围0~1,数值越大光晕越明显,0为禁用此效果
 *
 * * 使用条款：免费用于任何商业或非商业目的;允许在保留原作者信息的前提下修改代码;请在你的项目中致谢"图南工作室",谢谢！:)
 *
 * * 更新日志：
 * -- 20241109 v1.1
 *     新增磷光余辉(Phosphor Glow)效果,模拟CRT磷光材料的光晕扩散特性。
 * -- 20241109 v1.0
 *     实现插件基本功能。
 *
 * * 致谢说明：
 * 本插件使用了PixiJS Filters库代码,非常感谢原作者！
 * 本插件参考了2D_猫的2D_Cat_OldFilmFilter，感谢2D_猫。
 *
 * @param   isCRTEnabled
 * @text    是否激活CRT滤镜
 * @type    boolean
 * @default true
 *
 * @param   crtCurvature
 * @text    屏幕曲率强度
 * @type    string
 * @default 1.01
 * @desc    0~3之间的实数,越大屏幕越弯曲,反之越平坦。0为完全平坦。
 *
 * @param   crtLineWidth
 * @text    扫描线宽度
 * @type    string
 * @default 1.0
 * @desc    0~10的实数,越大扫描线越宽,反之越细。
 *
 * @param   crtLineContrast
 * @text    扫描线对比度
 * @type    string
 * @default 0.25
 * @desc    0~1之间的实数,越大扫描线越明显,反之越不明显。
 *
 * @param   crtVerticalLine
 * @text    垂直扫描线
 * @type    boolean
 * @default false
 * @desc    true为垂直扫描线,false为水平扫描线。
 *
 * @param   crtNoise
 * @text    噪点强度
 * @type    string
 * @default 0.0
 * @desc    0~1之间的实数,越大噪点越明显,反之越不明显。
 *
 * @param   crtNoiseSize
 * @text    噪点尺寸
 * @type    string
 * @default 1.0
 * @desc    0~10的实数,越大噪点尺寸越大,反之越小。
 *
 * @param   crtVignetting
 * @text    暗角半径
 * @type    string
 * @default 0.3
 * @desc    0~1之间的实数,越大边缘暗角越多,反之越少。
 *
 * @param   crtVignettingAlpha
 * @text    暗角不透明度
 * @type    string
 * @default 1.0
 * @desc    0~1之间的实数,越大暗角越不透明,反之越透明。
 *
 * @param   crtVignettingBlur
 * @text    暗角模糊度
 * @type    string
 * @default 0.3
 * @desc    0~1之间的实数,越大暗角边缘越模糊,反之越清晰。
 *
 * @param   crtPhosphorGlow
 * @text    磷光余辉强度
 * @type    string
 * @default 0.3
 * @desc    0~1之间的实数,越大亮区光晕越明显,反之越不明显。0为禁用。
 *
 * @param   isEffectOnMsgWin
 * @text    消息窗口是否被滤镜影响
 * @type    boolean
 * @default false
 *
 * @command changeCRTFilter
 * @text    更改(激活)CRT滤镜
 *
 * @arg     newCRTCurvature
 * @text    屏幕曲率强度
 * @type    string
 * @default 1.0
 * @desc    0~3之间的实数,越大屏幕越弯曲,反之越平坦。
 *
 * @arg     newCRTLineWidth
 * @text    扫描线宽度
 * @type    string
 * @default 1.0
 * @desc    0~10的实数,越大扫描线越宽,反之越细。
 *
 * @arg     newCRTLineContrast
 * @text    扫描线对比度
 * @type    string
 * @default 0.25
 * @desc    0~1之间的实数,越大扫描线越明显,反之越不明显。
 *
 * @arg     newCRTVerticalLine
 * @text    垂直扫描线
 * @type    boolean
 * @default false
 * @desc    true为垂直扫描线,false为水平扫描线。
 *
 * @arg     newCRTNoise
 * @text    噪点强度
 * @type    string
 * @default 0.0
 * @desc    0~1之间的实数,越大噪点越明显,反之越不明显。
 *
 * @arg     newCRTNoiseSize
 * @text    噪点尺寸
 * @type    string
 * @default 1.0
 * @desc    0~10的实数,越大噪点尺寸越大,反之越小。
 *
 * @arg     newCRTVignetting
 * @text    暗角半径
 * @type    string
 * @default 0.3
 * @desc    0~1之间的实数,越大边缘暗角越多,反之越少。
 *
 * @arg     newCRTVignettingAlpha
 * @text    暗角不透明度
 * @type    string
 * @default 1.0
 * @desc    0~1之间的实数,越大暗角越不透明,反之越透明。
 *
 * @arg     newCRTVignettingBlur
 * @text    暗角模糊度
 * @type    string
 * @default 0.3
 * @desc    0~1之间的实数,越大暗角边缘越模糊,反之越清晰。
 *
 * @arg     newCRTPhosphorGlow
 * @text    磷光余辉强度
 * @type    string
 * @default 0.3
 * @desc    0~1之间的实数,越大亮区光晕越明显,反之越不明显。
 *
 * @command disableCRTFilter
 * @text    禁用CRT滤镜
 */

if (!__filters) {
    /*********************************************************************
     * 下方代码为PixiJS Filters库代码。https://github.com/pixijs/filters *
     *********************************************************************/

    /*!
    * pixi-filters - v4.1.4
    * Compiled Thu, 22 Jul 2021 21:37:37 UTC
    *
    * pixi-filters is licensed under the MIT License.
    * http://www.opensource.org/licenses/mit-license
    */
    var __filters=function(e,n,t,r,o,i,l,a){"use strict";var s=function(e,n){return(s=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,n){e.__proto__=n}||function(e,n){for(var t in n)Object.prototype.hasOwnProperty.call(n,t)&&(e[t]=n[t])})(e,n)};function u(e,n){function t(){this.constructor=e}s(e,n),e.prototype=null===n?Object.create(n):(t.prototype=n.prototype,new t)}var f=function(){return(f=Object.assign||function(e){for(var n,t=arguments,r=1,o=arguments.length;r<o;r++)for(var i in n=t[r])Object.prototype.hasOwnProperty.call(n,i)&&(e[i]=n[i]);return e}).apply(this,arguments)};Object.create;Object.create;var c="attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}",m=function(e){function n(n){var t=e.call(this,c,"varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform float gamma;\nuniform float contrast;\nuniform float saturation;\nuniform float brightness;\nuniform float red;\nuniform float green;\nuniform float blue;\nuniform float alpha;\n\nvoid main(void)\n{\n    vec4 c = texture2D(uSampler, vTextureCoord);\n\n    if (c.a > 0.0) {\n        c.rgb /= c.a;\n\n        vec3 rgb = pow(c.rgb, vec3(1. / gamma));\n        rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, saturation), contrast);\n        rgb.r *= red;\n        rgb.g *= green;\n        rgb.b *= blue;\n        c.rgb = rgb * brightness;\n\n        c.rgb *= c.a;\n    }\n\n    gl_FragColor = c * alpha;\n}\n")||this;return t.gamma=1,t.saturation=1,t.contrast=1,t.brightness=1,t.red=1,t.green=1,t.blue=1,t.alpha=1,Object.assign(t,n),t}return u(n,e),n.prototype.apply=function(e,n,t,r){this.uniforms.gamma=Math.max(this.gamma,1e-4),this.uniforms.saturation=this.saturation,this.uniforms.contrast=this.contrast,this.uniforms.brightness=this.brightness,this.uniforms.red=this.red,this.uniforms.green=this.green,this.uniforms.blue=this.blue,this.uniforms.alpha=this.alpha,e.applyFilter(this,n,t,r)},n}(n.Filter),p=function(e){function n(n){void 0===n&&(n=.5);var t=e.call(this,c,"\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\n\nuniform float threshold;\n\nvoid main() {\n    vec4 color = texture2D(uSampler, vTextureCoord);\n\n    // A simple & fast algorithm for getting brightness.\n    // It's inaccuracy , but good enought for this feature.\n    float _max = max(max(color.r, color.g), color.b);\n    float _min = min(min(color.r, color.g), color.b);\n    float brightness = (_max + _min) * 0.5;\n\n    if(brightness > threshold) {\n        gl_FragColor = color;\n    } else {\n        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);\n    }\n}\n")||this;return t.threshold=n,t}return u(n,e),Object.defineProperty(n.prototype,"threshold",{get:function(){return this.uniforms.threshold},set:function(e){this.uniforms.threshold=e},enumerable:!1,configurable:!0}),n}(n.Filter),d=function(e){function n(n,r,o){void 0===n&&(n=4),void 0===r&&(r=3),void 0===o&&(o=!1);var i=e.call(this,c,o?"\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec2 uOffset;\nuniform vec4 filterClamp;\n\nvoid main(void)\n{\n    vec4 color = vec4(0.0);\n\n    // Sample top left pixel\n    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y), filterClamp.xy, filterClamp.zw));\n\n    // Sample top right pixel\n    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y), filterClamp.xy, filterClamp.zw));\n\n    // Sample bottom right pixel\n    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y), filterClamp.xy, filterClamp.zw));\n\n    // Sample bottom left pixel\n    color += texture2D(uSampler, clamp(vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y), filterClamp.xy, filterClamp.zw));\n\n    // Average\n    color *= 0.25;\n\n    gl_FragColor = color;\n}\n":"\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec2 uOffset;\n\nvoid main(void)\n{\n    vec4 color = vec4(0.0);\n\n    // Sample top left pixel\n    color += texture2D(uSampler, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y));\n\n    // Sample top right pixel\n    color += texture2D(uSampler, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y));\n\n    // Sample bottom right pixel\n    color += texture2D(uSampler, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y));\n\n    // Sample bottom left pixel\n    color += texture2D(uSampler, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y));\n\n    // Average\n    color *= 0.25;\n\n    gl_FragColor = color;\n}")||this;return i._kernels=[],i._blur=4,i._quality=3,i.uniforms.uOffset=new Float32Array(2),i._pixelSize=new t.Point,i.pixelSize=1,i._clamp=o,Array.isArray(n)?i.kernels=n:(i._blur=n,i.quality=r),i}return u(n,e),n.prototype.apply=function(e,n,t,r){var o,i=this._pixelSize.x/n._frame.width,l=this._pixelSize.y/n._frame.height;if(1===this._quality||0===this._blur)o=this._kernels[0]+.5,this.uniforms.uOffset[0]=o*i,this.uniforms.uOffset[1]=o*l,e.applyFilter(this,n,t,r);else{for(var a=e.getFilterTexture(),s=n,u=a,f=void 0,c=this._quality-1,m=0;m<c;m++)o=this._kernels[m]+.5,this.uniforms.uOffset[0]=o*i,this.uniforms.uOffset[1]=o*l,e.applyFilter(this,s,u,1),f=s,s=u,u=f;o=this._kernels[c]+.5,this.uniforms.uOffset[0]=o*i,this.uniforms.uOffset[1]=o*l,e.applyFilter(this,s,t,r),e.returnFilterTexture(a)}},n.prototype._updatePadding=function(){this.padding=Math.ceil(this._kernels.reduce((function(e,n){return e+n+.5}),0))},n.prototype._generateKernels=function(){var e=this._blur,n=this._quality,t=[e];if(e>0)for(var r=e,o=e/n,i=1;i<n;i++)r-=o,t.push(r);this._kernels=t,this._updatePadding()},Object.defineProperty(n.prototype,"kernels",{get:function(){return this._kernels},set:function(e){Array.isArray(e)&&e.length>0?(this._kernels=e,this._quality=e.length,this._blur=Math.max.apply(Math,e)):(this._kernels=[0],this._quality=1)},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"clamp",{get:function(){return this._clamp},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"pixelSize",{get:function(){return this._pixelSize},set:function(e){"number"==typeof e?(this._pixelSize.x=e,this._pixelSize.y=e):Array.isArray(e)?(this._pixelSize.x=e[0],this._pixelSize.y=e[1]):e instanceof t.Point?(this._pixelSize.x=e.x,this._pixelSize.y=e.y):(this._pixelSize.x=1,this._pixelSize.y=1)},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"quality",{get:function(){return this._quality},set:function(e){this._quality=Math.max(1,Math.round(e)),this._generateKernels()},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"blur",{get:function(){return this._blur},set:function(e){this._blur=e,this._generateKernels()},enumerable:!1,configurable:!0}),n}(n.Filter),h=function(e){function n(t){var o=e.call(this,c,"uniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\n\nuniform sampler2D bloomTexture;\nuniform float bloomScale;\nuniform float brightness;\n\nvoid main() {\n    vec4 color = texture2D(uSampler, vTextureCoord);\n    color.rgb *= brightness;\n    vec4 bloomColor = vec4(texture2D(bloomTexture, vTextureCoord).rgb, 0.0);\n    bloomColor.rgb *= bloomScale;\n    gl_FragColor = color + bloomColor;\n}\n")||this;o.bloomScale=1,o.brightness=1,o._resolution=r.settings.FILTER_RESOLUTION,"number"==typeof t&&(t={threshold:t});var i=Object.assign(n.defaults,t);o.bloomScale=i.bloomScale,o.brightness=i.brightness;var l=i.kernels,a=i.blur,s=i.quality,u=i.pixelSize,f=i.resolution;return o._extractFilter=new p(i.threshold),o._extractFilter.resolution=f,o._blurFilter=l?new d(l):new d(a,s),o.pixelSize=u,o.resolution=f,o}return u(n,e),n.prototype.apply=function(e,n,t,r,o){var i=e.getFilterTexture();this._extractFilter.apply(e,n,i,1,o);var l=e.getFilterTexture();this._blurFilter.apply(e,i,l,1),this.uniforms.bloomScale=this.bloomScale,this.uniforms.brightness=this.brightness,this.uniforms.bloomTexture=l,e.applyFilter(this,n,t,r),e.returnFilterTexture(l),e.returnFilterTexture(i)},Object.defineProperty(n.prototype,"resolution",{get:function(){return this._resolution},set:function(e){this._resolution=e,this._extractFilter&&(this._extractFilter.resolution=e),this._blurFilter&&(this._blurFilter.resolution=e)},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"threshold",{get:function(){return this._extractFilter.threshold},set:function(e){this._extractFilter.threshold=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"kernels",{get:function(){return this._blurFilter.kernels},set:function(e){this._blurFilter.kernels=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"blur",{get:function(){return this._blurFilter.blur},set:function(e){this._blurFilter.blur=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"quality",{get:function(){return this._blurFilter.quality},set:function(e){this._blurFilter.quality=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"pixelSize",{get:function(){return this._blurFilter.pixelSize},set:function(e){this._blurFilter.pixelSize=e},enumerable:!1,configurable:!0}),n.defaults={threshold:.5,bloomScale:1,brightness:1,kernels:null,blur:8,quality:4,pixelSize:1,resolution:r.settings.FILTER_RESOLUTION},n}(n.Filter),g=function(e){function n(n){void 0===n&&(n=8);var t=e.call(this,c,"varying vec2 vTextureCoord;\n\nuniform vec4 filterArea;\nuniform float pixelSize;\nuniform sampler2D uSampler;\n\nvec2 mapCoord( vec2 coord )\n{\n    coord *= filterArea.xy;\n    coord += filterArea.zw;\n\n    return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n    coord -= filterArea.zw;\n    coord /= filterArea.xy;\n\n    return coord;\n}\n\nvec2 pixelate(vec2 coord, vec2 size)\n{\n    return floor( coord / size ) * size;\n}\n\nvec2 getMod(vec2 coord, vec2 size)\n{\n    return mod( coord , size) / size;\n}\n\nfloat character(float n, vec2 p)\n{\n    p = floor(p*vec2(4.0, -4.0) + 2.5);\n\n    if (clamp(p.x, 0.0, 4.0) == p.x)\n    {\n        if (clamp(p.y, 0.0, 4.0) == p.y)\n        {\n            if (int(mod(n/exp2(p.x + 5.0*p.y), 2.0)) == 1) return 1.0;\n        }\n    }\n    return 0.0;\n}\n\nvoid main()\n{\n    vec2 coord = mapCoord(vTextureCoord);\n\n    // get the rounded color..\n    vec2 pixCoord = pixelate(coord, vec2(pixelSize));\n    pixCoord = unmapCoord(pixCoord);\n\n    vec4 color = texture2D(uSampler, pixCoord);\n\n    // determine the character to use\n    float gray = (color.r + color.g + color.b) / 3.0;\n\n    float n =  65536.0;             // .\n    if (gray > 0.2) n = 65600.0;    // :\n    if (gray > 0.3) n = 332772.0;   // *\n    if (gray > 0.4) n = 15255086.0; // o\n    if (gray > 0.5) n = 23385164.0; // &\n    if (gray > 0.6) n = 15252014.0; // 8\n    if (gray > 0.7) n = 13199452.0; // @\n    if (gray > 0.8) n = 11512810.0; // #\n\n    // get the mod..\n    vec2 modd = getMod(coord, vec2(pixelSize));\n\n    gl_FragColor = color * character( n, vec2(-1.0) + modd * 2.0);\n\n}\n")||this;return t.size=n,t}return u(n,e),Object.defineProperty(n.prototype,"size",{get:function(){return this.uniforms.pixelSize},set:function(e){this.uniforms.pixelSize=e},enumerable:!1,configurable:!0}),n}(n.Filter),v=function(e){function n(n){var t=e.call(this,c,"precision mediump float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nuniform float transformX;\nuniform float transformY;\nuniform vec3 lightColor;\nuniform float lightAlpha;\nuniform vec3 shadowColor;\nuniform float shadowAlpha;\n\nvoid main(void) {\n    vec2 transform = vec2(1.0 / filterArea) * vec2(transformX, transformY);\n    vec4 color = texture2D(uSampler, vTextureCoord);\n    float light = texture2D(uSampler, vTextureCoord - transform).a;\n    float shadow = texture2D(uSampler, vTextureCoord + transform).a;\n\n    color.rgb = mix(color.rgb, lightColor, clamp((color.a - light) * lightAlpha, 0.0, 1.0));\n    color.rgb = mix(color.rgb, shadowColor, clamp((color.a - shadow) * shadowAlpha, 0.0, 1.0));\n    gl_FragColor = vec4(color.rgb * color.a, color.a);\n}\n")||this;return t._thickness=2,t._angle=0,t.uniforms.lightColor=new Float32Array(3),t.uniforms.shadowColor=new Float32Array(3),Object.assign(t,{rotation:45,thickness:2,lightColor:16777215,lightAlpha:.7,shadowColor:0,shadowAlpha:.7},n),t.padding=1,t}return u(n,e),n.prototype._updateTransform=function(){this.uniforms.transformX=this._thickness*Math.cos(this._angle),this.uniforms.transformY=this._thickness*Math.sin(this._angle)},Object.defineProperty(n.prototype,"rotation",{get:function(){return this._angle/t.DEG_TO_RAD},set:function(e){this._angle=e*t.DEG_TO_RAD,this._updateTransform()},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"thickness",{get:function(){return this._thickness},set:function(e){this._thickness=e,this._updateTransform()},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"lightColor",{get:function(){return o.rgb2hex(this.uniforms.lightColor)},set:function(e){o.hex2rgb(e,this.uniforms.lightColor)},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"lightAlpha",{get:function(){return this.uniforms.lightAlpha},set:function(e){this.uniforms.lightAlpha=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"shadowColor",{get:function(){return o.rgb2hex(this.uniforms.shadowColor)},set:function(e){o.hex2rgb(e,this.uniforms.shadowColor)},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"shadowAlpha",{get:function(){return this.uniforms.shadowAlpha},set:function(e){this.uniforms.shadowAlpha=e},enumerable:!1,configurable:!0}),n}(n.Filter),y=function(e){function n(n,o,s,u){void 0===n&&(n=2),void 0===o&&(o=4),void 0===s&&(s=r.settings.FILTER_RESOLUTION),void 0===u&&(u=5);var f,c,m=e.call(this)||this;return"number"==typeof n?(f=n,c=n):n instanceof t.Point?(f=n.x,c=n.y):Array.isArray(n)&&(f=n[0],c=n[1]),m.blurXFilter=new a.BlurFilterPass(!0,f,o,s,u),m.blurYFilter=new a.BlurFilterPass(!1,c,o,s,u),m.blurYFilter.blendMode=i.BLEND_MODES.SCREEN,m.defaultFilter=new l.AlphaFilter,m}return u(n,e),n.prototype.apply=function(e,n,t,r){var o=e.getFilterTexture();this.defaultFilter.apply(e,n,t,r),this.blurXFilter.apply(e,n,o,1),this.blurYFilter.apply(e,o,t,0),e.returnFilterTexture(o)},Object.defineProperty(n.prototype,"blur",{get:function(){return this.blurXFilter.blur},set:function(e){this.blurXFilter.blur=this.blurYFilter.blur=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"blurX",{get:function(){return this.blurXFilter.blur},set:function(e){this.blurXFilter.blur=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"blurY",{get:function(){return this.blurYFilter.blur},set:function(e){this.blurYFilter.blur=e},enumerable:!1,configurable:!0}),n}(n.Filter),b=function(e){function n(t){var r=e.call(this,c,"uniform float radius;\nuniform float strength;\nuniform vec2 center;\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\n\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\nuniform vec2 dimensions;\n\nvoid main()\n{\n    vec2 coord = vTextureCoord * filterArea.xy;\n    coord -= center * dimensions.xy;\n    float distance = length(coord);\n    if (distance < radius) {\n        float percent = distance / radius;\n        if (strength > 0.0) {\n            coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);\n        } else {\n            coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);\n        }\n    }\n    coord += center * dimensions.xy;\n    coord /= filterArea.xy;\n    vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);\n    vec4 color = texture2D(uSampler, clampedCoord);\n    if (coord != clampedCoord) {\n        color *= max(0.0, 1.0 - length(coord - clampedCoord));\n    }\n\n    gl_FragColor = color;\n}\n")||this;return r.uniforms.dimensions=new Float32Array(2),Object.assign(r,n.defaults,t),r}return u(n,e),n.prototype.apply=function(e,n,t,r){var o=n.filterFrame,i=o.width,l=o.height;this.uniforms.dimensions[0]=i,this.uniforms.dimensions[1]=l,e.applyFilter(this,n,t,r)},Object.defineProperty(n.prototype,"radius",{get:function(){return this.uniforms.radius},set:function(e){this.uniforms.radius=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"strength",{get:function(){return this.uniforms.strength},set:function(e){this.uniforms.strength=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"center",{get:function(){return this.uniforms.center},set:function(e){this.uniforms.center=e},enumerable:!1,configurable:!0}),n.defaults={center:[.5,.5],radius:100,strength:1},n}(n.Filter),x=function(e){function t(n,t,r){void 0===t&&(t=!1),void 0===r&&(r=1);var o=e.call(this,c,"varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform sampler2D colorMap;\nuniform float _mix;\nuniform float _size;\nuniform float _sliceSize;\nuniform float _slicePixelSize;\nuniform float _sliceInnerSize;\nvoid main() {\n    vec4 color = texture2D(uSampler, vTextureCoord.xy);\n\n    vec4 adjusted;\n    if (color.a > 0.0) {\n        color.rgb /= color.a;\n        float innerWidth = _size - 1.0;\n        float zSlice0 = min(floor(color.b * innerWidth), innerWidth);\n        float zSlice1 = min(zSlice0 + 1.0, innerWidth);\n        float xOffset = _slicePixelSize * 0.5 + color.r * _sliceInnerSize;\n        float s0 = xOffset + (zSlice0 * _sliceSize);\n        float s1 = xOffset + (zSlice1 * _sliceSize);\n        float yOffset = _sliceSize * 0.5 + color.g * (1.0 - _sliceSize);\n        vec4 slice0Color = texture2D(colorMap, vec2(s0,yOffset));\n        vec4 slice1Color = texture2D(colorMap, vec2(s1,yOffset));\n        float zOffset = fract(color.b * innerWidth);\n        adjusted = mix(slice0Color, slice1Color, zOffset);\n\n        color.rgb *= color.a;\n    }\n    gl_FragColor = vec4(mix(color, adjusted, _mix).rgb, color.a);\n\n}")||this;return o.mix=1,o._size=0,o._sliceSize=0,o._slicePixelSize=0,o._sliceInnerSize=0,o._nearest=!1,o._scaleMode=null,o._colorMap=null,o._scaleMode=null,o.nearest=t,o.mix=r,o.colorMap=n,o}return u(t,e),t.prototype.apply=function(e,n,t,r){this.uniforms._mix=this.mix,e.applyFilter(this,n,t,r)},Object.defineProperty(t.prototype,"colorSize",{get:function(){return this._size},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"colorMap",{get:function(){return this._colorMap},set:function(e){var t;e&&(e instanceof n.Texture||(e=n.Texture.from(e)),(null===(t=e)||void 0===t?void 0:t.baseTexture)&&(e.baseTexture.scaleMode=this._scaleMode,e.baseTexture.mipmap=i.MIPMAP_MODES.OFF,this._size=e.height,this._sliceSize=1/this._size,this._slicePixelSize=this._sliceSize/this._size,this._sliceInnerSize=this._slicePixelSize*(this._size-1),this.uniforms._size=this._size,this.uniforms._sliceSize=this._sliceSize,this.uniforms._slicePixelSize=this._slicePixelSize,this.uniforms._sliceInnerSize=this._sliceInnerSize,this.uniforms.colorMap=e),this._colorMap=e)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"nearest",{get:function(){return this._nearest},set:function(e){this._nearest=e,this._scaleMode=e?i.SCALE_MODES.NEAREST:i.SCALE_MODES.LINEAR;var n=this._colorMap;n&&n.baseTexture&&(n.baseTexture._glTextures={},n.baseTexture.scaleMode=this._scaleMode,n.baseTexture.mipmap=i.MIPMAP_MODES.OFF,n._updateID++,n.baseTexture.emit("update",n.baseTexture))},enumerable:!1,configurable:!0}),t.prototype.updateColorMap=function(){var e=this._colorMap;e&&e.baseTexture&&(e._updateID++,e.baseTexture.emit("update",e.baseTexture),this.colorMap=e)},t.prototype.destroy=function(n){void 0===n&&(n=!1),this._colorMap&&this._colorMap.destroy(n),e.prototype.destroy.call(this)},t}(n.Filter),_=function(e){function n(n,t){void 0===n&&(n=0),void 0===t&&(t=1);var r=e.call(this,c,"varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec3 color;\nuniform float alpha;\n\nvoid main(void) {\n    vec4 currentColor = texture2D(uSampler, vTextureCoord);\n    gl_FragColor = vec4(mix(currentColor.rgb, color.rgb, currentColor.a * alpha), currentColor.a);\n}\n")||this;return r._color=0,r._alpha=1,r.uniforms.color=new Float32Array(3),r.color=n,r.alpha=t,r}return u(n,e),Object.defineProperty(n.prototype,"color",{get:function(){return this._color},set:function(e){var n=this.uniforms.color;"number"==typeof e?(o.hex2rgb(e,n),this._color=e):(n[0]=e[0],n[1]=e[1],n[2]=e[2],this._color=o.rgb2hex(n))},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"alpha",{get:function(){return this._alpha},set:function(e){this.uniforms.alpha=e,this._alpha=e},enumerable:!1,configurable:!0}),n}(n.Filter),C=function(e){function n(n,t,r){void 0===n&&(n=16711680),void 0===t&&(t=0),void 0===r&&(r=.4);var o=e.call(this,c,"varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec3 originalColor;\nuniform vec3 newColor;\nuniform float epsilon;\nvoid main(void) {\n    vec4 currentColor = texture2D(uSampler, vTextureCoord);\n    vec3 colorDiff = originalColor - (currentColor.rgb / max(currentColor.a, 0.0000000001));\n    float colorDistance = length(colorDiff);\n    float doReplace = step(colorDistance, epsilon);\n    gl_FragColor = vec4(mix(currentColor.rgb, (newColor + colorDiff) * currentColor.a, doReplace), currentColor.a);\n}\n")||this;return o._originalColor=16711680,o._newColor=0,o.uniforms.originalColor=new Float32Array(3),o.uniforms.newColor=new Float32Array(3),o.originalColor=n,o.newColor=t,o.epsilon=r,o}return u(n,e),Object.defineProperty(n.prototype,"originalColor",{get:function(){return this._originalColor},set:function(e){var n=this.uniforms.originalColor;"number"==typeof e?(o.hex2rgb(e,n),this._originalColor=e):(n[0]=e[0],n[1]=e[1],n[2]=e[2],this._originalColor=o.rgb2hex(n))},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"newColor",{get:function(){return this._newColor},set:function(e){var n=this.uniforms.newColor;"number"==typeof e?(o.hex2rgb(e,n),this._newColor=e):(n[0]=e[0],n[1]=e[1],n[2]=e[2],this._newColor=o.rgb2hex(n))},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"epsilon",{get:function(){return this.uniforms.epsilon},set:function(e){this.uniforms.epsilon=e},enumerable:!1,configurable:!0}),n}(n.Filter),S=function(e){function n(n,t,r){void 0===t&&(t=200),void 0===r&&(r=200);var o=e.call(this,c,"precision mediump float;\n\nvarying mediump vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec2 texelSize;\nuniform float matrix[9];\n\nvoid main(void)\n{\n   vec4 c11 = texture2D(uSampler, vTextureCoord - texelSize); // top left\n   vec4 c12 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - texelSize.y)); // top center\n   vec4 c13 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y - texelSize.y)); // top right\n\n   vec4 c21 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y)); // mid left\n   vec4 c22 = texture2D(uSampler, vTextureCoord); // mid center\n   vec4 c23 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y)); // mid right\n\n   vec4 c31 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y + texelSize.y)); // bottom left\n   vec4 c32 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + texelSize.y)); // bottom center\n   vec4 c33 = texture2D(uSampler, vTextureCoord + texelSize); // bottom right\n\n   gl_FragColor =\n       c11 * matrix[0] + c12 * matrix[1] + c13 * matrix[2] +\n       c21 * matrix[3] + c22 * matrix[4] + c23 * matrix[5] +\n       c31 * matrix[6] + c32 * matrix[7] + c33 * matrix[8];\n\n   gl_FragColor.a = c22.a;\n}\n")||this;return o.uniforms.texelSize=new Float32Array(2),o.uniforms.matrix=new Float32Array(9),void 0!==n&&(o.matrix=n),o.width=t,o.height=r,o}return u(n,e),Object.defineProperty(n.prototype,"matrix",{get:function(){return this.uniforms.matrix},set:function(e){var n=this;e.forEach((function(e,t){n.uniforms.matrix[t]=e}))},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"width",{get:function(){return 1/this.uniforms.texelSize[0]},set:function(e){this.uniforms.texelSize[0]=1/e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"height",{get:function(){return 1/this.uniforms.texelSize[1]},set:function(e){this.uniforms.texelSize[1]=1/e},enumerable:!1,configurable:!0}),n}(n.Filter),F=function(e){function n(){return e.call(this,c,"precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);\n\n    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n\n    if (lum < 1.00)\n    {\n        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.75)\n    {\n        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.50)\n    {\n        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.3)\n    {\n        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n}\n")||this}return u(n,e),n}(n.Filter),z=function(e){function n(t){var r=e.call(this,c,"varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec4 filterArea;\nuniform vec2 dimensions;\n\nconst float SQRT_2 = 1.414213;\n\nconst float light = 1.0;\n\nuniform float curvature;\nuniform float lineWidth;\nuniform float lineContrast;\nuniform bool verticalLine;\nuniform float noise;\nuniform float noiseSize;\n\nuniform float vignetting;\nuniform float vignettingAlpha;\nuniform float vignettingBlur;\n\nuniform float seed;\nuniform float time;\n\nfloat rand(vec2 co) {\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main(void)\n{\n    vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;\n    vec2 dir = vec2(vTextureCoord.xy - vec2(0.5, 0.5)) * filterArea.xy / dimensions;\n\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n    vec3 rgb = gl_FragColor.rgb;\n\n    if (noise > 0.0 && noiseSize > 0.0)\n    {\n        pixelCoord.x = floor(pixelCoord.x / noiseSize);\n        pixelCoord.y = floor(pixelCoord.y / noiseSize);\n        float _noise = rand(pixelCoord * noiseSize * seed) - 0.5;\n        rgb += _noise * noise;\n    }\n\n    if (lineWidth > 0.0)\n    {\n        float _c = curvature > 0. ? curvature : 1.;\n        float k = curvature > 0. ?(length(dir * dir) * 0.25 * _c * _c + 0.935 * _c) : 1.;\n        vec2 uv = dir * k;\n\n        float v = (verticalLine ? uv.x * dimensions.x : uv.y * dimensions.y) * min(1.0, 2.0 / lineWidth ) / _c;\n        float j = 1. + cos(v * 1.2 - time) * 0.5 * lineContrast;\n        rgb *= j;\n        float segment = verticalLine ? mod((dir.x + .5) * dimensions.x, 4.) : mod((dir.y + .5) * dimensions.y, 4.);\n        rgb *= 0.99 + ceil(segment) * 0.015;\n    }\n\n    if (vignetting > 0.0)\n    {\n        float outter = SQRT_2 - vignetting * SQRT_2;\n        float darker = clamp((outter - length(dir) * SQRT_2) / ( 0.00001 + vignettingBlur * SQRT_2), 0.0, 1.0);\n        rgb *= darker + (1.0 - darker) * (1.0 - vignettingAlpha);\n    }\n\n    gl_FragColor.rgb = rgb;\n}\n")||this;return r.time=0,r.seed=0,r.uniforms.dimensions=new Float32Array(2),Object.assign(r,n.defaults,t),r}return u(n,e),n.prototype.apply=function(e,n,t,r){var o=n.filterFrame,i=o.width,l=o.height;this.uniforms.dimensions[0]=i,this.uniforms.dimensions[1]=l,this.uniforms.seed=this.seed,this.uniforms.time=this.time,e.applyFilter(this,n,t,r)},Object.defineProperty(n.prototype,"curvature",{get:function(){return this.uniforms.curvature},set:function(e){this.uniforms.curvature=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"lineWidth",{get:function(){return this.uniforms.lineWidth},set:function(e){this.uniforms.lineWidth=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"lineContrast",{get:function(){return this.uniforms.lineContrast},set:function(e){this.uniforms.lineContrast=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"verticalLine",{get:function(){return this.uniforms.verticalLine},set:function(e){this.uniforms.verticalLine=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"noise",{get:function(){return this.uniforms.noise},set:function(e){this.uniforms.noise=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"noiseSize",{get:function(){return this.uniforms.noiseSize},set:function(e){this.uniforms.noiseSize=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"vignetting",{get:function(){return this.uniforms.vignetting},set:function(e){this.uniforms.vignetting=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"vignettingAlpha",{get:function(){return this.uniforms.vignettingAlpha},set:function(e){this.uniforms.vignettingAlpha=e},enumerable:!1,configurable:!0}),Object.defineProperty(n.prototype,"vignettingBlur",{get:function(){return this.uniforms.vignettingBlur},set:function(e){this.uniforms.vignettingBlur=e},enumerable:!1,configurable:!0}),n.defaults={curvature:1,lineWidth:1,lineContrast:.25,verticalLine:!1,noise:0,noiseSize:1,seed:0,vignetting:.3,vignettingAlpha:1,vignettingBlur:.3,time:0},n}(n.Filter);return e.AdjustmentFilter=m,e.AdvancedBloomFilter=h,e.AsciiFilter=g,e.BevelFilter=v,e.BloomFilter=y,e.BulgePinchFilter=b,e.CRTFilter=z,e.ColorMapFilter=x,e.ColorOverlayFilter=_,e.ColorReplaceFilter=C,e.ConvolutionFilter=S,e.CrossHatchFilter=F,Object.defineProperty(e,"__esModule",{value:!0}),e}({},PIXI,PIXI,PIXI,PIXI.utils,PIXI,PIXI.filters,PIXI.filters);Object.assign(PIXI.filters,__filters);
    //# sourceMappingURL=pixi-filters.js.map
}

var P_2D_C_CRT = P_2D_C_CRT || {};

(() => {
    var params = PluginManager.parameters('CRTFilter');

    P_2D_C_CRT.crtFilter = null;
    P_2D_C_CRT.glowFilter = null;

    P_2D_C_CRT.isCRTEnabled          = String(params.isCRTEnabled) === 'true';
    P_2D_C_CRT.crtCurvature          = Number(params.crtCurvature);
    P_2D_C_CRT.crtLineWidth          = Number(params.crtLineWidth);
    P_2D_C_CRT.crtLineContrast       = Number(params.crtLineContrast);
    P_2D_C_CRT.crtVerticalLine       = String(params.crtVerticalLine) === 'true';
    P_2D_C_CRT.crtNoise              = Number(params.crtNoise);
    P_2D_C_CRT.crtNoiseSize          = Number(params.crtNoiseSize);
    P_2D_C_CRT.crtVignetting         = Number(params.crtVignetting);
    P_2D_C_CRT.crtVignettingAlpha    = Number(params.crtVignettingAlpha);
    P_2D_C_CRT.crtVignettingBlur     = Number(params.crtVignettingBlur);
    P_2D_C_CRT.crtPhosphorGlow       = Number(params.crtPhosphorGlow);
    P_2D_C_CRT.crtIsEffectOnMsgWin   = String(params.isEffectOnMsgWin) === 'true';

    PluginManager.registerCommand('CRTFilter', 'changeCRTFilter', args => {
        P_2D_C_CRT.crtCurvature        = Number(args.newCRTCurvature);
        P_2D_C_CRT.crtLineWidth        = Number(args.newCRTLineWidth);
        P_2D_C_CRT.crtLineContrast     = Number(args.newCRTLineContrast);
        P_2D_C_CRT.crtVerticalLine     = String(args.newCRTVerticalLine) === 'true';
        P_2D_C_CRT.crtNoise            = Number(args.newCRTNoise);
        P_2D_C_CRT.crtNoiseSize        = Number(args.newCRTNoiseSize);
        P_2D_C_CRT.crtVignetting       = Number(args.newCRTVignetting);
        P_2D_C_CRT.crtVignettingAlpha  = Number(args.newCRTVignettingAlpha);
        P_2D_C_CRT.crtVignettingBlur   = Number(args.newCRTVignettingBlur);
        P_2D_C_CRT.crtPhosphorGlow     = Number(args.newCRTPhosphorGlow);

        fixCRTData();

        if (P_2D_C_CRT.crtFilter) {
            P_2D_C_CRT.crtFilter.curvature        = P_2D_C_CRT.crtCurvature;
            P_2D_C_CRT.crtFilter.lineWidth        = P_2D_C_CRT.crtLineWidth;
            P_2D_C_CRT.crtFilter.lineContrast     = P_2D_C_CRT.crtLineContrast;
            P_2D_C_CRT.crtFilter.verticalLine     = P_2D_C_CRT.crtVerticalLine;
            P_2D_C_CRT.crtFilter.noise            = P_2D_C_CRT.crtNoise;
            P_2D_C_CRT.crtFilter.noiseSize        = P_2D_C_CRT.crtNoiseSize;
            P_2D_C_CRT.crtFilter.vignetting       = P_2D_C_CRT.crtVignetting;
            P_2D_C_CRT.crtFilter.vignettingAlpha  = P_2D_C_CRT.crtVignettingAlpha;
            P_2D_C_CRT.crtFilter.vignettingBlur   = P_2D_C_CRT.crtVignettingBlur;
        }

        if (P_2D_C_CRT.glowFilter) {
            if (P_2D_C_CRT.crtPhosphorGlow > 0) {
                P_2D_C_CRT.glowFilter.threshold = Math.max(0.5, 1.0 - P_2D_C_CRT.crtPhosphorGlow);
                P_2D_C_CRT.glowFilter.bloomScale = P_2D_C_CRT.crtPhosphorGlow * 0.8;
            }
        }

        if (!P_2D_C_CRT.isCRTEnabled) {
            P_2D_C_CRT.isCRTEnabled = true;
            startCRTFilter();
        }
    });

    PluginManager.registerCommand('CRTFilter', 'disableCRTFilter', () => {
        if (P_2D_C_CRT.isCRTEnabled) {
            P_2D_C_CRT.isCRTEnabled = false;
            disableCRTFilter();
        }
    });

    function fixCRTData() {
        if (String(P_2D_C_CRT.crtCurvature) === 'NaN') P_2D_C_CRT.crtCurvature = 1.0;
        else if   (P_2D_C_CRT.crtCurvature < 0)        P_2D_C_CRT.crtCurvature = 0;
        else if   (P_2D_C_CRT.crtCurvature > 3)        P_2D_C_CRT.crtCurvature = 3;

        if (String(P_2D_C_CRT.crtLineWidth) === 'NaN') P_2D_C_CRT.crtLineWidth = 1.0;
        else if   (P_2D_C_CRT.crtLineWidth < 0)        P_2D_C_CRT.crtLineWidth = 0;
        else if   (P_2D_C_CRT.crtLineWidth > 10)       P_2D_C_CRT.crtLineWidth = 10;

        if (String(P_2D_C_CRT.crtLineContrast) === 'NaN') P_2D_C_CRT.crtLineContrast = 0.25;
        else if   (P_2D_C_CRT.crtLineContrast < 0)        P_2D_C_CRT.crtLineContrast = 0;
        else if   (P_2D_C_CRT.crtLineContrast > 1)        P_2D_C_CRT.crtLineContrast = 1;

        if (String(P_2D_C_CRT.crtNoise) === 'NaN') P_2D_C_CRT.crtNoise = 0.0;
        else if   (P_2D_C_CRT.crtNoise < 0)        P_2D_C_CRT.crtNoise = 0;
        else if   (P_2D_C_CRT.crtNoise > 1)        P_2D_C_CRT.crtNoise = 1;

        if (String(P_2D_C_CRT.crtNoiseSize) === 'NaN') P_2D_C_CRT.crtNoiseSize = 1.0;
        else if   (P_2D_C_CRT.crtNoiseSize < 0)        P_2D_C_CRT.crtNoiseSize = 0;
        else if   (P_2D_C_CRT.crtNoiseSize > 10)       P_2D_C_CRT.crtNoiseSize = 10;

        if (String(P_2D_C_CRT.crtVignetting) === 'NaN') P_2D_C_CRT.crtVignetting = 0.3;
        else if   (P_2D_C_CRT.crtVignetting < 0)        P_2D_C_CRT.crtVignetting = 0;
        else if   (P_2D_C_CRT.crtVignetting > 1)        P_2D_C_CRT.crtVignetting = 1;

        if (String(P_2D_C_CRT.crtVignettingAlpha) === 'NaN') P_2D_C_CRT.crtVignettingAlpha = 1.0;
        else if   (P_2D_C_CRT.crtVignettingAlpha < 0)        P_2D_C_CRT.crtVignettingAlpha = 0;
        else if   (P_2D_C_CRT.crtVignettingAlpha > 1)        P_2D_C_CRT.crtVignettingAlpha = 1;

        if (String(P_2D_C_CRT.crtVignettingBlur) === 'NaN') P_2D_C_CRT.crtVignettingBlur = 0.3;
        else if   (P_2D_C_CRT.crtVignettingBlur < 0)        P_2D_C_CRT.crtVignettingBlur = 0;
        else if   (P_2D_C_CRT.crtVignettingBlur > 1)        P_2D_C_CRT.crtVignettingBlur = 1;

        if (String(P_2D_C_CRT.crtPhosphorGlow) === 'NaN') P_2D_C_CRT.crtPhosphorGlow = 0.3;
        else if   (P_2D_C_CRT.crtPhosphorGlow < 0)        P_2D_C_CRT.crtPhosphorGlow = 0;
        else if   (P_2D_C_CRT.crtPhosphorGlow > 1)        P_2D_C_CRT.crtPhosphorGlow = 1;
    }

    function setupCRTFilter() {
        fixCRTData();
        P_2D_C_CRT.crtFilter = new PIXI.filters.CRTFilter({
            curvature:       P_2D_C_CRT.crtCurvature,
            lineWidth:       P_2D_C_CRT.crtLineWidth,
            lineContrast:    P_2D_C_CRT.crtLineContrast,
            verticalLine:    P_2D_C_CRT.crtVerticalLine,
            noise:           P_2D_C_CRT.crtNoise,
            noiseSize:       P_2D_C_CRT.crtNoiseSize,
            vignetting:      P_2D_C_CRT.crtVignetting,
            vignettingAlpha: P_2D_C_CRT.crtVignettingAlpha,
            vignettingBlur:  P_2D_C_CRT.crtVignettingBlur,
            time:            0,
            seed:            0
        });

        // 设置磷光余辉滤镜(使用Bloom滤镜模拟)
        if (P_2D_C_CRT.crtPhosphorGlow > 0) {
            P_2D_C_CRT.glowFilter = new PIXI.filters.AdvancedBloomFilter({
                threshold:   Math.max(0.5, 1.0 - P_2D_C_CRT.crtPhosphorGlow),
                bloomScale:  P_2D_C_CRT.crtPhosphorGlow * 0.8,
                brightness:  1.0,
                blur:        4,
                quality:     3
            });
        }
    }

    function startCRTFilter() {
        if (P_2D_C_CRT.isCRTEnabled) {
            let hasCRTFilter = false;
            let hasGlowFilter = false;
            
            if (P_2D_C_CRT.crtIsEffectOnMsgWin) {
                SceneManager._scene.filters.forEach(e => {
                    if (e === P_2D_C_CRT.crtFilter) hasCRTFilter = true;
                    if (e === P_2D_C_CRT.glowFilter) hasGlowFilter = true;
                });
                
                // 添加磷光余辉滤镜(需要在CRT滤镜之前)
                if (!hasGlowFilter && P_2D_C_CRT.glowFilter && P_2D_C_CRT.crtPhosphorGlow > 0) {
                    SceneManager._scene.filters.push(P_2D_C_CRT.glowFilter);
                }
                
                // 添加CRT滤镜
                if (!hasCRTFilter) {
                    SceneManager._scene.filters.push(P_2D_C_CRT.crtFilter);
                }
            } else {
                SceneManager._scene._spriteset.filters.forEach(e => {
                    if (e === P_2D_C_CRT.crtFilter) hasCRTFilter = true;
                    if (e === P_2D_C_CRT.glowFilter) hasGlowFilter = true;
                });
                
                // 添加磷光余辉滤镜(需要在CRT滤镜之前)
                if (!hasGlowFilter && P_2D_C_CRT.glowFilter && P_2D_C_CRT.crtPhosphorGlow > 0) {
                    SceneManager._scene._spriteset.filters.push(P_2D_C_CRT.glowFilter);
                }
                
                // 添加CRT滤镜
                if (!hasCRTFilter) {
                    SceneManager._scene._spriteset.filters.push(P_2D_C_CRT.crtFilter);
                }
            }
        }
    }

    function updateCRTFilter() {
        if (P_2D_C_CRT.isCRTEnabled) {
            P_2D_C_CRT.crtFilter.seed = Math.random();
            P_2D_C_CRT.crtFilter.time += 0.5;
        }
    }

    function disableCRTFilter() {
        if (P_2D_C_CRT.crtIsEffectOnMsgWin) {
            // 移除CRT滤镜
            let crtIdx = SceneManager._scene.filters.indexOf(P_2D_C_CRT.crtFilter);
            if (crtIdx >= 0) SceneManager._scene.filters.splice(crtIdx, 1);
            
            // 移除磷光余辉滤镜
            let glowIdx = SceneManager._scene.filters.indexOf(P_2D_C_CRT.glowFilter);
            if (glowIdx >= 0) SceneManager._scene.filters.splice(glowIdx, 1);
        } else {
            // 移除CRT滤镜
            let crtIdx = SceneManager._scene._spriteset.filters.indexOf(P_2D_C_CRT.crtFilter);
            if (crtIdx >= 0) SceneManager._scene._spriteset.filters.splice(crtIdx, 1);
            
            // 移除磷光余辉滤镜
            let glowIdx = SceneManager._scene._spriteset.filters.indexOf(P_2D_C_CRT.glowFilter);
            if (glowIdx >= 0) SceneManager._scene._spriteset.filters.splice(glowIdx, 1);
        }
    }

    setupCRTFilter();

    var _Scene_Map_prototype_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_prototype_onMapLoaded.call(this);
        startCRTFilter();
    };

    var _Scene_Map_prototype_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_prototype_update.call(this);
        updateCRTFilter();
    };
})();
