"use strict";

// !mdbgum
const { model, Schema } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

// Declare the Schema of the Mongo model
var productSchema = new Schema({
  product_name: { type: String, require: true },
  product_thumb: { type: String, require: true },
  product_description: String,
  product_price: { type: Number, require: true },
  product_quantity: { type: Number, require: true },
  product_type: { type: String, require: true, enum: ['Electronics', 'Clothing', 'Furniture'] },
  product_shop: { type: Schema.Types.ObjectId, red: 'Shop' },
  product_attributes: { type: Schema.Types.Mixed, require: true },
}, {
  collation: COLLECTION_NAME,
  timestamps: true
});

// define the product type = Clothing
const clothingSchema = new Schema({
  brand: { type: String, require: true },
  size: String,
  material: String
}, {
  collation: 'clothes',
  timestamps: true
});

// define the product type = Electronics
const electronicSchema = new Schema({
  manufacturer: { type: String, require: true },
  model: String,
  color: String
}, {
  collation: 'electronics',
  timestamps: true
});

//Export the model
module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model('Clothing', clothingSchema),
  electronic: model('Electronics', electronicSchema)
}
