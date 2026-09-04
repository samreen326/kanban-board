const API = "/api";

let currentBoardId = null;
let selectedColumnId = null;

const boardSelect = document.getElementById("boardSelect");
const kanbanBoard = document.getElementById("kanbanBoard");

const boardModal = document.getElementById("boardModal");
const columnModal = document.getElementById("columnModal");
const cardModal = document.getElementById("cardModal");


// ==========================
// INITIAL LOAD
// ==========================

document.addEventListener("DOMContentLoaded", () => {
    loadBoards();
});


// ==========================
// BOARDS
// ==========================

async function loadBoards() {

    try {

        const response = await fetch(`${API}/boards`);
        const boards = await response.json();

        boardSelect.innerHTML = "";

        if (boards.length === 0) {

            const option = document.createElement("option");
            option.textContent = "No boards yet";
            option.value = "";

            boardSelect.appendChild(option);

            kanbanBoard.innerHTML = `
                <div>
                    <p>Create your first board using "+ New Board".</p>
                </div>
            `;

            currentBoardId = null;
            return;
        }

        boards.forEach(board => {

            const option = document.createElement("option");

            option.value = board.id;
            option.textContent = board.name;

            boardSelect.appendChild(option);
        });

        currentBoardId = boards[0].id;
        boardSelect.value = currentBoardId;

        loadColumns();

    } catch (error) {
        console.error("Error loading boards:", error);
    }
}


// Board selection
boardSelect.addEventListener("change", () => {

    currentBoardId = boardSelect.value;

    if (currentBoardId) {
        loadColumns();
    }
});


// Create board
document.getElementById("addBoardBtn").addEventListener("click", () => {
    openModal(boardModal);
});


document.getElementById("saveBoardBtn").addEventListener("click", async () => {

    const input = document.getElementById("boardNameInput");
    const name = input.value.trim();

    if (!name) {
        alert("Enter a board name.");
        return;
    }

    const response = await fetch(`${API}/boards`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
    });

    if (response.ok) {

        input.value = "";

        closeModal(boardModal);

        await loadBoards();

    } else {
        alert("Could not create board.");
    }
});


// Delete board
document.getElementById("deleteBoardBtn").addEventListener("click", async () => {

    if (!currentBoardId) {
        return;
    }

    const confirmed = confirm(
        "Delete this board and all its columns and cards?"
    );

    if (!confirmed) {
        return;
    }

    const response = await fetch(
        `${API}/boards/${currentBoardId}`,
        {
            method: "DELETE"
        }
    );

    if (response.ok) {
        await loadBoards();
    }
});


// ==========================
// COLUMNS
// ==========================

async function loadColumns() {

    if (!currentBoardId) {
        return;
    }

    try {

        const response = await fetch(
            `${API}/boards/${currentBoardId}/columns`
        );

        const columns = await response.json();

        kanbanBoard.innerHTML = "";

        for (const column of columns) {

            const columnElement = createColumnElement(column);

            kanbanBoard.appendChild(columnElement);

            await loadCards(column.id, columnElement);
        }

        // Add Column button
        const addColumnContainer = document.createElement("div");

        addColumnContainer.className = "add-column-container";

        addColumnContainer.innerHTML = `
            <button class="add-column-btn">
                + Add Column
            </button>
        `;

        addColumnContainer
            .querySelector("button")
            .addEventListener("click", () => {

                openModal(columnModal);
            });

        kanbanBoard.appendChild(addColumnContainer);

    } catch (error) {

        console.error("Error loading columns:", error);
    }
}


function createColumnElement(column) {

    const columnElement = document.createElement("div");

    columnElement.className = "column";

    columnElement.dataset.columnId = column.id;

    columnElement.innerHTML = `
        <div class="column-header">

            <h3>${escapeHTML(column.name)}</h3>

            <div class="column-actions">

                <button
                    class="small-btn delete-column-btn"
                    title="Delete column">
                    🗑
                </button>

            </div>

        </div>

        <div
            class="cards"
            data-column-id="${column.id}">
        </div>

        <button class="add-card-btn">
            + Add Card
        </button>
    `;


    // Delete column
    columnElement
        .querySelector(".delete-column-btn")
        .addEventListener("click", async () => {

            const confirmed = confirm(
                "Delete this column and all its cards?"
            );

            if (!confirmed) {
                return;
            }

            const response = await fetch(
                `${API}/columns/${column.id}`,
                {
                    method: "DELETE"
                }
            );

            if (response.ok) {
                loadColumns();
            }
        });


    // Add card
    columnElement
        .querySelector(".add-card-btn")
        .addEventListener("click", () => {

            selectedColumnId = column.id;

            openModal(cardModal);
        });


    return columnElement;
}


// Create column
document.getElementById("saveColumnBtn").addEventListener("click", async () => {

    const input = document.getElementById("columnNameInput");
    const name = input.value.trim();

    if (!name) {
        alert("Enter a column name.");
        return;
    }

    const response = await fetch(
        `${API}/boards/${currentBoardId}/columns`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name })
        }
    );

    if (response.ok) {

        input.value = "";

        closeModal(columnModal);

        loadColumns();

    } else {
        alert("Could not create column.");
    }
});


// ==========================
// CARDS
// ==========================
// Save card
document.getElementById("saveCardBtn").addEventListener("click", async () => {

    const titleInput = document.getElementById("cardTitleInput");
    const descriptionInput = document.getElementById("cardDescriptionInput");

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title) {
        alert("Enter a card title.");
        return;
    }

    if (!selectedColumnId) {
        alert("No column selected.");
        return;
    }

    try {
        const response = await fetch(
            `${API}/columns/${selectedColumnId}/cards`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    description
                })
            }
        );

        if (response.ok) {

            titleInput.value = "";
            descriptionInput.value = "";

            closeModal(cardModal);

            await loadColumns();

        } else {
            const error = await response.json();
            alert(error.error || "Could not create card.");
        }

    } catch (error) {
        console.error("Error creating card:", error);
        alert("Could not connect to the server.");
    }
});
async function loadCards(columnId, columnElement) {

    const response = await fetch(
        `${API}/columns/${columnId}/cards`
    );

    const cards = await response.json();

    const cardsContainer =
        columnElement.querySelector(".cards");

    cardsContainer.innerHTML = "";

    cards.forEach(card => {

        const cardElement = createCardElement(card);

        cardsContainer.appendChild(cardElement);
    });

    enableDropZone(cardsContainer);
}


function createCardElement(card) {

    const cardElement = document.createElement("div");

    cardElement.className = "card";

    cardElement.draggable = true;

    cardElement.dataset.cardId = card.id;

    cardElement.innerHTML = `
        <h4>${escapeHTML(card.title)}</h4>

        ${
            card.description
                ? `<p>${escapeHTML(card.description)}</p>`
                : ""
        }

        <div class="card-actions">

            <button class="small-btn delete-card-btn">
                🗑
            </button>

        </div>
    `;


    // Drag start
    cardElement.addEventListener("dragstart", event => {

        event.dataTransfer.setData(
            "text/plain",
            card.id
        );

        cardElement.classList.add("dragging");
    });


    // Drag end
    cardElement.addEventListener("dragend", () => {

        cardElement.classList.remove("dragging");
    });


    // Delete card
    cardElement
        .querySelector(".delete-card-btn")
        .addEventListener("click", async () => {

            const response = await fetch(
                `${API}/cards/${card.id}`,
                {
                    method: "DELETE"
                }
            );

            if (response.ok) {
                cardElement.remove();
            }
        });


    return cardElement;
}


// ==========================
// DRAG & DROP
// ==========================

function enableDropZone(container) {

    container.addEventListener("dragover", event => {

        event.preventDefault();

        const draggingCard =
            document.querySelector(".dragging");

        if (!draggingCard) {
            return;
        }

        const afterElement =
            getCardAfterPosition(
                container,
                event.clientY
            );

        if (afterElement == null) {

            container.appendChild(draggingCard);

        } else {

            container.insertBefore(
                draggingCard,
                afterElement
            );
        }
    });


    container.addEventListener("drop", async event => {

        event.preventDefault();

        const cardId =
            event.dataTransfer.getData("text/plain");

        const cards =
            [...container.querySelectorAll(".card")];

        const columnId =
            container.dataset.columnId;


        // Save new positions
        for (let i = 0; i < cards.length; i++) {

            await fetch(
                `${API}/cards/${cards[i].dataset.cardId}/move`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        column_id: Number(columnId),
                        position: i
                    })
                }
            );
        }

        console.log(
            `Card ${cardId} moved successfully`
        );
    });
}


function getCardAfterPosition(container, mouseY) {

    const cards =
        [...container.querySelectorAll(".card:not(.dragging)")];

    let closest = {
        offset: Number.NEGATIVE_INFINITY,
        element: null
    };

    cards.forEach(card => {

        const box = card.getBoundingClientRect();

        const offset =
            mouseY - box.top - box.height / 2;

        if (
            offset < 0 &&
            offset > closest.offset
        ) {
            closest = {
                offset,
                element: card
            };
        }
    });

    return closest.element;
}


// ==========================
// MODALS
// ==========================

function openModal(modal) {
    modal.classList.remove("hidden");
}


function closeModal(modal) {
    modal.classList.add("hidden");
}


document.getElementById("closeBoardModal")
    .addEventListener("click", () => {
        closeModal(boardModal);
    });


document.getElementById("closeColumnModal")
    .addEventListener("click", () => {
        closeModal(columnModal);
    });


document.getElementById("closeCardModal")
    .addEventListener("click", () => {
        closeModal(cardModal);
    });


// Close when clicking outside
window.addEventListener("click", event => {

    if (event.target === boardModal) {
        closeModal(boardModal);
    }

    if (event.target === columnModal) {
        closeModal(columnModal);
    }

    if (event.target === cardModal) {
        closeModal(cardModal);
    }
});


// ==========================
// SECURITY HELPER
// ==========================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}