import urllib2
from lxml import html
import requests
from flask.json import jsonify

from flask import Flask


app = Flask(__name__)

@app.route('/getlinkedinskills/api', methods=['GET'])
def get_skills():
	page = requests.get('https://www.linkedin.com/in/fathima-khazana-76aba2117/.html')
	tree = html.fromstring(page.content)
	skills = tree.xpath('//div[@class="pv-skill-entity--featured"]/text()')
	print(page.status_code)
	return 'khaz'

app.run(debug=True)