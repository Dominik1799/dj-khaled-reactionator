import { NextResponse } from "next/server";



export async function POST(request) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const files = formData.getAll("gifs");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const API_URL = process.env.GIF_API_URL;
    const results = [];

    // Upload files one by one, sleep for 1 second between each upload
    for (const file of files) {
      const singleFileFormData = new FormData();
      singleFileFormData.append("gifs", file);
      // console log a simple progress bar
      console.log("Uploading file: " + file.name);
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: singleFileFormData,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!response.ok) {
        throw new Error(
          `API responded with status: ${response.status} for file: ${file.name}`
        );
      }

      results.push({
        fileName: file.name,
        status: "success",
      });
    }

    return NextResponse.json({
      message: "GIFs uploaded successfully",
      results: results,
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 400 }
    );
  }
}
