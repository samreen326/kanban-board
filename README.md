# Kanban Board with Backend Persistence

A full-stack Kanban board application that allows users to create and manage boards, columns, and cards with drag-and-drop functionality. Data is stored using SQLite through a Node.js and Express.js backend.

## Features

* Create and delete multiple boards
* Create and delete columns
* Add, edit, and delete cards
* Drag and drop cards between columns
* Reorder cards within columns
* Backend REST API
* SQLite database for data storage
* Responsive and simple user interface
* Persistent data architecture

## Technologies Used

* HTML5
* CSS3
* JavaScript
* Node.js
* Express.js
* SQLite
* HTML5 Drag and Drop API
* CORS

## Project Structure

```text
kanban-board/
├── backend/
│   ├── server.js
│   ├── database.js
│   └── kanban.db
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .gitignore
├── package.json
└── README.md
```

## How It Works

The frontend provides the Kanban interface where users can manage boards, columns, and cards.

The Express.js backend provides REST API endpoints for CRUD operations. SQLite stores the application data, including board names, column positions, card details, and card positions.

When a card is moved using drag and drop, its column and position are sent to the backend and saved in the database.

## API Endpoints

### Boards

* `GET /api/boards` — Get all boards
* `POST /api/boards` — Create a board
* `DELETE /api/boards/:id` — Delete a board

### Columns

* `GET /api/boards/:boardId/columns` — Get columns
* `POST /api/boards/:boardId/columns` — Create a column
* `DELETE /api/columns/:id` — Delete a column

### Cards

* `GET /api/columns/:columnId/cards` — Get cards
* `POST /api/columns/:columnId/cards` — Create a card
* `PUT /api/cards/:id` — Update a card
* `DELETE /api/cards/:id` — Delete a card
* `PUT /api/cards/:id/move` — Update card position

## Outcome

The project demonstrates practical implementation of CRUD operations, REST APIs, database persistence, drag-and-drop interactions, position management, and frontend-backend integration in a full-stack web application.

## Future Improvements

* User authentication
* Board sharing
* Card due dates and priorities
* Search and filtering
* User-specific boards
* Improved deployment database infrastructure
