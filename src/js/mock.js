// this is mock data, but when we create our API
// we'll have it return data that looks like this
var MOCK_STATUS_UPDATES = {
	"user": [
        {
            "id": "1111111",
            "text": "Can't believe how much fun I'm having.",
            "publishedAt": 1470016976609
        },
        {
            "id": "2222222",
            "text": "Have FOMO? Well you SHOULD!",
            "publishedAt": 1470012976609
        },
        {
            "id": "333333",
            "text": "They're giving out immortality and free $$$ where I am.",
            "publishedAt": 1470011976609
        },
        {
            "id": "4444444",
            "text": "humble brag humble brag humble brag",
            "publishedAt": 1470009976609
        }
    ]
};

// this function's name and argument can stay the
// same after we have a live API, but its internal
// implementation will change. Instead of using a
// timeout function that returns mock data, it will
// use jQuery's AJAX functionality to make a call
// to the server and then run the callbackFn
function getRecentUserMessage(callbackFn) {
    // we use a `setTimeout` to make this asynchronous
    // as it would be with a real AJAX call.
	setTimeout(function(){ callbackFn(MOCK_STATUS_UPDATES)}, 1);
}

// this function stays the same when we connect
// to real API later
function displayMessage(data) {
    for (let index in data.user) {
	   $('body').append(
        '<p>' + data.user[index].text + '</p>');
    }
}

// this function can stay the same even when we
// are connecting to real API
function getAndDisplayUserMessages() {
	getRecentUserMessage(displayMessage);
}

//  on page load do this
$(function() {
	getAndDisplayUserMessages();
})