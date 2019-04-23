import time
import requests
import json
import bs4 
import re

#List of sites to parse
links = ["https://registrar.olemiss.edu/fall-",
         "https://registrar.olemiss.edu/first-fall-term-",
         "https://registrar.olemiss.edu/second-fall-term-",
         "https://registrar.olemiss.edu/winter-intersession-",
         "https://registrar.olemiss.edu/spring-",
         "https://registrar.olemiss.edu/first-spring-term-",
         "https://registrar.olemiss.edu/second-spring-term-",
         "https://registrar.olemiss.edu/may-intersession-",
         "https://registrar.olemiss.edu/full-summer-term-",
         "https://registrar.olemiss.edu/first-summer-term-",
         "https://registrar.olemiss.edu/second-summer-term-",
         "https://registrar.olemiss.edu/august-intersession-"]

semester = ["Fall", "First Fall Term", "Second Fall Term", "Winter Intersession",
            "Spring", "First Spring Term", "Second Spring Term", "May Intersession",
            "Full Summer Term", "First Summer Term", "Second Summer Term", 
            "August Intersession"]

year = time.strftime("%Y")
month = time.strftime("%m")

for x in range(len(links)):
    if x < 3:
        links[x] = links[x]+year
    else:
        yearInt = int(year)+1
        links[x] =  links[x]+str(yearInt)

#Parse Ole Miss Academic Calendar
data = {}
data["academicCal"] = []
x = 0

for link in links:
    response = requests.get(link)
    soup = bs4.BeautifulSoup(response.text,"lxml")
    
    for tr in soup.findAll('tr'):
        if not "Date(s)" in tr.text:
            event = tr.text.split("\n")
            oneEvent = re.sub(' +',' ',event[3])
            oneEvent = re.sub("[^a-zA-Z]+", " ", oneEvent)

            date = event[1].replace("-", " - ")
            date = date.replace("–", "-")
            date = re.sub(' +',' ',date)
            
            item = {'Event': oneEvent, \
                    'Date': date, \
                    'Semester': semester[x]
                    }
            
            item = {"Item": item}
            data["academicCal"].append(item)
    x = x + 1

with open('academicCal.json', 'w') as f:
  json.dump(data, f, ensure_ascii=False)
    