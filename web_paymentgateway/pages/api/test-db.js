import dbConnect from '../../lib/mongoose'
import Product from '../../models/Product'

export default async function handler(req, res) {
  await dbConnect()

  if (req.method === 'POST') {
    const product = await Product.create({ 
      name: 'Produk Dummy', 
      price: 10000, 
      category: 'Test', 
      stock: 5 
    })
    return res.status(201).json(product)
  }

  if (req.method === 'GET') {
    const products = await Product.find({})
    return res.status(200).json(products)
  }
}
