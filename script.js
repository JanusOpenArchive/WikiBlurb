$(document).ready(function () {
    $("#search").autocomplete({
        source: async function (request, response) {
            const url = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=${encodeURIComponent(request.term)}`;
            try {
                const data = await fetch(url).then(res => res.json());
                response(data[1]);
            } catch (error) {
                console.error("Error fetching autocomplete suggestions:", error);
            }
        },
        select: function (event, ui) {
            $("#search").val(ui.item.value);
            fetchWikipediaBlurbs();
            return false;
        }
    });
    
    $("#search").keypress(function(event) {
        if (event.which === 13) { // Enter key pressed
            event.preventDefault();
            fetchWikipediaBlurbs();
        }
    });
    
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    if (query) {
        $("#search").val(query);
        fetchWikipediaBlurbs();
    }
});

async function fetchWikipediaBlurbs() {
    const topic = $("#search").val();
    if (!topic) return alert("Please enter a topic.");
    
    window.history.pushState({}, '', `?query=${encodeURIComponent(topic)}`);
    document.title = topic + " - Wikipedia Blurb Viewer";
    
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=${encodeURIComponent(topic)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const topics = data[1].slice(0, 6); // Get top 6 results
        
        let blurbsHTML = "";
        for (let topic of topics) {
            const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
            const summaryResponse = await fetch(summaryUrl);
            const summaryData = await summaryResponse.json();
            
            blurbsHTML += `<div class='blurb'><h3><a href='${summaryData.content_urls.desktop.page}' target='_blank'>${summaryData.title}</a></h3><p>${summaryData.extract}</p></div>`;
        }
        $("#content").html(blurbsHTML);
    } catch (error) {
        alert("Error fetching data: " + error.message);
    }
}