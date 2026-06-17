# Sanity 后台设置指南（新手版）

## 项目保存在哪里？

```
C:\Users\Administrator\Projects\iphone-store
```

所有代码都在这个文件夹。上线后，网站运行在 Vercel，后台运行在 Sanity 云端。

---

## 第一步：注册 Sanity（5 分钟）

1. 打开 https://www.sanity.io
2. 点击 **Get started**，用 Google 或邮箱注册
3. 点击 **Create new project**
4. 项目名称填：`iPhone Store`
5. 选择 **Free** 免费计划
6. Dataset 保持 `production`

---

## 第二步：配置环境变量

1. 在 Sanity 项目页面，进入 **Settings → API**
2. 复制 **Project ID**
3. 在本项目根目录，复制 `.env.local.example` 为 `.env.local`：

```powershell
cd C:\Users\Administrator\Projects\iphone-store
copy .env.local.example .env.local
```

4. 编辑 `.env.local`，填入你的 Project ID：

```
NEXT_PUBLIC_SANITY_PROJECT_ID=你的项目ID
NEXT_PUBLIC_SANITY_DATASET=production
```

---

## 第三步：启动网站和后台

```powershell
cd C:\Users\Administrator\Projects\iphone-store
npm run dev:clean
```

`dev:clean` 会先删除损坏的 `.next` 缓存再启动，**样式丢失或 500 报错时优先用这个**。

普通启动：

```powershell
npm run dev
```

打开浏览器：

| 地址 | 用途 |
|------|------|
| http://localhost:3000 | 网站前台 |
| http://localhost:3000/studio | **管理后台** |

第一次打开 `/studio` 会要求你登录 Sanity 账号。

---

## 后台操作说明

### 1. 上传产品真实图片

1. 打开 http://localhost:3000/studio
2. 左侧点击 **产品管理**
3. 点击 **Create new** 或编辑已有产品
4. 在 **主图** 字段点击上传图片
5. 填写名称、价格、颜色等
6. 点击右上角 **Publish** 发布
7. 刷新前台网站，图片自动更新

### 2. 调整盲盒抽奖概率

1. 后台左侧点击 **盲盒奖品 & 概率**
2. 点击某个奖品（如 iPhone 17 Pro Max）
3. 修改 **概率权重** 数字
   - 数字越大 = 越容易中奖
   - 例如：大奖=1，再接再厉=944
4. 点击 **Publish**
5. 前台 `/blindbox` 页面的概率表自动更新

### 3. 修改盲盒价格和 SEO

1. 后台左侧点击 **盲盒设置**
2. 修改：
   - 抽奖价格（默认 $60）
   - 终极大奖名称
   - 盲盒页 SEO 标题和描述
   - 上传终极大奖真实图片
3. 点击 **Publish**

### 4. 全站 SEO 设置

1. 后台左侧点击 **全站设置 & SEO**
2. 填写首页 SEO 标题、描述
3. 上传社交分享图
4. 点击 **Publish**

---

## 日常操作流程

```
登录 Sanity 后台 → 修改内容/图片/概率 → Publish → 前台自动更新
```

不需要改代码，不需要找程序员。

---

## 上线后后台地址

部署到 Vercel 后，后台地址为：

```
https://你的域名.com/studio
```

---

## 网站打不开 / 页面一直转圈？

**最常见原因：端口被旧进程占用了。**

你可能打开了 `http://localhost:3000`，但实际服务跑在 `3001`，或者 3000 上的旧进程已经卡死。

### 一键修复（推荐）

在项目文件夹双击 **`START.bat`**，或在终端运行：

```powershell
cd C:\Users\Administrator\Projects\iphone-store
npm run dev:clean
```

这会：自动释放 3000 端口 → 清理缓存 → 在 **3000** 端口启动。

### 正确地址（启动成功后）

| 页面 | 地址 |
|------|------|
| 盲盒首页 | http://localhost:3000 |
| 管理后台 | http://localhost:3000/studio |
| SEO 别名 | http://localhost:3000/mystery-box |

手机访问电脑：把 `localhost` 换成电脑 IP，如 `http://192.168.0.113:3000`

---

## 本地后台「打不开 / 显示不安全」？

这是本地开发最常见的情况，**不是网站坏了**。

### 1. 浏览器显示「不安全 / Not secure」

本地开发用的是 **HTTP**（没有 HTTPS 证书），Chrome 会显示「不安全」——**这是正常的**。

- 地址必须是：`http://localhost:3000/studio`（注意是 **http**，不是 https）
- 不要用 `https://localhost:3000`（会报错）
- 手机访问电脑：用 `http://192.168.x.x:3000/studio`，同样会提示不安全，点「继续访问」即可

### 2. 后台白屏或加载失败

先检查是否配置了 Project ID：

```powershell
cd C:\Users\Administrator\Projects\iphone-store
copy .env.local.example .env.local
# 编辑 .env.local，填入 NEXT_PUBLIC_SANITY_PROJECT_ID
```

改完后**重启** dev 服务器（Ctrl+C 再 `npm run dev`）。

### 3. 备选：单独启动后台（推荐本地调试）

如果 `/studio` 仍有问题，用 Sanity 独立后台：

```powershell
npm run studio
```

浏览器打开：**http://localhost:3333**（Sanity 官方本地后台，更稳定）

### 4. Sanity 后台 CORS 设置

登录 https://www.sanity.io/manage → 你的项目 → **Settings → API → CORS origins**，添加：

```
http://localhost:3000
http://localhost:3333
```

---

## 常见问题

**Q: 没配置 Sanity 时网站能用吗？**
A: 可以。网站会使用内置的默认产品和概率数据。

**Q: 图片上传后前台没变化？**
A: 确认点击了 **Publish**（发布），然后刷新浏览器（Ctrl+Shift+R）。

**Q: 概率改了但抽奖结果感觉没变？**
A: 概率是统计意义上的，单次抽奖仍有随机性。权重越大，长期中奖率越高。
