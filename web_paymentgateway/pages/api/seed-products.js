import dbConnect from '@/lib/mongoose'
import Product from '@/models/Product'

export default async function handler(req, res) {
  await dbConnect()

  const products = [
    { name: "Puding Leci D18", price: 250000, category: "Pudding", stock: 10, image: "/images/puding-leci-d18.jpg" },
    { name: "Puding Coklat D18", price: 260000, category: "Pudding", stock: 10, image: "/images/puding-coklat.jpg" },
    { name: "Puding Longan D18", price: 250000, category: "Pudding", stock: 10, image: "/images/puding-longan-d20.jpg" },
    { name: "Puding Leci D20", price: 300000, category: "Pudding", stock: 10, image: "/images/pudinglecid20.jpg" },
    { name: "Mini Puding D7", price: 150000, category: "Mini Pudding", stock: 20, image: "/images/minipuding.jpg" },
  ];

  try {
    await Product.deleteMany({});
    await Product.insertMany(products);

    res.status(200).json({ message: "Seed success", count: products.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
