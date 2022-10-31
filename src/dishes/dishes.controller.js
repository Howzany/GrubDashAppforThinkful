const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
// C v
// R
// U
// L

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}.`,
  });
}

function propertyExists(propertyName) {
  return function (req, res, next) {
    const data = req.body.data;
    if (data[propertyName]) {
      return next();
    }
    return next({
      status: 400,
      message: `Dish must include a ${propertyName}`,
    });
  };
}

function propertyEmptyValidation(propertyName) {
  return function (req, res, next) {
    const data = req.body.data;
    if (data[propertyName] == "") {
      return next({
        status: 400,
        message: `Dish must include a ${propertyName}`,
      });
    } else {
      return next();
    }
  };
}
// function propertyNotEmptyMissing(propertyName) {
//   return function (req, res, next) {
//     const { data: {} } = req.body;
//     if (!data[propertyName] || data[propertyName] == "") {
//       return next({
//         status: 400,
//         message: `Dish must include a ${propertyName}`,
//       });
//     }
//     return next();
//   };
// }

function dishPriceValidation(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`,
    });
  }
  return next();
}

function updateDishIdValidation(req, res, next) {
  const id = req.body.data.id;
  const { dishId } = req.params;
  if (!id || dishId == id) {
    return next();
  }
  return next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  console.log("In Create Method");
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  res.status(200).json({ data: res.locals.dish });
}

function update(req, res) {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body;
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;
  res.json({ data: dish });
}

function list(req, res) {
  res.json({ data: dishes });
}

module.exports = {
  create: [
    propertyExists("name"),
    propertyExists("description"),
    propertyExists("price"),
    propertyExists("image_url"),
    propertyEmptyValidation("name"),
    propertyEmptyValidation("description"),
    propertyEmptyValidation("image_url"),
    dishPriceValidation,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    propertyExists("name"),
    propertyExists("description"),
    propertyExists("price"),
    propertyExists("image_url"),
    propertyEmptyValidation("name"),
    propertyEmptyValidation("description"),
    propertyEmptyValidation("image_url"),
    dishPriceValidation,
    updateDishIdValidation,
    update,
  ],
  list,
};
