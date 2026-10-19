
const express = require("express");
const app = express();

app.disable("x-powered-by");
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const autos = [
  { id: 1, marca: "Toyota", modelo: "Corolla", año: 2024, precio: 389900, color: "Blanco" },
  { id: 2, marca: "Nissan", modelo: "Versa", año: 2025, precio: 329900, color: "Gris" },
  { id: 3, marca: "Mazda", modelo: "Mazda 3", año: 2023, precio: 415000, color: "Rojo" },
  { id: 4, marca: "Volkswagen", modelo: "Jetta", año: 2024, precio: 439900, color: "Azul" },
  { id: 5, marca: "Kia", modelo: "Rio", año: 2022, precio: 279900, color: "Blanco" },
  { id: 6, marca: "Hyundai", modelo: "Elantra", año: 2024, precio: 465000, color: "Negro" }
];

app.get("/", (req, res) => {
  res.json({
    mensaje: "Microservicio de catalogo de autos UVM",
    alumno: "Emanuel Trinidad Garcia",
    endpoints: ["/salud", "/api/v1/autos", "/api/v1/autos/1"]
  });
});

app.get("/salud", (req, res) => {
  res.json({ estado: "ok" });
});

app.use("/api/v1/autos", (req, res, next) => {
  if (process.env.API_KEY && req.get("X-API-Key") !== process.env.API_KEY) {
    return res.status(401).json({
      error: "No autorizado",
      mensaje: "Se requiere una clave de API valida"
    });
  }
  next();
});

app.get("/api/v1/autos", (req, res) => {
  const { marca, color } = req.query;

  if ([marca, color].some(v => v !== undefined && typeof v !== "string")) {
    return res.status(400).json({ error: "Filtros invalidos" });
  }

  let resultado = autos;

  if (marca) {
    resultado = resultado.filter(
      auto => auto.marca.toLowerCase() === marca.toLowerCase()
    );
  }

  if (color) {
    resultado = resultado.filter(
      auto => auto.color.toLowerCase() === color.toLowerCase()
    );
  }

  res.json({ total: resultado.length, autos: resultado });
});

app.get("/api/v1/autos/:id", (req, res) => {
  const auto = autos.find(a => String(a.id) === req.params.id);

  if (!auto) {
    return res.status(404).json({
      error: "Automovil no encontrado"
    });
  }

  res.json(auto);
});

app.all(["/api/v1/autos", "/api/v1/autos/:id"], (req, res) => {
  res.set("Allow", "GET, HEAD, OPTIONS");
  res.status(405).json({ error: "Metodo no permitido" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor funcionando en puerto " + PORT);
});
