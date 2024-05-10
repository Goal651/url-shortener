

const token = localStorage.getItem('jwt');


$('#form').on('submit', (e) => {
    e.preventDefault();

    $.ajax({
        type: "POST",
        url: "http://localhost:3000/shortenUrl/",
        data: JSON.stringify({
            longUrl: $('#shortUrl').val(),
            username: $('#userName').val()
        }),
        contentType: "application/json",
        dataType: "json",
        success: function (result) {

            let container = $('#result');
            container.append(result.message)

        },
        error: function (error) {
            let container = $('#result');
            container.append('Failed to shorten');
        }
    });
})

function getHistory() {
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