# 🎁 Customize Your Friend's Birthday Wish Website

This website has been built as a highly animated, mobile-responsive Single Page Application (SPA). To make it personal for your close friend, you can easily replace the default watercolor images and add her favorite song.

Here is a quick guide on how to customize it:

---

## 📸 1. Replacing the Photos

All images are stored in the [images/](file:///e:/A-%20Z%20project/Portfolio/birthday-wish/images/) folder. To replace them, rename your friend's photos to match the filenames below and copy them into that folder (overwriting the defaults):

### ✉️ Page 2: Sealed Envelopes (2 Photos)
These photos appear inside the sealed envelopes. For best results, use **landscape (horizontal)** aspect ratio photos (e.g., 4:3 or 16:9).
- **Photo 1**: `birthday_cake.png` (displays in the left envelope)
- **Photo 2**: `birthday_balloons.png` (displays in the right envelope)
*Note: You can use JPG or WebP images too! Just open `index.html` and search for these filenames to change the extensions if needed.*

### 🚀 Page 3: Hidden Roaming Memories (2 Photos)
These photos start hidden, then burst and bounce around the screen before settling. We recommend **portrait (vertical)** aspect ratio photos.
- **Photo 3**: `flower_bouquet.png` (first bouncing photo)
- **Photo 4**: `gift_box.png` (second bouncing photo)

### 🌟 Page 4: Grand Finale (1 Big Portrait Photo)
This is the main, high-resolution photo of your friend displayed in the center of the wishes card.
- **Photo 5**: `friend_portrait.png` (large portrait photo)

---

## 🎵 2. Adding the Birthday Song

The music player is styled as a vintage vinyl record player. 
1. Get a custom MP3 recording or her favorite song.
2. Rename the file to `birthday-song.mp3`.
3. Save it inside the [music/](file:///e:/A-%20Z%20project/Portfolio/birthday-wish/music/) folder.

### 🔔 What if you don't add a song?
The website has a built-in **Web Audio API Sound Synthesizer**. If the browser detects that `birthday-song.mp3` is missing, clicking **Play** will automatically activate a music-box style synthesizer that plays a sweet chimes rendition of "Happy Birthday to You". 

---

## ✍️ 3. Changing the Written Wishes & Quotes

If you want to edit the written letter or the quotes, open the [index.html](file:///e:/A-%20Z%20project/Portfolio/birthday-wish/index.html) file in a text editor (like Notepad, VS Code) and edit the text inside these elements:

- **Page 1 (Dearest Friend message)**: Edit lines 42-45.
- **Page 2 (Friendship Quote)**: Edit lines 56-58.
- **Page 3 (Memory Quote)**: Edit lines 112-114.
- **Page 4 (Main Birthday Letter)**: Edit lines 162-171.

---

## 🚀 4. How to View and Run the Site

Simply open the [index.html](file:///e:/A-%20Z%20project/Portfolio/birthday-wish/index.html) file directly in any web browser (Chrome, Edge, Safari, Firefox) to view it! It is fully mobile responsive and touch-friendly.
