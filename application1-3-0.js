//Global Variables__________________________________________________________________
var applicationID = createID(10)
var currentUserID = ""
var videoURL = ""
var profilePhoto = ""

var city = ""
var state = ""


let applicationForm = document.getElementById("application-form")
let successScreen = document.getElementById("success-screen")
let errorMessage = document.getElementById("error-message")

let cityDurationBlock = document.getElementById("city-duration-block")
let cityDurationText = document.getElementById("city-duration-text")
let cityDurationField = document.getElementById("city-duration-field")

let optionalDropdown = document.getElementById("optional-dropdown")
let optionalDropdownItems = document.getElementById("optional-dropdown-items")
optionalDropdownItems.style.display = "none"


optionalDropdown.addEventListener('click', () => {
    if (optionalDropdownItems.style.display == "none") {
        $('#optional-dropdown-items').fadeIn(400, () => {
            optionalDropdownItems.style.display == "block"
        })
        
    } else {
        $('#optional-dropdown-items').fadeOut(400, () => {
            optionalDropdownItems.style.display == "none"

        })
    }
})

document.getElementById("submitApplication").addEventListener("click", sendApplicationToDatabase)

window.onload = function() {
    let hobbiesItems = document.getElementsByClassName("hobbiesitem");
    let languageItems = document.getElementsByClassName("languagesitem");

    for (let i = 0; i < hobbiesItems.length; i++) {
        hobbiesItems[i].addEventListener("click", selectHobby);
    }

    for (let i = 0; i < languageItems.length; i++) {
        languageItems[i].addEventListener("click", selectLanguage);
    }

    loadUserAccountInitialState()
};


function loadUserAccountInitialState() {
    //Check if user is anonymous
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            currentUserID = user.uid;
            console.log("test", currentUserID)
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
        'Duration' : document.getElementById('city-duration-years').value,
        'DurationMonths' : document.getElementById('city-duration-months').value,
        'Age' : document.getElementById('age').value,
        'Languages' : languages,
        'Gender' : document.getElementById('gender').value,
        'Religion' : document.getElementById('religion').value,
        'Hobbies' : hobbies,
        'Politics' : document.getElementById('politics').value,
        'Profession' : document.getElementById('profession').value,
        'Relationship Status' : document.getElementById('relationship').value,
        'Sexual Orientation' : document.getElementById('sexualOrientation').value,
        'dateApplied' : timeStamp,
        'profilePhoto' : profilePhoto,
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
        },
        'Work Environment' : document.getElementById('workEnvironment').value

    }

    if(updateDict.City == "") {
        errorMessage.style.display = "block"
        errorMessage.innerHTML = "Please list your city"

    } else if(updateDict.Duration == "") {
        errorMessage.style.display = "block"
        errorMessage.innerHTML = "Please enter how long you've lived in this city"
        
    } else if(updateDict.Bio == "") {
        errorMessage.style.display = "block"
        errorMessage.innerHTML = "Please enter a bio"
        
    } else if(updateDict.Age == "") {
        errorMessage.style.display = "block"
        errorMessage.innerHTML = "Please enter your age"

    } else {
        database.collection('users').doc(`${currentUserID}`).set(updateDict, {merge : true}).then(() => {
            applicationForm.style.display = "none"
            successScreen.style.display = "flex"

            let emailDict = {
                'City' : city,
                'State' : state,
                'Bio' : document.getElementById('goodFit').value,
                'Duration' : document.getElementById('city-duration-years').value,
                'DurationMonths' : document.getElementById('city-duration-months').value,
                'Age' : document.getElementById('age').value,
                'Gender' : document.getElementById('gender').value,
                'Religion' : document.getElementById('religion').value,
                'Politics' : document.getElementById('politics').value,
                'Profession' : document.getElementById('profession').value,
                'Relationship Status' : document.getElementById('relationship').value,
                'Sexual Orientation' : document.getElementById('sexualOrientation').value,
                'dateApplied' : timeStamp,
                'profilePhoto' : profilePhoto,
                'profileVideo' : videoURL,
                'Work Environment' : document.getElementById('workEnvironment').value
            }
            sendEmailData(emailDict)
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





//Search bar


//Disable header form
$('#city-search-form').submit(function() {
    return false;
});


//Header Search Container
const citySearchResults = document.getElementById('city-search-results')
citySearchResults.style.display = 'none'

const cityStateText = document.getElementById('cityStateText')
cityStateText.style.display = 'none'

//Algolia  
const searchClient = algoliasearch('88VNJUJA58', 'fdb7b8494c49048d04a5dfdcaca9c52d');

const headerSearch = instantsearch({
    indexName: 'baymaze_cities',
    searchClient,
    getSearchParams() {
        return {
          hitsPerPage: 10,
        }
    }
});



function createAutocompleteResults(results) {

    let hitsContainer = document.createElement('div')
    hitsContainer.className = 'city-search-results'

    if(results.hits.length != 0) {
        for (i = 0; i < (results.hits.length < 5 ? results.hits.length : 5); i++) {

            var hit = results.hits[i]
    
            let headerAutocompleteResult = document.createElement('div')
            headerAutocompleteResult.className = 'header-autocomplete-result'

            headerAutocompleteResult.setAttribute('onClick', `addCityForUser("${hit.cityName}", "${hit.state}")`)
            hitsContainer.appendChild(headerAutocompleteResult)
        
            let headerResultInfoDiv = createDOMElement('div', 'header-result-info-div', 'none', headerAutocompleteResult)
            createDOMElement('div', 'header-result-title', hit.cityName, headerResultInfoDiv)
            createDOMElement('div', 'header-result-price',hit.state, headerResultInfoDiv)
    
            if (i != 4) {
                createDOMElement('div', 'header-autocomplete-divider', 'none', hitsContainer)
            }
        }
    } else {
        citySearchResults.style.display = 'none'
    }

    return hitsContainer.outerHTML
}

function addCityForUser(cityString, stateString) {

    city = cityString
    state = stateString

    console.log(city)
    console.log(state)

    citySearchResults.style.display = 'none'

    cityStateText.style.display = 'block'
    cityStateText.innerHTML = `${city}, ${state}`

    cityDurationBlock.style.display = 'block'
    cityDurationText.innerHTML = `How long have you lived in ${city}, ${state}?`
}

// Create the render function
const headerRenderAutocomplete = (renderOptions, isFirstRender) => {
  const { indices, currentRefinement, refine, widgetParams } = renderOptions;

  if (isFirstRender) {
    const input = document.querySelector('#city-search-field');

    input.addEventListener('input', event => {
        refine(event.currentTarget.value);

        if(citySearchResults.style.display == 'none') {
            $('#city-search-results').fadeIn(200).css('display', 'block')
        }

        if(event.currentTarget.value == '') {
            $('#city-search-results').fadeOut(200)
        }
    });
  }

  document.querySelector('#city-search-field').value = currentRefinement;
  widgetParams.container.innerHTML = indices
    .map(createAutocompleteResults)
    .join('');
};

// Create the custom widget
const headerCustomAutocomplete = instantsearch.connectors.connectAutocomplete(
    headerRenderAutocomplete
);

// Instantiate the custom widget
headerSearch.addWidgets([
    
    headerCustomAutocomplete({
    container: document.querySelector('#city-search-results'),
  })
  
]);

headerSearch.start()


//Hide results if clicked outside
window.addEventListener('click', function(e){   
    if (document.getElementById('city-search-results').contains(e.target)){
      // Clicked in box
    } else{
      // Clicked outside the box
      $('#city-search-results').fadeOut()
    }
});



function createDOMElement(type, classStr, text, parentElement) {
    let DOMElement = document.createElement(`${type}`)
    DOMElement.className = classStr
  
    if(text != 'none') {
      DOMElement.innerHTML = text
    }
  
    if(parentElement != 'none') {
      parentElement.appendChild(DOMElement)
    }
  
    return(DOMElement)
}




//Hobbies Dropdown
let hobbiesDropdown = document.getElementById('hobbies-dropdown')
let hobbiesContainer = document.getElementById('hobbies-container')
hobbiesContainer.style.display = 'none'

hobbiesDropdown.addEventListener('click', () => {
    hobbiesContainer.style.display = 'block'
    
})


let hobbies = [];

let availableHobbies = ["Reading", "Blogging", "Dancing", "Singing", "Music", "Playing an Instrument", "Learning new languages", "Shopping", "Traveling", "Hiking", "Cycling", "Exercising", "Drawing", "Painting", "Collecting Things", "Gaming", "Cooking", "Baking", "Gardening", "Crafts", "Embroidering", "Sewing", "Knitting", "Board Games", "Walking", "Writing", "Fishing", "Photography", "Skydiving", "Skating", "Skiing", "Roller skating", "Longboarding", "Surfing"];

function selectHobby() {
    let hobby = this.innerText;

    if (availableHobbies.includes(hobby)) {
        if (hobbies.includes(hobby)) {
            // Hobby already selected, remove it
            this.style.backgroundColor = "";
            this.style.color = "";

            // Remove the hobby from the array
            hobbies = hobbies.filter(h => h !== hobby);

            console.log(hobby + " was removed from hobbies");
        } else {
            // Hobby not selected, add it
            this.style.backgroundColor = "black";
            this.style.color = "white";

            hobbies.push(hobby);

            console.log(hobby + " was added to hobbies");
        }
    } else {
        console.log("This hobby is not in the available hobbies list.");
    }
}




//Hobbies Dropdown
let languageDropdown = document.getElementById('language-dropdown')
let languageContainer = document.getElementById('language-container')
languageContainer.style.display = 'none'

languageDropdown.addEventListener('click', () => {
    languageContainer.style.display = 'block'
    
})

let languages = [];
let availableLanguages = ["English", "Spanish", "Chinese", "Tagalog", "Vietnamese", "French", "Arabic", "Korean", "Russian", "German"]


function selectLanguage() {

    let language = this.innerText;

    if (availableLanguages.includes(language)) {
        if (languages.includes(language)) {
            // Language already selected, remove it
            this.style.backgroundColor = "";
            this.style.color = "";

            // Remove the Language from the array
            languages = languages.filter(h => h !== language);

            console.log(language + " was removed from languages");
        } else {
            // Language not selected, add it
            this.style.backgroundColor = "black";
            this.style.color = "white";

            languages.push(language);

            console.log(language + " was added to languages");
        }
    } else {
        console.log("This language is not in the available the list.");
    }
}






//PROFILE IMAGE CONTAINER______________________________________________________________________________________________

var imageContainer = document.getElementById('image-container')
var hiddenProfileImageUploadButton = document.getElementById('hidden-photo-upload-button')
var imageUploadButton = document.getElementById('atc-main-product-image')


imageUploadButton.addEventListener('click', () => {
    hiddenProfileImageUploadButton.click();
})


hiddenProfileImageUploadButton.addEventListener('change', uploadProfileImage);

var selectedFile;
function uploadProfileImage(e) {
    selectedFile = e.target.files[0];
    handleImageUpload()
}

async function handleImageUpload() {
	const uploadTask = await storageRef.child(`profileImages/${currentUserID}`).put(selectedFile);
	uploadAndCreateImage()
}

//final submit button and update firebase
async function uploadAndCreateImage() {
	await storageRef.child('/profileImages/'+currentUserID)
		.getDownloadURL()
		.then(function(url) { profilePhoto = url.toString() })

    //Create Image
    while(imageContainer.firstChild) {
        imageContainer.removeChild(imageContainer.firstChild)
    }
    var newImage = document.createElement('img')
    newImage.setAttribute('class', 'atc-main-product-image')
    newImage.src = profilePhoto
    imageContainer.appendChild(newImage)
    newImage.addEventListener('click', () => {
        console.log('clicked')
        hiddenProfileImageUploadButton.click();
    })
}
