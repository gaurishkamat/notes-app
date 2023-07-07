//const http = require("http");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

const requestLogger = (request, response, next) => {
  console.log("Method: ", request.method);
  console.log("Path: ", request.path);
  console.log("Body: ", request.body);
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

morgan("combined", {
  immediate: function (req, res) {
    JSON.stringify(req.statusCode);
    return req.status;
  },
  skip: function (req, res) {
    console.log("Is it this:", req.statusCode);
    return res.statusCode === "404";
  },
  stream: function () {
    console.log("Hello");
  },
});

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(morgan("combined"));

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: true,
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: false,
  },
  {
    id: 4,
    content: "Learnt Put and Patch method",
    important: false,
  },
  {
    id: 5,
    content: "JavaScript is super exciting",
    important: false,
  },
  {
    content: "Default exports are important",
    important: true,
    id: 6,
  },
];

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

/* const app = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(notes));
}); */

app.get("/", function (req, res) {
  res.send("<h1>Hello World!</h1>");
});

app.get("/api/notes", function (req, res) {
  res.json(notes);
});

app.get("/api/notes/:id", function (req, res) {
  const id = Number(req.params.id);
  const note = notes.find((note) => note.id === id);
  if (note) {
    res.json(note);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  notes = notes.filter((note) => note.id !== id);
  res.status(204).end();
});

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1;
};

const generateUniqueId = () => {
  const maxId = persons.length ? Math.max(...persons.map((p) => p.id)) : 0;
  return maxId + 1;
};

app.post("/api/notes", (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const note = {
    content: body.content,
    important: body.important || false,
    id: generateId(),
  };

  notes = notes.concat(note);

  response.json(note);
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  res.send(`<div>
        <p>Phonebook has info for ${persons?.length} people.</p>
        <p>${new Date()}</p>
    </div>`);
});

app.get("/api/persons/:id", (req, res) => {
  let id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  let id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

app.post("/api/persons", (request, res) => {
  let body = request.body;
  console.log(body);

  if (!body.name) {
    return res.status(400).json({
      error: "name missing",
    });
  }

  let person = {
    name: body.name,
    number: body.number,
    id: generateUniqueId(),
  };

  let exist = persons.find((p) => p.name === person.name);

  if (exist) {
    res.status(400).json({
      error: "name must be unique",
    });
  }

  persons = persons.concat(person);
  res.json(person);
});

/* app.post("/api/persons", (request, response) => {
  const body = request.body;
  console.log(body);

  if (!body.name) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateUniqueId(),
  };

  persons = persons.concat(person);

  response.json(person);
}); */
app.use(unknownEndpoint);

const PORT = process.env.PORT || 3005;

console.log("PORT:", process.env.PORT);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
