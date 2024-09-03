```npm install && npm run dev```

Change api url in vite.config.js

### For search query
1. calling api on -> "backendURL/search" 
2. response -> json -> [{data of first result},{data of second},{},{}]

### JSON (an array of objects) must have following
```
    "id": 1,
    "title": "Main Title",
    "description": "short description like which act/law or whatever",
    "description2": "Summery",
    "date": "2024",
    "judge": "Name 1",
    "party": "1 vs 2",
    "pdf": "https://drive.google.com/file/d/1lZ3jh-rcC_kCqGSja57r-qTM_S0vvqtT/preview" 
```

###for chatbot 
1. post request on "backendUrl/ask/id" with "query"
2. we need to extract this id using use params on backend, hence we can get pdf to give to model.