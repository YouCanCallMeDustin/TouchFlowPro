import requests
import json

urls = [
    "https://touchflowpro.com/",
    "https://touchflowpro.com/free-typing-test",
    "https://touchflowpro.com/medical-track",
    "https://touchflowpro.com/legal-track",
    "https://touchflowpro.com/coding-track",
    "https://touchflowpro.com/bible-practice",
    "https://touchflowpro.com/about",
    "https://touchflowpro.com/articles",
    "https://touchflowpro.com/contact",
    "https://touchflowpro.com/faq",
    "https://touchflowpro.com/pricing",
    "https://touchflowpro.com/assessment",
    "https://touchflowpro.com/privacy-policy",
    "https://touchflowpro.com/terms",
    "https://touchflowpro.com/articles/touchflow-vs-monkeytype",
    "https://touchflowpro.com/articles/typing-speed-averages",
    "https://touchflowpro.com/articles/ultimate-guide-to-typing-speed",
    "https://touchflowpro.com/articles/how-to-type-faster",
    "https://touchflowpro.com/articles/typing-speed-plateau",
    "https://touchflowpro.com/articles/60-wpm-to-100-wpm",
    "https://touchflowpro.com/articles/type-faster-accurately",
    "https://touchflowpro.com/articles/touch-typing-guide",
    "https://touchflowpro.com/articles/typing-speed-test",
    "https://touchflowpro.com/articles/fastest-typing-techniques",
    "https://touchflowpro.com/articles/typing-practice",
    "https://touchflowpro.com/articles/improve-typing-speed",
    "https://touchflowpro.com/articles/typing-accuracy",
    "https://touchflowpro.com/articles/typing-platform-for-beginners",
    "https://touchflowpro.com/articles/best-typing-platforms-2026",
    "https://touchflowpro.com/articles/typing-speed-for-lawyers",
    "https://touchflowpro.com/articles/icd-10-typing-practice",
    "https://touchflowpro.com/articles/vs-code-typing-hacks"
]

data = {
    "host": "touchflowpro.com",
    "key": "2abfda58abd0480aa668dd43578e1700",
    "keyLocation": "https://touchflowpro.com/2abfda58abd0480aa668dd43578e1700.txt",
    "urlList": urls
}

headers = {
    "Content-Type": "application/json; charset=utf-8"
}

response = requests.post("https://www.bing.com/indexnow", headers=headers, data=json.dumps(data))

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
