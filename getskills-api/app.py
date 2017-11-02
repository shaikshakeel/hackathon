from flask import Flask
from flask import request
import requests
import re
import json
import nltk
from nltk import ngrams
from nltk.tokenize import RegexpTokenizer
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
import difflib as dl
import HTMLParser
import re
from bs4 import BeautifulSoup
import itertools
from flask import jsonify
import datetime


# all over the code jd means job description

skill_set_file = open('all_linked_skills.txt').read()
all_skills = skill_set_file.split("\n")

skill_mapping = {}
for each_skill in all_skills:
    skill_mapping[each_skill.lower()] = 1


app = Flask(__name__)

def get_jd_skills(job_description, job_title):
   
    jd_skills = extract_skills_from_jd(job_description)

    return jd_skills, job_title

def data_clean(data):
    data = data.lower()
    data = BeautifulSoup(data).text
    data = ''.join(''.join(s)[:2] for _, s in itertools.groupby(data))
    data = data.replace(",", "")
    data = data.replace(".", "")
    return data

def n_grams(job_description, sequence_range):
    # n-gram is a contiguous sequence of n items(words) from a given sequence of text or speech
    result = []
    grams = list(ngrams(job_description.split(), sequence_range))
    for gram in grams:
        result.append(' '.join(gram))
    return result

def get_score(skills_of_jd, skills_of_resume):
    # This function is for calculating candidate score
    skills_of_resume = [resume_skill.lower() for resume_skill in skills_of_resume]
    diff_of_skills = set(skills_of_jd) - set(skills_of_resume)

    if len(diff_of_skills) == 0:
        return 100

    candidate_score = float(len(set(skills_of_jd)) - len(diff_of_skills)) / len(set(skills_of_jd))

    return round(candidate_score * 100, 2)


def grab_skills(jd):
    result = []
    # for trigram
    for gram in n_grams(jd, 3):
        if skill_mapping.has_key(gram.lower()):
            result.append(gram)
            jd = jd.replace(gram, "")
    # for bigram
    for gram in n_grams(jd, 2):
        if skill_mapping.has_key(gram.lower()):
            result.append(gram)
            jd = jd.replace(gram, "")
    # for unigram
    for gram in jd.split():
        if skill_mapping.has_key(gram.lower()):
            result.append(gram)
            jd = jd.replace(gram, "")

    return result

@app.route('/api/candidate_score', methods=['POST'])
def calculate_candidate_score():
    url = 'https://haiyum95-team.freshhr.com/hire/jobs/'
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization':''}
    r = requests.get(url, headers=headers)
    result = r.text.encode('utf-8')
    final_response =  json.loads(result)
    params = json.loads(request.data)
    # job_ids = params['job_ids']
    resume_skills = params['resume_skills']
    result = {}
    for job_details in final_response['jobs']:
        job_id = job_details['id']
        job_description = job_details['description']
        job_title =  job_details['title']
        jd_skills, job_title = get_jd_skills(job_description, job_title)
        score = get_score(jd_skills, resume_skills)
        result[str(job_id)] = {'job_title' : job_title, 'score' : score}

    return jsonify(result)

def extract_skills_from_jd(jd):
    cleaned_jd = data_clean(jd)
    jd_skills = grab_skills(cleaned_jd)
    return jd_skills

app.run(debug=True)
