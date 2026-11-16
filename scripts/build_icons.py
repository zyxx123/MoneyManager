import os
from PIL import Image, ImageFilter
import numpy as np
from scipy.ndimage import distance_transform_edt

input_path = "C:/Users/ThinkPad/.gemini/antigravity/brain/00da3f37-3ba9-476d-a4da-527774052760/.user_uploaded/media_1794832882724_02271826.jpg"
if not os.path.exists(input_path):
    input_path = "Ikon Dompet Hijau Rupiah.png"

img = Image.open(input_path).convert('RGB')
w, h = img.size

# Square crop centered around (512, 509) for 1024x1024
left = int(80 * w / 1024)
top = int(77 * h / 1024)
size = int(864 * min(w, h) / 1024)

cropped = img.crop((left, top, left + size, top + size))
arr = np.array(cropped)

# 1. Full-bleed version for iOS and Maskable Android
# Inpaint the black corners with nearest non-black pixel
is_black = (arr[:, :, 0] < 22) & (arr[:, :, 1] < 22) & (arr[:, :, 2] < 22)
_, indices = distance_transform_edt(is_black, return_indices=True)
filled_arr = arr[tuple(indices)]
full_bleed_img = Image.fromarray(filled_arr).convert('RGBA')

# Subtle gaussian blur on the filled corner region to smooth gradient transitions
blurred = full_bleed_img.filter(ImageFilter.GaussianBlur(radius=4))
blurred_arr = np.array(blurred)
final_full_arr = filled_arr.copy()
final_full_arr[is_black] = blurred_arr[is_black, :3]
full_bleed_img = Image.fromarray(final_full_arr)

# 2. Transparent squircle version for standard desktop/any purpose
rgba = np.dstack([arr, np.ones((size, size), dtype=np.uint8) * 255])
dist = distance_transform_edt(~is_black)
alpha = np.clip(dist * 64, 0, 255).astype(np.uint8)
rgba[:, :, 3] = alpha
transparent_img = Image.fromarray(rgba, 'RGBA')

os.makedirs('public/icons', exist_ok=True)
os.makedirs('src/app', exist_ok=True)

# Generate assets
# Apple Touch Icon (180x180) - iOS applies rounded mask automatically, so full-bleed is required!
full_bleed_img.resize((180, 180), Image.Resampling.LANCZOS).save('public/apple-touch-icon.png', 'PNG')
full_bleed_img.resize((180, 180), Image.Resampling.LANCZOS).save('public/apple-touch-icon-precomposed.png', 'PNG')
full_bleed_img.resize((180, 180), Image.Resampling.LANCZOS).save('public/icons/apple-touch-icon.png', 'PNG')
full_bleed_img.resize((180, 180), Image.Resampling.LANCZOS).save('src/app/apple-icon.png', 'PNG')

# Maskable Icons (Android Adaptive Icon) - full bleed with safe zone
full_bleed_img.resize((192, 192), Image.Resampling.LANCZOS).save('public/icons/icon-maskable-192x192.png', 'PNG')
full_bleed_img.resize((512, 512), Image.Resampling.LANCZOS).save('public/icons/icon-maskable-512x512.png', 'PNG')

# Standard PWA Icons (Android & Desktop)
transparent_img.resize((192, 192), Image.Resampling.LANCZOS).save('public/icons/icon-192x192.png', 'PNG')
transparent_img.resize((512, 512), Image.Resampling.LANCZOS).save('public/icons/icon-512x512.png', 'PNG')

# Favicon & Next.js App Icon
transparent_img.resize((32, 32), Image.Resampling.LANCZOS).save('public/favicon.png', 'PNG')
transparent_img.resize((48, 48), Image.Resampling.LANCZOS).save('public/favicon.ico', 'ICO')
transparent_img.resize((512, 512), Image.Resampling.LANCZOS).save('src/app/icon.png', 'PNG')

print("All icons successfully generated!")

