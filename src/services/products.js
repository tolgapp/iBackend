import products from "../products.json" with { type: "json" };

export const getProducts = async (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
