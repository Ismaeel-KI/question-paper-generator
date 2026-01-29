from google import genai

client = genai.Client(api_key="AIzaSyBtEYyC6zOKjaqcLpKegBsJC88jx9YMfKQ")

for m in client.models.list():
    print(m.name)

