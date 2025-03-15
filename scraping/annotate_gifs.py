import os
import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk, ImageSequence
import glob

GIFS_METADATA_FILE = "gif_metadata.jsonl"

class GifTextApp:
    def __init__(self, root, gif_folder):
        self.root = root
        self.gif_folder = gif_folder
        self.gif_files = glob.glob(os.path.join(gif_folder, "*.gif"))
        self.gif_index = 0
        self.frames = []
        self.current_frame = 0
        self.animation_delay = 100  # Delay between frames in milliseconds

        # Set up the main window
        self.root.title("DJ khaled tagging")
        self.root.geometry("1000x1000")

        # Set up the image label
        self.image_label = tk.Label(root)
        self.image_label.pack(pady=20)

        # Set up the text entry box
        self.text_entry = tk.Entry(root, width=50)
        self.text_entry.pack(pady=20)
        self.text_entry.bind("<Return>", self.on_enter)

        # Display the first GIF
        self.display_next_gif()

    def display_next_gif(self):
        if self.gif_index < len(self.gif_files):
            gif_path = self.gif_files[self.gif_index]
            gif = Image.open(gif_path)

            # Load frames of the GIF
            self.frames = [ImageTk.PhotoImage(frame.copy()) for frame in ImageSequence.Iterator(gif)]
            self.gif_index += 1

            # Start the animation
            self.current_frame = 0
            self.animate_gif()

        else:
            print("All GIFs have been displayed.")
            self.root.quit()

    def animate_gif(self):
        if self.frames:
            # Update the image with the next frame
            self.image_label.config(image=self.frames[self.current_frame])
            self.image_label.image = self.frames[self.current_frame]

            # Update frame index for the next frame
            self.current_frame = (self.current_frame + 1) % len(self.frames)
            
            # Call this method again after a delay to create the animation effect
            self.root.after(self.animation_delay, self.animate_gif)

    def on_enter(self, event):
        text = self.text_entry.get()
        if text is not None:
            print(text)  # Print text to stdout
            self.text_entry.delete(0, tk.END)  # Clear the text box
            self.display_next_gif()  # Display the next gif

def select_directory():
    folder_selected = filedialog.askdirectory()
    return folder_selected

if __name__ == "__main__":
    # Ask user for directory
    gif_folder = select_directory()
    if not gif_folder:
        print("No folder selected, exiting...")
        exit()

    # Create the root window
    root = tk.Tk()
    app = GifTextApp(root, gif_folder)
    root.mainloop()
