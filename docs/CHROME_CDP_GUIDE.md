# Chrome CDP 集成使用指南

## 快速开始

### 1. 启动 Chrome 调试模式

```bash
bash ~/code/obsidian-smart-bookmark/scripts/start-chrome-cdp.sh
```

### 2. 在 Obsidian 中启用 CDP

```
Settings → Smart Bookmark Settings → Enhanced Analysis Settings
  ↓
✅ Use Chrome CDP
```

### 3. 测试连接

点击 "Test Connection" 按钮

### 4. 导入书签

正常导入，现在可以访问已登录内容！

## 详细说明

### Chrome 启动参数

脚本会自动使用以下参数启动 Chrome：

```bash
--remote-debugging-port=9222          # CDP 端口
--remote-debugging-address=127.0.0.1  # 仅本地访问
--user-data-dir=/tmp/chrome-debug-profile  # 独立配置文件
--disable-web-security                     # 允许跨域
--disable-features=TranslateUI            # 禁用翻译 UI
```

### 安全说明

⚠️ **重要**：
- CDP 仅从 `127.0.0.1` 可访问
- 不要将 9222 端口暴露到公网
- 不使用时关闭 Chrome
- 定期检查日志文件

### 日志文件

```bash
tail -f /tmp/chrome-debug.log
```

### 手动启动 Chrome

如果不使用脚本，可以手动启动：

**macOS**:
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir=/tmp/chrome-debug-profile
```

**Linux**:
```bash
google-chrome \
  --remote-debugging-port=9222 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir=/tmp/chrome-debug-profile
```

**Windows**:
```powershell
"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --remote-debugging-port=9222 ^
  --remote-debugging-address=127.0.0.1 ^
  --user-data-dir=C:\temp\chrome-debug-profile
```

### 停止 Chrome

```bash
# 查找 Chrome 进程
ps aux | grep "chrome-debug-profile"

# 停止进程
kill <PID>

# 或使用脚本输出的 PID
kill $CHROME_PID
```

## 工作原理

### 连接流程

```
Obsidian Plugin → HTTP → localhost:9222/json/version
                    ↓
                Chrome CDP
                    ↓
                创建/激活标签页
                    ↓
                等待页面加载
                    ↓
                读取 DOM 内容
                    ↓
                返回页面数据
```

### 数据获取

```javascript
// 1. 列出所有标签页
GET http://localhost:9222/json/list

// 2. 创建新标签页
PUT http://localhost:9222/json/new
Body: { "url": "https://example.com" }

// 3. 激活标签页
GET http://localhost:9222/json/activate/<tab_id>

// 4. 评估页面内容
GET http://localhost:9222/json/evaluate/<tab_id>
```

### 降级策略

```
1. 尝试 CDP（如果启用且可用）
   ↓ 失败
2. 尝试直接 fetch
   ↓ 失败
3. 使用 Fallback Analyzer
```

## 故障排查

### 问题：连接测试失败

**症状**：`❌ Chrome CDP not available`

**解决方案**：
1. 检查 Chrome 是否运行：
   ```bash
   ps aux | grep chrome
   ```

2. 检查端口是否被占用：
   ```bash
   lsof -i :9222
   ```

3. 检查 CDP 端点：
   ```bash
   curl http://localhost:9222/json/version
   ```

### 问题：端口冲突

**症状**：`⚠️ Port 9222 is already in use`

**解决方案**：
1. 停止其他使用端口的程序
2. 或更改端口：
   - 在启动脚本中设置 `CDP_PORT=9223`
   - 在 Obsidian 设置中更新端口

### 问题：内容未更新

**症状**：Chrome 标签页打开了，但内容为空

**解决方案**：
1. 增加等待时间
2. 检查页面是否需要滚动
3. 确认页面已完全加载

## 最佳实践

### 1. 使用独立的 Chrome Profile

```bash
# 不要使用默认 profile
# 使用临时 profile 避免冲突
--user-data-dir=/tmp/chrome-debug-profile
```

### 2. 定期清理 Profile

```bash
# 每周清理一次
rm -rf /tmp/chrome-debug-profile
# 重新启动
bash scripts/start-chrome-cdp.sh
```

### 3. 仅在需要时启动

```bash
# 导入书签前启动
bash scripts/start-chrome-cdp.sh

# 完成后停止
kill $CHROME_PID
```

### 4. 监控日志

```bash
# 实时查看日志
tail -f /tmp/chrome-debug.log
```

## 性能影响

### 启用 CDP 后

- ✅ 更快（Chrome 已有缓存）
- ✅ 可以访问已登录内容
- ⚠️ 需要额外的 Chrome 进程
- ⚠️ 可能增加内存使用

### 资源使用

| 场景 | 内存 | CPU |
|------|------|-----|
| 仅 CDP | +200MB | 低 |
| CDP + 标签页 | +500MB | 中 |
| 大量标签页 | +1GB+ | 高 |

## 替代方案

### 如果 CDP 不可用

1. **关闭 CDP**：在设置中禁用 "Use Chrome CDP"
2. **使用浏览器扩展**：未来版本支持
3. **使用代理服务**：第三方内容提取 API

## 技术细节

### CDP 版本检查

```bash
curl http://localhost:9222/json/version
```

**响应**：
```json
{
  "Browser": "Chrome/123.0.0.0",
  "Protocol-Version": "1.3",
  "WebKit-Version": "537.36",
  "webSocketDebuggerUrl": "ws://localhost:9222/devtools/page/..."
}
```

### 标签页列表

```bash
curl http://localhost:9222/json/list
```

**响应**：
```json
[
  {
    "id": "C94B4E5E...",
    "url": "https://example.com",
    "title": "Example Domain",
    "type": "page",
    "webSocketDebuggerUrl": "ws://localhost:9222/devtools/page/..."
  }
]
```

## 常见问题

### Q: 可以同时使用 CDP 和普通 Chrome 吗？

**A**: 可以！CDP 使用独立的 profile，不会影响你的正常 Chrome。

### Q: CDP 会保存我的密码吗？

**A**: 不会。CDP 只读取 DOM 内容，不会访问密码管理器。

### Q: 可以在其他浏览器中使用吗？

**A**: 目前只支持 Chrome。Firefox 也有类似功能，但实现不同。

### Q: CDP 会暴露我的浏览数据吗？

**A**: 不会。CDP 只绑定到 127.0.0.1，只有本地可以访问。

### Q: 可以在多个 Obsidian vault 中使用吗？

**A**: 可以，但所有 vault 会共享同一个 Chrome 进程。

## 下一步

### Phase 1: 增强 CDP 功能
- [ ] WebSocket 连接（而不是 HTTP）
- [ ] 支持等待页面加载完成
- [ ] 滚动页面以加载懒加载内容
- [ ] 处理 JavaScript 错误

### Phase 2: 自动化
- [ ] 自动启动 Chrome（需要用户授权）
- [ ] 自动关闭闲置的标签页
- [ ] 限制同时打开的标签页数量
- [ ] 资源使用监控

### Phase 3: 多浏览器支持
- [ ] Firefox CDP 支持
- [ ] Safari Web Inspector 支持
- [ ] Edge DevTools 支持

## 参考资料

- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Remote Debugging](https://developer.chrome.com/docs/devtools/remote-debugging/)
- [Playwright CDP](https://playwright.dev/docs/api/class-cdpsession)
- [Obsidian Electron](https://docs.obsidian.md/Reference/Electron+APIs)

---

有问题？查看完整文档：`docs/CHROME_CDP_INTEGRATION.md`
