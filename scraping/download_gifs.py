import requests
import os
from dotenv import load_dotenv
import time
import json

load_dotenv()

QUERY = "df khaled"
TOTAL_GIFS = 500
GIFS_SAVE_DIR = "./initial_gif_download-medium"
GIFS_METADATA_FILE = "gif_metadata.jsonl"

# makes request to tenor api and parser the response object to custom dict
# doc: https://developers.google.com/tenor/guides/endpoints
def get_gifs(query, pos='', limit=50) -> tuple[list[dict], str]:
    api_key = os.environ.get("TENOR_API_KEY")
    url = "https://tenor.googleapis.com/v2/search"
    params = {
        "q": query,
        "key": api_key,
        "limit": limit,
        "media_filter": "mediumgif"
    }
    if pos != '':
        params["pos"] = pos
    
    response = requests.get(url, params=params)
    search_results = []
    next_pos = ''
    if response.status_code == 200:
        data = response.json()
        next_pos = data["next"]
        for r in data["results"]:
            search_results.append({
                "tenor_id": r["id"],
                "tags": r["tags"],
                "title": r["title"],
                "description": r["content_description"],
                "url": r["media_formats"]["mediumgif"]["url"]
            })
        return search_results, next_pos
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return []

# gathers initial data - gif metadata and download links
def gather_initial_data(query: str, total_gifs: int) -> list[dict]:
    all_gifs: list[dict] = []
    next_pos = ''
    while True:
        gifs, next_pos = get_gifs(query, pos=next_pos, limit=50)
        if gifs:
            all_gifs.extend(gifs)
        if next_pos == '' or len(all_gifs) >= total_gifs:
            break
    print(f"Found: {len(all_gifs)} dj khaled gifs.")
    return all_gifs
    
# downloads and saves gif to specified dest_dir. Also generates a file name that is returned back
# example URL structure: https://media.tenor.com/5nijHo1ghdgAAAAC/ip-grabber-ip-grab.gif
def download_and_save_single_gif(gif_url: str, dest_dir: str) -> str | None:
    try:
        response = requests.get(gif_url, stream=True)
        response.raise_for_status()  # Raise an error for failed requests
        
        url_parts = gif_url.split("/")
        # filename is id present in url combined with resource name to prevent duplicates. See example url structure above
        filename = url_parts[-2] + "_" + url_parts[-1]
        
        # Ensure the filename has a .gif extension
        if not filename.lower().endswith(".gif"):
            filename += ".gif"
        
        # Create destination path
        os.makedirs(dest_dir, exist_ok=True)
        file_path = os.path.join(dest_dir, filename)
        
        # Save the GIF
        with open(file_path, "wb") as file:
            for chunk in response.iter_content(1024):
                file.write(chunk)
        
        return os.path.abspath(file_path)
    except requests.RequestException as e:
        print(f"Error downloading GIF: {e}")
        return None

# download gifs from links present in data list + modify each record with local path to the downloaded gif
def download_gifs(data: list[dict], dest_dir: str) -> list[dict]:
    for i in range(0, len(data)):
        print(f"Processing {i+1} / {len(data)}")
        d = data[i]
        file_name = download_and_save_single_gif(d["url"], dest_dir)
        # delay next request to not get banned
        time.sleep(1)
        if file_name is None:
            continue
        data[i]["downloaded_file_path"] = file_name
    return data


if __name__ == "__main__":
    initial_data = gather_initial_data(QUERY, TOTAL_GIFS)
    data_with_paths = download_gifs(initial_data, GIFS_SAVE_DIR)
    # save metadata
    with open(GIFS_METADATA_FILE, 'w', encoding='utf-8') as f:
        for item in data_with_paths:
            json.dump(item,f ,ensure_ascii=False)
            f.write("\n")