# DailyMood AI - App Icon Generation Guide

## Base Icon Created
- resources/icons/icon-1024.svg (1024x1024 source icon)

## Required iOS Icons
- AppIcon-20x20@1x.png (20x20)
- AppIcon-20x20@2x.png (40x40)
- AppIcon-20x20@3x.png (60x60)
- AppIcon-29x29@1x.png (29x29)
- AppIcon-29x29@2x.png (58x58)
- AppIcon-29x29@3x.png (87x87)
- AppIcon-40x40@1x.png (40x40)
- AppIcon-40x40@2x.png (80x80)
- AppIcon-40x40@3x.png (120x120)
- AppIcon-60x60@2x.png (120x120)
- AppIcon-60x60@3x.png (180x180)
- AppIcon-76x76@1x.png (76x76)
- AppIcon-76x76@2x.png (152x152)
- AppIcon-83.5x83.5@2x.png (167x167)
- AppIcon-1024x1024@1x.png (1024x1024)

## Required Android Icons
- ic_launcher.png (36x36) - android/app/src/main/res/mipmap-ldpi/
- ic_launcher.png (48x48) - android/app/src/main/res/mipmap-mdpi/
- ic_launcher.png (72x72) - android/app/src/main/res/mipmap-hdpi/
- ic_launcher.png (96x96) - android/app/src/main/res/mipmap-xhdpi/
- ic_launcher.png (144x144) - android/app/src/main/res/mipmap-xxhdpi/
- ic_launcher.png (192x192) - android/app/src/main/res/mipmap-xxxhdpi/
- ic_launcher.png (512x512) - android/app/src/main/res/mipmap-playstore/

## Generation Instructions

### Using Online Tools (Recommended)
1. Upload resources/icons/icon-1024.svg to:
   - https://appicon.co/
   - https://makeappicon.com/
   - https://icon.kitchen/

2. Download the generated icon sets
3. Place iOS icons in: ios/App/App/Assets.xcassets/AppIcon.appiconset/
4. Place Android icons in respective mipmap folders

### Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
# Convert SVG to PNG and resize for each platform

# iOS Icons
magick resources/icons/icon-1024.svg -resize 20x20 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20x20@1x.png
magick resources/icons/icon-1024.svg -resize 40x40 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20x20@2x.png
magick resources/icons/icon-1024.svg -resize 60x60 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20x20@3x.png
magick resources/icons/icon-1024.svg -resize 29x29 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29x29@1x.png
magick resources/icons/icon-1024.svg -resize 58x58 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29x29@2x.png
magick resources/icons/icon-1024.svg -resize 87x87 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29x29@3x.png
magick resources/icons/icon-1024.svg -resize 40x40 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40x40@1x.png
magick resources/icons/icon-1024.svg -resize 80x80 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40x40@2x.png
magick resources/icons/icon-1024.svg -resize 120x120 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40x40@3x.png
magick resources/icons/icon-1024.svg -resize 120x120 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-60x60@2x.png
magick resources/icons/icon-1024.svg -resize 180x180 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-60x60@3x.png
magick resources/icons/icon-1024.svg -resize 76x76 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-76x76@1x.png
magick resources/icons/icon-1024.svg -resize 152x152 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-76x76@2x.png
magick resources/icons/icon-1024.svg -resize 167x167 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-83.5x83.5@2x.png
magick resources/icons/icon-1024.svg -resize 1024x1024 ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-1024x1024@1x.png

# Android Icons
magick resources/icons/icon-1024.svg -resize 36x36 android/app/src/main/res/mipmap-ldpi/ic_launcher.png
magick resources/icons/icon-1024.svg -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
magick resources/icons/icon-1024.svg -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
magick resources/icons/icon-1024.svg -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
magick resources/icons/icon-1024.svg -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
magick resources/icons/icon-1024.svg -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
magick resources/icons/icon-1024.svg -resize 512x512 android/app/src/main/res/mipmap-playstore/ic_launcher.png
```

## Splash Screen Assets
- Create splash screens using the same branding
- iOS: 1242x2688 (iPhone 12 Pro Max)
- Android: 1080x1920 (Standard)

## App Store Screenshots Required
### iOS (App Store Connect)
- 6.7" Display: 1290x2796 (iPhone 14 Pro Max)
- 6.5" Display: 1242x2688 (iPhone 11 Pro Max)
- 5.5" Display: 1242x2208 (iPhone 8 Plus)

### Android (Google Play Console)
- Phone: 1080x1920
- 7" Tablet: 1200x1920
- 10" Tablet: 1920x1200

## Store Listing Assets
- Feature Graphic (Android): 1024x500
- Promotional Image (iOS): 1024x1024
- App Preview Videos: 30 seconds max
