# mbolden-change-web

## For frontend directory

## Components

### FiftyFifty Block

The FiftyFifty component allows you to create side-by-side layouts with images or videos alongside text content.

#### Adding Videos

The FiftyFifty component supports embedding videos from Google Drive. Here's how to set it up:

##### Prepare Your Video in Google Drive

1. **Upload your video** to Google Drive
2. **Right-click** on the video file
3. **Select "Share"**
4. **Change permissions** to "Anyone with the link can view"
5. **Copy the sharing link from top right 'share' tab** - it should look like:
   ```
   https://drive.google.com/file/d/1ABCdef123xyz789/view?usp=sharing
   ```

##### Video URL Format

✅ **Correct Google Drive URLs:**
https://drive.google.com/file/d/1ABCdef123xyz789/view?usp=sharing
https://drive.google.com/file/d/1ABCdef123xyz789/view

❌ **Incorrect URLs:**
- YouTube URLs
- Direct video file URLs
- Google Drive folder URLs
example: https://drive.google.com/drive/folders/1ZzIGcb52hD4szHX-CzFMCHM6mifl0lLP. Will Not Work