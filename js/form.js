// Initialize firebase
firebase.initializeApp(firebaseConfig);

// Handle submit button's click event
$("#submit").click(function (e) { 
    e.preventDefault();
    
    let userId = getUserId();
    if (userId != null) {
        saveFormDataToFirebaseDb(getFormData(), userId);
    } else {
        saveFormDataToLocalStorage(getFormData());
    }

    var notificationDialog = document.getElementById("notificationDialogContainer");
    notificationDialog.style.display = "block";
    return false;
});

// Handle log out button's click event
$("#logout").click(function (e) { 
    e.preventDefault();
    logout();
    return false;
});

// Handle login button's click event
$("#login").click(function (e) { 
    e.preventDefault();
    $("#loginDialogContainer").css("display", "block");
    document.body.style.overflow = "hidden";
    return false;
});

// Handle close login dialog button's click event
$("#closeLoginDialog").click(function (e) { 
    e.preventDefault();
    closeLoginDialog();
    return false;
});

// Handle 'no' notifications dialog button's click event
$("#notificationsButtonNo").click(function (e) { 
    e.preventDefault();
    document.location.href = "./reference-sheet.html";
    return false;
});

// Handle 'yes' notifications dialog button's click event
$("#notificationsButtonYes").click(function (e) { 
    e.preventDefault();
    document.location.href = "./reference-sheet.html";
    return false;
});

var ui = new firebaseui.auth.AuthUI(firebase.auth());
var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            closeLoginDialog();
            return false;
        },
        uiShown: function() {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
        }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: '#',
    signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: '#',
    // Privacy policy url.
    privacyPolicyUrl: '#'
};

ui.start('#firebaseui-auth-container', uiConfig);

// Observe user auth state
firebase.auth().onAuthStateChanged(function (user) {
    if (user && !user.isAnonymous) {
        // User is signed in.
        $("#login").css("display", "none");
        $("#logout").css("display", "inherit");
        $("#setting").css("display", "inherit");
        fetchFormData(user.uid);
    } else {
        // No user is signed in.
        $("#login").css("display", "inherit");
        $("#logout").css("display", "none");
        $("#setting").css("display", "none");
    }
});

function closeLoginDialog() {
    $("#loginDialogContainer").css("display", "none");
    document.body.style.overflow = "auto";
}

function logout() {
    firebase.auth().signOut()
        .then(function() {
            // Sign-out successful.
        })
        .catch(function(error) {
            // An error happened
            console.log(error);
        });
}

function getFormData() {
    return {
        fullname: $("#fullname").val(),
        postalCode: $("#postalCode").val(),
        familySize: $("#familySize").val(),
        children: $("#children").val(),
        medication: $("input[name=medication]:checked").val(),
        mobility: $("input[name=mobility]:checked").val()
    };
}

function getUserId() {
    let user = firebase.auth().currentUser;
    return (user && !user.isAnonymous) ? user.uid : null;
}

function saveFormDataToLocalStorage(formData) {
    var storage = window.localStorage;
    for (let key in formData) {
        storage.setItem(key, formData[key]);
    }
}

function saveFormDataToFirebaseDb(formData, userId) {
    if (userId == null) {
        return;
    }
    let updates = {};
    updates['/forms/' + userId] = formData;
    return firebase.database().ref().update(updates);
}

function fetchFormData(userId) {
    let dbRef = firebase.database().ref('forms/' + userId);
    dbRef.once('value', (snap) => {
        let formData = snap.val();
        updateHtmlFormValues(formData);
    });
}

function updateHtmlFormValues(formData) {
    $("#fullname").val(formData.fullname);
    $("#postalCode").val(formData.postalCode);
    $("#familySize").val(formData.familySize);
    $("#children").val(formData.children);
    $("#medicationYes").prop('checked', formData.medication == 'yes');
    $("#mobilityYes").prop('checked', formData.mobility == 'yes');
}