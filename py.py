import json
import requests as req
def load_file(file_name="dump.json"):
    with open(file_name) as json_file:
        data = json.load(json_file)
        return data



def write_in_file(data, file_name="dump.json"):
    with open(file_name, "w") as f:
        json.dump(data, f, indent=4)



# r = req.post("http://www.sis.nileuniversity.edu.ng/my/loginAuth.php", data={"username": "211605045", "password": "(ENTERpassword1234)", "LogIn": "LOGIN"})
# res = r.content.decode()
# write_in_file(res)