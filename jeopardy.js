// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

/*I used Lodash to find the 6 random categories as the header row by using Lodash function _.sampleSize(array,n)*/
async function getCategoryIds() {
    const res1 = await axios.get("http://jservice.io/api/categories?count=100");
    const randomCategories = _.sampleSize(res1.data, 6).map(function(category){
        return category.id;
    });
    return randomCategories;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

/*use Lodash function to find 5 random questions for each one of the six categories selected as per getCategoryIds()*/
async function getCategory(catId) {
    const res2 = await axios.get(`http://jservice.io/api/category?id=${catId}`);
    const { title, clues } = res2.data;
    const randomClues = _.sampleSize(clues, 5).map(function(clue){
        return {
            question: clue.question,
            answer: clue.answer,
            showing: null,
        };
    });
    return { title, clues: randomClues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

/*using Jquery*/
async function fillTable() {
    const $thead = $("#jeopardy thead");
    const $tbody = $("#jeopardy tbody");
    $thead.empty();
    $tbody.empty();

    let $tr1 = $("<tr>");
    for (let category of categories) {
        $tr1.append($("<th>").text(category.title));
    }
    $thead.append($tr1);

    for (let i = 0; i < 5; i++) { // Looping for 5 questions per category
        let $tr2 = $("<tr>");
        for (let j = 0; j < categories.length; j++) { // Looping over the total number of available categories for each question
            $tr2.append($("<td>").attr("id", `${j}-${i}`).text("?")); // ${j}-${i} creates a unique ID for each cell, j category column index, while i question index within j category, seperated by hyphen"-"
        }
        $tbody.append($tr2);
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let cellId = evt.target.id;
    let [categoryId, clueId] = cellId.split("-");
    let clue = categories[categoryId].clues[clueId];

    if (!clue.showing) {
        $(`#${cellId}`).text(clue.question);
        clue.showing = "question";
    } else if (clue.showing === "question") {
        $(`#${cellId}`).text(clue.answer);
        clue.showing = "answer";
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $("#spin-container").show();
    $("#start").prop("disabled", true);
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $("#spin-container").hide();
    $("#start").prop("disabled", false);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView();
    const ids = await getCategoryIds();
    categories = await Promise.all(ids.map(function(id){
        return getCategory(id);
    }));
    await fillTable();
    hideLoadingView();
}

/** On click of start / restart button, set up game. */

// TODO
$(document).ready(function(){
    $("#start").on("click", setupAndStart);
    $("#jeopardy").on("click", "td", handleClick);
});

/** On page load, add event handler for clicking clues */

// TODO