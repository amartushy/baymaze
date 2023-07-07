//Global Variables__________________________________________________________________
var applicationID = createID(10)
var currentUserID = ""
var videoURL = ""

var city = ""
var state = ""


let applicationForm = document.getElementById("application-form")
let successScreen = document.getElementById("success-screen")
let errorMessage = document.getElementById("error-message")

document.getElementById("submitApplication").addEventListener("click", sendApplicationToDatabase)

window.onload = function() {
    loadUserAccountInitialState()
};


function loadUserAccountInitialState() {
    //Check if user is anonymous
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            currentUserID = user.uid;

            database.collection('users').doc(currentUserID).get().then( (doc) => {
                var data = doc.data()

                accountName.innerHTML = `Hi, ${getFirstName(data.name)}`

                accountDropdown.style.display = 'block'
                createAccountHeader.style.display = 'none'

                 
            })

        } else {
            location.href = 'https://www.baymaze.com/create-account'
        }
    });
}




function sendApplicationToDatabase() {
    var today = new Date()

    var timeStamp = (today.getTime() / 1000).toString()

    var updateDict = {
        'City' : city,
        'State' : state,
        'Bio' : document.getElementById('goodFit').value,
        'Profession' : document.getElementById('profession').value,
        'Age' : document.getElementById('age').value,
        'Languages' : document.getElementById('languages').value,
        'Gender' : document.getElementById('gender').value,
        'Religion' : document.getElementById('religion').value,
        'Hobbies' : document.getElementById('hobbies').value,
        'Relationship Status' : document.getElementById('relationship').value,
        'Sexual Orientation' : document.getElementById('sexualOrientation').value,
        'dateApplied' : timeStamp,
        'profileVideo' : videoURL,
        'applicationStatus' : 'pending',
        'pricePPH' : 10.0,
        'availability' : {
            'Sunday' : 0,
            'Monday' : 0,
            'Tuesday' : 0,
            'Wednesday' : 0,
            'Thursday' : 0,
            'Friday' : 0,
            'Saturday' : 0
        }
    }

    if(updateDict.location == "") {
        errorMessage.style.display = "block"
        errorMessage.innerHTML = "Please list your city"

    } else if(updateDict.goodFit == "") {
        errorMessage.style.display = "block"
        errorMessage.innerHTML = "Please enter a bio"
        
    } else if(updateDict.profession == "") {
        errorMessage.style.display = "block"
        errorMessage.innerHTML = "Please select your profession"

    } else if(updateDict.age == "") {
        errorMessage.style.display = "block"
        errorMessage.innerHTML = "Please enter your age"

    } else if(updateDict.languages == ""){
        errorMessage.style.display = "block"
        errorMessage.innerHTML = "Please list the languages you speak"

    } else if(updateDict.gender == "") {
        errorMessage.style.display = "block"
        errorMessage.innerHTML = "Please select your gender"

    } else if(updateDict.hobbies == "") {
        errorMessage.style.display = "block"
        errorMessage.innerHTML = "Please list some of your hobbies"

    } else if(updateDict.relationship == "") {
        errorMessage.style.display = "block"
        errorMessage.innerHTML = "Please select your relationship status"

    } else if(videoURL == "") {
        errorMessage.style.display = "block"
        errorMessage.innerHTML = "Please upload a video"

    } else {
        database.collection('applications').doc(`${applicationID}`).set(updateDict)
        .then(() => {
            applicationForm.style.display = "none"
            successScreen.style.display = "flex"
    
            sendEmailData(updateDict)
    
            database.collection('users').doc(`${currentUserID}`).set(updateDict, {merge : true})
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
    }

    console.log(updateDict)
}


async function sendEmailData(data) {
    try {
      const response = await fetch("https://baymaze-4c418483a368.herokuapp.com/sendBaymazeApplication/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
  
      if (response.ok) {
        const responseData = await response.json();
        console.log("Email sent successfully:", responseData);
      } else {
        console.error("Error sending email:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }


function createID(length) {
    var result           = [];
    var characters       = 'ABCDEFGHJKMNPQRTUVWXYZ2346789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result.push(characters.charAt(Math.floor(Math.random() * 
        charactersLength)));
   }
   return result.join('');
}

//Video upload

let videoButton = document.getElementById('videoButton')
videoButton.addEventListener('click', () => {
    console.log('clicked')
    hiddenVideoUploadButton.click();
})

let videoLoading = document.getElementById("videoLoading")
videoLoading.style.display = "none"

let videoTextContainer = document.getElementById('video-text-container')
videoTextContainer.style.display = 'none'

var hiddenVideoUploadButton = document.getElementById('videoFileUpload')
hiddenVideoUploadButton.addEventListener('change', uploadVideo);

var videoFile;
function uploadVideo(e) {
    videoFile = e.target.files[0];
    videoTextContainer.innerHTML = videoFile.name
    videoLoading.style.display = "flex"

    handleVideoUpload()
}

async function handleVideoUpload() {
	const uploadTask = await storageRef.child(`videos/${applicationID}`).put(videoFile);
	uploadAndCreateVideo()
}

//final submit button and update firebase
async function uploadAndCreateVideo() {

	await storageRef.child('/videos/'+applicationID)
		.getDownloadURL()
		.then(function(url) { 
            videoURL = url.toString()
            videoTextContainer.style.display = 'block'
            videoLoading.style.display = "none"
        })
}
