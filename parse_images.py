import urllib.request
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin

url = "https://abovefoundation.eu/low-tech-ecocamp-at-cob-greece-2024"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read()

soup = BeautifulSoup(html, 'html.parser')
for img in soup.find_all('img'):
    src = img.get('src')
    if src and ('jpg' in src or 'png' in src or 'webp' in src):
        print(urljoin(url, src))
