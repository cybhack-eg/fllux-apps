# 🚀 FLLUX Desktop (WebView Secure App)

[**العربية**](#-fllux-desktop-تطبيق-سطح-المكتب-الآمن) | [**English**](#-fllux-desktop-webview-secure-app)

---

## 🇸🇦 FLLUX Desktop (تطبيق سطح المكتب الآمن)

تطبيق سطح مكتب احترافي مبني باستخدام **Electron**، يعمل كواجهة آمنة ومخصصة (WebView) للوصول إلى نظام **FLLUX** عبر الإنترنت. يوفر التطبيق تجربة مستخدم أصلية (Native) على جميع أنظمة التشغيل مع ميزات أمان متقدمة.

### ✨ المميزات الرئيسية
*   **دعم جميع المنصات**: متوفر لأنظمة Windows, macOS, و Linux.
*   **واجهة مستخدم عصرية**: تصميم متناسق يدعم الوضع الليلي والنهاري.
*   **أمان متقدم**: حماية المحتوى، تخزين كلمات المرور المشفرة (Vault)، ونظام تذكير مدمج.
*   **تحديثات تلقائية**: جاهز لدعم التحديثات السحابية.
*   **بناء سحابي (CI/CD)**: يتم بناء النسخ تلقائياً عبر GitHub Actions لضمان أعلى جودة.

### 📥 التحميل
يمكنك تحميل أحدث نسخة مستقرة من صفحة [**Releases**](https://github.com/cybhack-eg/fllux-apps/releases):
*   **Windows**: `.exe` (مثبت بنقرة واحدة).
*   **macOS**: `.dmg` (يدعم Intel و Apple Silicon).
*   **Linux**: `.AppImage` و `.deb` (لجميع التوزيعات).

---

## 🇺🇸 FLLUX Desktop (WebView Secure App)

A professional desktop application built with **Electron**, serving as a secure and dedicated WebView interface for the **FLLUX** online system. It provides a native user experience across all operating systems with advanced security features.

### ✨ Key Features
*   **Cross-Platform**: Available for Windows, macOS, and Linux.
*   **Modern UI**: Sleek design with support for dark and light modes.
*   **Advanced Security**: Content protection, encrypted Password Vault, and integrated Reminder System.
*   **Auto-Updates**: Ready for cloud-based delivery.
*   **Cloud Build (CI/CD)**: Automated builds via GitHub Actions for consistent quality.

### 📥 Download
Download the latest stable version from the [**Releases**](https://github.com/cybhack-eg/fllux-apps/releases) page:
*   **Windows**: `.exe` (One-click installer).
*   **macOS**: `.dmg` (Supports Intel & Apple Silicon).
*   **Linux**: `.AppImage` & `.deb` (For all distributions).

---

## 🛠️ Development (التطوير)

### Prerequisites (المتطلبات)
*   Node.js (v18+)
*   npm

### Installation (التثبيت)
```bash
# Clone the repository
git clone https://github.com/cybhack-eg/fllux-apps.git

# Navigate to project
cd fllux-apps

# Install dependencies
npm install
```

### Running (التشغيل)
```bash
npm start
```

### Building (البناء المحلي)
```bash
# Windows
npm run dist:win

# Linux
npm run dist:linux

# macOS (Needs a Mac machine)
npm run dist:mac
```

---

## 🤖 CI/CD with GitHub Actions
This project uses automated workflows to build and release applications. 
- Builds are triggered on **Tags** (e.g., `v1.0.0`) or manually via the **Actions** tab.
- macOS builds are performed on `macos-latest` runners to ensure compatibility.

---

## 📄 License (الترخيص)
Distributed under the **FLLUX** Private License. All rights reserved.

---

### 📬 Contact (التواصل)
Created by **FLLUX** - [info@fllux.org](mailto:info@fllux.org)
