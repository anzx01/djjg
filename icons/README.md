# 图标文件说明

本目录包含本扩展所需的图标文件。

## 需要的PNG图标文件：

- **icon16.png** - 16x16像素，用于浏览器工具栏小图标
- **icon32.png** - 32x32像素，用于扩展管理页面
- **icon48.png** - 48x48像素，用于扩展管理页面
- **icon128.png** - 128x128像素，用于Chrome网上应用店

## 图标设计说明：

当前 PNG 图标由本目录中的 `icon16.svg` 生成，不包含第三方商标或外部素材。替换图标时，请仅使用自有、公共领域或已获得授权且允许开源分发的素材。

## 创建PNG文件的方法：

1. **使用在线工具**：
   - 打开 [icon16.svg](icon16.svg) 文件
   - 使用在线SVG转PNG工具，如：
     - https://convertio.co/svg-png/
     - https://www.freeconvert.com/svg-to-png
   - 分别导出16px, 32px, 48px, 128px尺寸

2. **使用图像编辑软件**：
   - 用Adobe Illustrator, Inkscape等打开icon16.svg
   - 导出为不同尺寸的PNG文件

3. **使用命令行工具**：
   ```bash
   # 如果安装了ImageMagick
   convert icon16.svg -resize 16x16 icon16.png
   convert icon16.svg -resize 32x32 icon32.png
   convert icon16.svg -resize 48x48 icon48.png
   convert icon16.svg -resize 128x128 icon128.png
   ```

## 临时解决方案：

在开发测试阶段，可以暂时使用任何16x16, 32x32, 48x48, 128x128的PNG文件作为占位符，插件功能不受影响。
