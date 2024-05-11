$(document).ready(function () {
    urlShortener();
    login();
});

// Function to get cookie value
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

const token = getCookie('accessToken');


function urlShortener() {
    $('#form').on('submit', (e) => {
        e.preventDefault();

        $.ajax({
            type: "POST",
            url: "http://localhost:3000/shortenUrl/",
            data: JSON.stringify({
                longUrl: $('#longurl').val(),
            }),
            contentType: "application/json",
            dataType: "json",
            success: function (result) {

                let container = $('#longUrl');
                container.append(result.message)

            },
            error: function (error) {
                let container = $('#result');
                container.append('Failed to shorten');
            }
        });
    })
}

function secureUrlShortener() {
    $('#form').on('submit', (e) => {
        e.preventDefault();

        $.ajax({
            type: "POST",
            url: "http://localhost:3000/secure/shortenUrl/",
            data: JSON.stringify({
                longUrl: $('#longurl').val(),
                email: token
            }),
            contentType: "application/json",
            dataType: "json",
            success: function (result) {
                let container = $('#longUrl');
                container.append(result.message);
            },
            error: function (error) {
                let container = $('#result');
                container.append('Failed to shorten');
            }
        });
    })
}

function login() {
    $('#loginForm').on('submit', (e) => {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "http://localhost:3001/login",
            data: {
                email: $('#username').val(),
            },
            dataType: "json",
            success: function (result) {
                alert(`Welcome ${result.message}!`);
                window.location.href = "dashboard.html";

            },
            error: function (error) {
                let container = $('#result');
                container.append('Failed to login');
            }
        });
    })
}

function getHistory() {
    console.log(token);
    $.ajax({
        type: "GET",
        url: `http://localhost:3001/getHistory/${token}`,
        success: function (result) {
            console.log(result);
        },
        error: function (error) {
            console.log(error);
        }
    })
}