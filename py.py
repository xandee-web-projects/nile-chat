import requests as req
import json

def load_file(file_name="data.json"):
    with open(file_name) as json_file:
        data = json.load(json_file)
        return data

def write_in_file(data, file_name="data.json"):
    with open(file_name, "w") as f:
        json.dump(data, f, indent=4)

# r = req.post("http://www.sis.nileuniversity.edu.ng/my/loginAuth.php", data={"username": "211605045", "password": "(ENTERpassword1234)", "LogIn": "LOGIN"})
# res = r.content.decode()
# if res.find("incorrect") == -1:
#     write_in_file(res)
res = load_file()
str_to_find = 'Department</td><td bgcolor="#F4F5F7">'
idx = res.find(str_to_find)+len(str_to_find)
text = res[idx:idx+40].replace("</td></tr>", "")
depts = load_file('departments.json')
dept_name = None
for i in depts:
    n = i.split()[0]
    if text.startswith(n):
        dept_name = text
        break
if dept_name:    

