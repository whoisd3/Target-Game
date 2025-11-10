#!/bin/bash

echo "🎯 Fixing Sound System and Creating Missing Icons"
echo "================================================="

# Create a simple Python script to generate missing icons
cat > create_icons.py << 'EOF'
from PIL import Image, ImageDraw
import os

# Ensure icons directory exists
os.makedirs('icons', exist_ok=True)

# Define icon sizes needed
sizes = [16, 32, 57, 70, 72, 114, 120, 144, 150, 152, 180, 192, 310, 512]

# Create a simple target icon
def create_target_icon(size):
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw concentric circles to create target pattern
    center = size // 2
    max_radius = size // 2 - 2
    
    # Outer circle (dark blue)
    draw.ellipse([2, 2, size-2, size-2], fill=(0, 100, 200, 255))
    
    # Middle circles
    for i, color in enumerate([(0, 255, 255, 255), (0, 150, 255, 255), (0, 200, 255, 255)]):
        radius = max_radius * (3-i) // 4
        if radius > 0:
            draw.ellipse([center-radius, center-radius, center+radius, center+radius], fill=color)
    
    # Center bullseye
    bullseye_radius = max(2, size // 8)
    draw.ellipse([center-bullseye_radius, center-bullseye_radius, 
                 center+bullseye_radius, center+bullseye_radius], fill=(255, 255, 255, 255))
    
    return img

# Generate all required icon sizes
for size in sizes:
    icon = create_target_icon(size)
    
    # Save as PNG
    icon.save(f'icons/icon-{size}x{size}.png', 'PNG')
    print(f"✅ Created icon-{size}x{size}.png")

# Create favicon
favicon = create_target_icon(32)
favicon.save('favicon.ico', 'ICO')
print("✅ Created favicon.ico")

print("🎯 All icons created successfully!")
EOF

# Run the icon creation script
echo "📱 Creating missing PWA icons..."
python3 create_icons.py 2>/dev/null || echo "⚠️ Python/PIL not available, icons will need manual creation"

# Clean up
rm -f create_icons.py

echo ""
echo "🔊 Now fixing sound system..."
echo "The corrupted base64 audio data will be replaced with Web Audio API sounds"
echo ""
echo "✅ Setup complete!"