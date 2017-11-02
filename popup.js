// Inject the payload.js script into the current tab after the popout has loaded
// window.addEventListener('load', function (evt) {
//   chrome.extension.getBackgroundPage().chrome.tabs.executeScript(null, {
//     file: 'payload.js'
//   });;
// });

document.addEventListener("DOMContentLoaded", function () {
  chrome.tabs.executeScript(null, {
    file: "payload.js"
  });
});

// Listen to messages from the payload.js script and write to popout.html
chrome.runtime.onMessage.addListener(function (message) {
  barChart();

  $(window).resize(function(){
      barChart();
  });

  function barChart(){
    $('.bar-chart').find('.item-progress').each(function(){
        var itemProgress = $(this),
        itemProgressWidth = $(this).parent().width() * ($(this).data('percent') / 100);
        itemProgress.css('width', itemProgressWidth);
    });
  };
  var firstname = message[0];
  var lastname = message[1];
  var email = message[2];
  var linkedInSkills = message[3];
  var tabUrl = message[4];
  var named = message[5];
  var imageURL = message[6];
  var scoreResponse = {};
  var scoringUrl = "http://localhost:5000/api/candidate_score";
  var headerHtml = "<div class='row'><div class='col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4'><div class='bar-chart'><div class='legend'><div class='item'><h4>Unfit</h4></div><div class='item'><h4>OK</h4></div><div class='item text-right'><h4>Good</h4></div><div class='item text-right'><h4>Best</h4></div></div><div class='chart clearfix'>";
  var footerHtml = "</div></div></div></div>";

  document.getElementById('firstname').setAttribute('value', firstname);
  document.getElementById('lastname').setAttribute('value', lastname);
  document.getElementById('email').setAttribute('value', email);
  document.getElementById('profile_pic').setAttribute('src', imageURL);

  $(document).ready(function() {
    var config = {
      "async": true,
      "crossDomain": true,
      "url": "https://haiyum95-team.freshhr.com/hire/jobs",
      "method": "GET",
      "headers": {
        "content-type": "application/json",
        "accept": "application/json",
        'Access-Control-Allow-Origin':'https://haiyum95-team.freshhr.com/hire/jobs',
        "authorization": "",
      },
    }

    var dropDown_button = document.getElementById('dropdown');
    $.ajax(config).done(function (response) {
      var quantities = {};
      var objects = {};
      response.jobs.forEach(function (job) {
        if(job.status != "5")
          dropDown_button.options[dropDown_button.options.length] = new Option(job.title, job.id);
      });
      $.ajax({
        "url": scoringUrl,
        "method": "POST",
        "headers": {
          "content-type": "application/json",
          "accept": "application/json",
        },
        "processData": false,
        "data": JSON.stringify({
          "resume_skills": linkedInSkills
        }),
        success: function(response) {
          document.getElementById('score_board').style.display = 'none';
          document.getElementById('loader').style.display = 'none';
          // document.getElementById('initial_score').innerHTML = "<div class='w3-card text-center' style='text-transform:uppercase;'><b>Scores are ready...</b></div>";
          document.getElementById('scores').style.display = 'block';
          scoreResponse = response;
        },
        error: function (xhr, ajaxOptions, thrownError) {
          chrome.extension.getBackgroundPage().console.log('score calculation api error');
        }
      });
    });

    $('#all_scores').click(function() {
      // if (document.getElementById('initial_score')) {
      //   document.getElementById('initial_score').style.display = 'none';
      // }
      var recordBarsHtml = '';
      var title = '';
      Object.keys(scoreResponse).forEach(function (key) {
        if (scoreResponse[key].job_title.length > 20) {
          title = scoreResponse[key].job_title.toString().substr(0,23) + '...';
        } else {
          title = scoreResponse[key].job_title.toString();
        }
        recordBarsHtml += "<div class='item'><div class='bar'><span class='percent'>"
                          +
                          scoreResponse[key].score.toString()
                          +
                          "%</span><div class='item-progress' data-percent="
                          +
                          scoreResponse[key].score.toString()
                          +
                          "><span class='title'>"
                          +
                          title
                          +
                          "</span></div></div></div>"
      })
      document.getElementById('score_board').style.display = 'block';
      document.getElementById('score_board').innerHTML = headerHtml
                                                         +
                                                         recordBarsHtml
                                                         +
                                                         footerHtml;
      document.getElementById('job_suggestion').style.display = 'none';
      barChart();
    });

    $('#fetch_score').click(function() {
      // if (document.getElementById('initial_score')) {
      //   document.getElementById('initial_score').style.display = 'none';
      // }
      function generateChart(response) {
        var preSelectedJobId = $("#dropdown").val();
        var preSelectedJobDetails = response[preSelectedJobId];

        var maxScore = -1;
        var maxScoreObjectId = -1;
        var particularJobScoreHtml = "";
        var title = '';
        Object.keys(response).forEach(function (key) {
          if (maxScore < response[key].score) {
            maxScore = response[key].score;
            maxScoreObjectId = key;
          }
        })

        if (preSelectedJobDetails.job_title.length > 20) {
          title = preSelectedJobDetails.job_title.toString().substr(0,23) + '...';
        } else {
          title = preSelectedJobDetails.job_title.toString();
        }
        particularJobScoreHtml = headerHtml
                                 +
                                 "<div class='item w3-card'><div class='bar'><span class='percent'>"
                                 +
                                 preSelectedJobDetails.score.toString()
                                 +
                                 "%</span><div class='item-progress' data-percent="
                                 +
                                 preSelectedJobDetails.score.toString()
                                 +
                                 "><span class='title'>"
                                 +
                                 title
                                 +
                                 "</span></div></div></div>"
                                 +
                                 footerHtml
        document.getElementById('score_board').style.display = 'block';
        document.getElementById('score_board').innerHTML = particularJobScoreHtml;
        barChart();

        if ((maxScoreObjectId !=  preSelectedJobId) && (maxScore != 0)) {
          document.getElementById('job_suggestion').style.display = 'block';
          document.getElementById('job_suggestion').innerHTML = "<span style='font-size:10px' class='text-center'>Hey, Candidate is more suitable for <br><b style='font-size:15px'>" + response[maxScoreObjectId].job_title + "</b></span>";
        } else {
          document.getElementById('job_suggestion').style.display = 'none';
        }
      }
      generateChart(scoreResponse);
    });

    $('#mode').click(function() {
      var selectedjobId = $("#dropdown").val();
      var selectedMode = $("#dropDown").val();

      function tempAlert(msg, duration) {
        var color;
        if(msg == "{\"errors\":{\"lead.email\":[\"has already been taken\"]}}")
          {
            msg = "This email already exists, please use another email.";
            color = "#C11D41";
          }
          else
          {
             color = "#1DC133";
          }
          var el = document.createElement("div");
          el.setAttribute("style", "background-color:white;width:100%;height:5%;border:1px solid white;font-size:15px;font-weight:600");

        el.innerHTML = msg;
        el.style.color = color;
        setTimeout(function () {
          el.parentNode.removeChild(el);
        }, duration);
        document.body.appendChild(el);
      }

      if(selectedMode == "Referral") {
        var url = "https://haiyum95-team.freshhr.com/hire/jobs/"+selectedjobId+"/applicants";
        var settings1 = {
          "async": true,
          "crossDomain": true,
          "url": url,
          "method": "POST",
          "headers": {
            "content-type": "application/json",
            "accept": "application/json",
            'Access-Control-Allow-Origin': url,
            "authorization": "",
            "cache-control": "no-cache",
          },
          "processData": false,
          "data": JSON.stringify({
            "applicant": {
              "job_id": selectedjobId,
              "stage_id": "72263",
              "lead_attributes": {
                "first_name": document.getElementById('firstname').value,
                "last_name": document.getElementById('lastname').value,
                "email": document.getElementById('email').value,
                "source_id": "6033",
                "medium_id":"8182",
                "profile_links": [{
                  "url": tabUrl,
                  "name": named
                }]
              }
            }
          }),
        }

        $.ajax(settings1).done(function (response) {
          tempAlert("Candidate Added!", 5000);
        }).fail(function (response){
          tempAlert(response.responseText, 5000);
        });
      }

      else {
        var url = "https://haiyum95-team.freshhr.com/hire/jobs/"+selectedjobId+"/applicants";
        var settings2 = {
          "async": true,
          "crossDomain": true,
          "url": url,
          "method": "POST",
          "headers": {
            "content-type": "application/json",
            "accept": "application/json",
            'Access-Control-Allow-Origin': url,
            "authorization": "",
            "cache-control": "no-cache",
          },
          "processData": false,
          "data": JSON.stringify({
            "applicant": {
              "job_id": selectedjobId,
              "stage_id": "72263",
              "lead_attributes": {
                "first_name": firstname,
                "last_name": lastname,
                "email": email,
                "source_id": "6033",
                "medium_id":"8182",
                "profile_links": [{
                  "url": tabUrl,
                  "name": named
                }]
              }
            }
          }),
        }

        $.ajax(settings2).done(function (response) {
          var obj = response;
          var appID = obj.applicant.id;
          var leadID = obj.applicant.lead_id;
          var url = "https://haiyum95-team.freshhr.com/hire/applicants/"+appID+"/archive";
          var settings = {
            "async": true,
            "crossDomain": true,
            "url": url,
            "method": "PUT",
            "headers": {
              "content-type": "application/json",
              "accept": "application/json",
              'Access-Control-Allow-Origin': url,
              "authorization": "",
              "cache-control": "no-cache",
            },
            "processData": false,
            "data": JSON.stringify({
              "applicant": {
                "lead_attributes": {
                  "id":leadID ,
                  "prospect_attributes": [{
                    "job_role_id": "22465",
                    "lead_id":leadID
                  }]
                }
              }
            })
          }
            $.ajax(settings).done(function (response) {
              chrome.extension.getBackgroundPage().console.log('talent pool success');
              tempAlert("Candidate Added To Talent Pool!", 5000);
            }).fail(function (error) {
              chrome.extension.getBackgroundPage().console.log('talent pool fail');
              tempAlert(response.responseText, 5000);
           });
        }).fail(function(error){
          chrome.extension.getBackgroundPage().console.log('applicant fail');
        });


      }
    });
  });
});
