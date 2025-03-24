api functions:


1. POST /upload - DONE

upload 1 or more gifs to the db, without metadata

2. GET /search?query=${text}

semantically search saved gifs via their metadata

3. PUT /gif/{id}?name=\${text_list}\&description=\${text} - DONE

update gif metadata

4. GET /gif - DONE

get all gifs

5. GET /gif/{id} - DONE

get specific gif