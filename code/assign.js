/* global REVIEWER_FILE */
/* global SUBMISSION_FILE */

/*
var byName = {};
ancestry.forEach(function(person) {
  byName[person.name] = person;
});

ancestry.forEach(function(person) {
  console.log(byName[person.name]);
});
*/

// polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}

var reviewer = JSON.parse(REVIEWER_FILE);
var submission = JSON.parse(SUBMISSION_FILE);

// per reviewer
const MAXNUMBERREVIEWS = 5;
const MINNUMBERREVIEWS = 2;

var reviewers = [];
reviewer.forEach(function(entry) {
    reviewers[entry.reviewID] = entry;
    
    entry["topics"] = entry.topic.split(","); // create a "topics" array for storing each reviewer's topic
    // console.log(reviewers[entry.reviewID].topics); // list each reviewer's topics
    entry["nReview"] = 0;
});

var submissions = [];
submission.forEach(function(entry) {
    submissions[entry.submissionID] = entry;
    // console.log(submissions[entry.submissionID]);
    
    entry["topics"] = entry.topic.split(",");
    // console.log(submissions[entry.submissionID].topics); // list each submission's topics
});

// console.log("reviewers[49]: ", reviewers[49].topics);
// console.log("submissions[99]: ", submissions[99].topics);

// 1. associate submission with reviewer (as long as they fit one topic)
submission.forEach(function(entry) {
    entry["reviewers"] = [];
    submissions[entry.submissionID].topics.forEach(function(topic) {
        reviewers.forEach(function(reviewer) {
            if (reviewer.topics.includes(topic))
                   entry["reviewers"].push(reviewer.reviewID);                
        });
    });
});

// console.log(submission);

// 2. give a weighted score while associating (more fit topics higher the score)
submission.forEach(function(entry) {
    var map = {};
    var maxScore = 1;
    
    entry["reviewers"].forEach(function(reviewer) {
        if (!(reviewer in map)) {
            map[reviewer] = 1;
        }
        else {
            map[reviewer]++;
            if (maxScore < map[reviewer])
                maxScore = map[reviewer];
        }
    });
    map["maxScore"] = maxScore;
    entry["reviewers"] = map;
    // console.log(entry["reviewers"]);
});

// 3. pick the 1st and 2nd weighted reviewers for each submission (by comparing the score)
console.log("Listing result: ");
assignReview(MAXNUMBERREVIEWS);
function assignReview(maxNumReviewPerReviewer) {
    submission.forEach(function (entry) {

        var selectedReviewers = {};
        var n = 1;
        var maxScore = entry["reviewers"].maxScore;

        function findReviewer() {
            for (var i in entry["reviewers"]) {
                if (i != 'maxScore') {
                    if (entry["reviewers"][i] == maxScore) {
                        if (reviewers[i]["nReview"] < maxNumReviewPerReviewer) {
                            selectedReviewers[n++] = i;
                            reviewers[i]["nReview"]++;
                        }
                    }
                    // console.log(Object.keys(selectedReviewers).length);
                    if (Object.keys(selectedReviewers).length == 2)
                        break;
                }
            }
        }

        do {
            findReviewer();
            maxScore--;
            if (maxScore == 0)
                break;
        } while (Object.keys(selectedReviewers).length < 2);

        entry["selectedReviewers"] = selectedReviewers;
        console.log(entry.submissionID,": ", entry["selectedReviewers"]);
    });
}

// console.log(reviewers);

// 4. make sure every reviewer has at least 1 or 2 associations (check the number of association of each reviewer) 
// -> assign them submission according to their highest association score by replacing other reviewers (lower score first)
console.log("\nShowing reviewer with less than " + MINNUMBERREVIEWS + " reviews: ");
reviewer.forEach(function (entry) {
    //console.log(entry["nReview"]);
    var map = {};
    var maxScore = 1;
    
    if (entry["nReview"] < MINNUMBERREVIEWS) {
        console.log(entry);
    }
});
console.log();

/*
// reverse step 1 to 3
// 1. associate reviewer with submission (as long as they fit one topic)
reviewer.forEach(function(entry) {
    entry["submissions"] = [];
    reviewers[entry.reviewID].topics.forEach(function(topic) {
        submissions.forEach(function(submission) {
            if (submission.topics.includes(topic))
                   entry["submissions"].push(submission.submissionID);                
        });
    });
});
// 2. give a weighted score while associating (more fit topics higher the score)
reviewer.forEach(function(entry) {
    var map = {};
    var maxScore = 1;
    
    entry["submissions"].forEach(function(submission) {
        if (!(submission in map)) {
            map[submission] = 1;
        }
        else {
            map[submission]++;
            if (maxScore < map[submission])
                maxScore = map[submission];
        }
    });
    map["maxScore"] = maxScore;
    entry["submissions"] = map;
    console.log(entry["submissions"]);
});
*/