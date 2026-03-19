{
  _id: ObjectId,
  nombre: String,
  email: String,
  password: String,
  telefono: String,
  rol: "cliente" | "admin",
  fechaRegistro: Date
}

{
  _id: ObjectId,
  nombre: String,
  descripcion: String,
  precio: Number,
  categoria: String,
  tallas: [String],
  color: String,
  stock: Number,
  imagen: String,
  fechaCreacion: Date
}

{
  _id: ObjectId,
  usuario: ObjectId,
  productos: [
    {
      productoId: ObjectId,
      nombre: String,
      precio: Number,
      cantidad: Number
    }
  ],
  total: Number,
  estado: String,
  fecha: Date
}

{
  _id: ObjectId,
  usuario: ObjectId,
  productos: [
    {
      productoId: ObjectId,
      cantidad: Number
    }
  ]
}

