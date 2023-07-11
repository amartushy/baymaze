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
