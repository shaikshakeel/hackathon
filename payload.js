// send the page title as a chrome message
//chrome.runtime.sendMessage(document.title);
var url = document.URL;

if(url.includes("linkedin.com")) {
  window.scrollTo(0, document.body.scrollHeight/2)
  setTimeout(function() {
    var skillButton = document.getElementsByClassName("pv-profile-section__card-action-bar pv-skills-section__additional-skills artdeco-container-card-action-bar");
    if (document.getElementById("featured-skills-expanded") == null) {
      skillButton[0].click();
    }
    var skills = document.getElementsByClassName("pv-skill-entity__skill-name truncate Sans-15px-black-85%-semibold inline-block");
    var email = url.slice(28);
    email = email.replace('/', '');
    email = email + "@gmail.com";
    var skills = document.getElementsByClassName("pv-skill-entity__skill-name truncate Sans-15px-black-85%-semibold inline-block");
    var linkedInSkills = [];
    for (i = 0; i < skills.length; i++) {
      linkedInSkills[i] = skills[i].innerText;
    }
    var list1 = document.getElementsByClassName("pv-top-card-section__name");
    var name = list1[0].textContent;
    name = JSON.stringify(name);
    var fullname = name.split(" ");
    var firstname = fullname[0].replace('"', '');
    var lastname = fullname[1].replace('"', '');
    var named = "linkedin"

    var profilePic = document.getElementsByClassName("profile-photo-edit__preview");
    if(profilePic.length > 0) {
    	var image = document.getElementsByClassName("profile-photo-edit__preview")[0];
    	var imageSrc = image.src;
    } else {
      var image = document.getElementsByClassName("presence-entity__image EntityPhoto-circle-8")[0].style.backgroundImage
      var imageSrc = image.split('"')[1];
    }

    var message = [firstname, lastname, email, linkedInSkills, url,named,imageSrc];
    chrome.runtime.sendMessage(message);
    }, 500);
}
else if(url.includes("angel.co")) {
	var email = url.slice(17);
	email = email + "@gmail.com";
	var skills = []
	var skillSet = document.getElementsByClassName("content u-fontSize13")[0].childNodes[1]
	for (var i = 1; i < skillSet.childNodes.length; i = i + 2) {
	  var skillName = skillSet.childNodes[i].getElementsByTagName("a")[0].text;
	  skills.push(skillName);
	}
	var namePicker = document.getElementsByClassName("u-fontSize25 u-fontSize24SmOnly u-fontWeight500")[0].innerHTML
	var name = namePicker.split('<span')[0].replace('\n', '')
	var fullname = name.split(" ");
 	var firstname = fullname[0].replace('"', '');
 	var lastname = fullname[1].replace('"', '');
 	lastname = lastname.replace('\n', '')
 	var named = "angel"
 	var imageSrc = document.getElementsByClassName("js-avatar-img")[1].src;
	var message = [firstname, lastname, email, skills, url,named,imageSrc];
	chrome.runtime.sendMessage(message);
}
