import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export default async function handler(req, res) {
  await dbConnect()

  // contoh seed data
  const products = [
    { name: 'T-Shirt', price: 150000, category: 'Fashion', stock: 20, image: '/images/tshirt.jpg' },
    { name: 'Laptop Bag', price: 300000, category: 'Accessories', stock: 10, image: '/images/bag.jpg' },
  ]

  try {
    await Product.insertMany(products)
    res.status(200).json({ message: 'Seed success', count: products.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
