
from bs4 import BeautifulSoup
from selenium import webdriver
import wget

# driver = webdriver.PhantomJS("/Users/user/Downloads/phantomjs-2.1.1-macosx/bin/phantomjs")
# driver.get('https://www.linkedin.com')
# print(driver.page_source)
# driver.close()

   
driver = webdriver.PhantomJS()
driver.set_window_size(1120, 550)
driver.get("https://duckduckgo.com/")
driver.find_element_by_id('search_form_input_homepage').send_keys("realpython")
driver.find_element_by_id("search_button_homepage").click()
print driver.current_url
driver.quit()

# html = driver.page_source
# soup = BeautifulSoup(html)

# # check out the docs for the kinds of things you can do with 'find_all'
# # this (untested) snippet should find tags with a specific class ID
# # see: http://www.crummy.com/software/BeautifulSoup/bs4/doc/#searching-by-css-class
# for tag in soup.find_all("a", class_="pv-profile-section__card-action-bar"):
#     print tag.text


 #app.run(debug=True)