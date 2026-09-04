const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./database");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

// Test route
app.get("/api", (req, res) => {
    res.json({
        message: "Kanban API is running"
    });
});


/* =========================
   BOARDS
========================= */

// Get all boards
app.get("/api/boards", (req, res) => {
    db.all(
        "SELECT * FROM boards ORDER BY id ASC",
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json(rows);
        }
    );
});


// Create board
app.post("/api/boards", (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            error: "Board name is required"
        });
    }

    db.run(
        "INSERT INTO boards (name) VALUES (?)",
        [name.trim()],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                id: this.lastID,
                name: name.trim()
            });
        }
    );
});


// Delete board
app.delete("/api/boards/:id", (req, res) => {
    const { id } = req.params;

    db.run(
        "DELETE FROM boards WHERE id = ?",
        [id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Board deleted"
            });
        }
    );
});


/* =========================
   COLUMNS
========================= */

// Get columns for a board
app.get("/api/boards/:boardId/columns", (req, res) => {
    const { boardId } = req.params;

    db.all(
        "SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC",
        [boardId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});


// Create column
app.post("/api/boards/:boardId/columns", (req, res) => {
    const { boardId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            error: "Column name is required"
        });
    }

    db.get(
        "SELECT MAX(position) AS maxPosition FROM columns WHERE board_id = ?",
        [boardId],
        (err, row) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            const position =
                row.maxPosition === null ? 0 : row.maxPosition + 1;

            db.run(
                `
                INSERT INTO columns
                (board_id, name, position)
                VALUES (?, ?, ?)
                `,
                [boardId, name.trim(), position],
                function (err) {
                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.status(201).json({
                        id: this.lastID,
                        board_id: Number(boardId),
                        name: name.trim(),
                        position
                    });
                }
            );
        }
    );
});


// Delete column
app.delete("/api/columns/:id", (req, res) => {
    const { id } = req.params;

    db.run(
        "DELETE FROM columns WHERE id = ?",
        [id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Column deleted"
            });
        }
    );
});


/* =========================
   CARDS
========================= */

// Get cards for a column
app.get("/api/columns/:columnId/cards", (req, res) => {
    const { columnId } = req.params;

    db.all(
        "SELECT * FROM cards WHERE column_id = ? ORDER BY position ASC",
        [columnId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});


// Create card
app.post("/api/columns/:columnId/cards", (req, res) => {
    const { columnId } = req.params;
    const { title, description = "" } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            error: "Card title is required"
        });
    }

    db.get(
        "SELECT MAX(position) AS maxPosition FROM cards WHERE column_id = ?",
        [columnId],
        (err, row) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            const position =
                row.maxPosition === null ? 0 : row.maxPosition + 1;

            db.run(
                `
                INSERT INTO cards
                (column_id, title, description, position)
                VALUES (?, ?, ?, ?)
                `,
                [columnId, title.trim(), description, position],
                function (err) {
                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.status(201).json({
                        id: this.lastID,
                        column_id: Number(columnId),
                        title: title.trim(),
                        description,
                        position
                    });
                }
            );
        }
    );
});


// Update card
app.put("/api/cards/:id", (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    db.run(
        `
        UPDATE cards
        SET title = ?, description = ?
        WHERE id = ?
        `,
        [title, description || "", id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Card updated"
            });
        }
    );
});


// Delete card
app.delete("/api/cards/:id", (req, res) => {
    const { id } = req.params;

    db.run(
        "DELETE FROM cards WHERE id = ?",
        [id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Card deleted"
            });
        }
    );
});


/* =========================
   DRAG & DROP
========================= */

// Move card
app.put("/api/cards/:id/move", (req, res) => {
    const { id } = req.params;
    const { column_id, position } = req.body;

    db.run(
        `
        UPDATE cards
        SET column_id = ?, position = ?
        WHERE id = ?
        `,
        [column_id, position, id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Card position updated"
            });
        }
    );
});


app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});