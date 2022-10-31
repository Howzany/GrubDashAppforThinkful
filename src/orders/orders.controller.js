// const e = require("cors");
const path = require("path");

//C v
//R v
//U v
//D v
//L v

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  } else {
    return next({
      status: 404,
      message: `Order id not found: ${orderId}`,
    });
  }
}

function propertyExistsNotDish(propertyName) {
  return function (req, res, next) {
    const data = req.body.data;
    if (data[propertyName]) {
      return next();
    }
    return next({
      status: 400,
      message: `Order must include a ${propertyName}`,
    });
  };
}

function validatePropertyNotDish(propertyName) {
  return function (req, res, next) {
    const data = req.body.data;
    if (data[propertyName] === "") {
      return next({
        status: 400,
        message: `Order must include a ${propertyName}`,
      });
    }
    return next();
  };
}

function validationDishes(req, res, next) {
  const dishes = req.body.data.dishes;
  if (!dishes) {
    return next({
      status: 400,
      message: `Order must include a dish`,
    });
  } else if (dishes.length == 0 || !Array.isArray(dishes)) {
    return next({
      status: 400,
      message: `Order must include at least one dish`,
    });
  } else {
    return next();
  }
}

function dishQuantityValidation(req, res, next) {
  const dishes = req.body.data.dishes;
  for (let i = 0; i < dishes.length; i++) {
    if (
      !dishes[i].quantity ||
      !Number.isInteger(dishes[i].quantity) ||
      parseInt(dishes[i].quantity) <= 0
    ) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  return next();
}

function updateIdValidation(req, res, next) {
  const { orderId } = req.params;
  const id = req.body.data.id;
  if (!id || orderId == id) {
    return next();
  }
  return next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
  });
}

function updateStatusValidation(req, res, next) {
  const status = req.body.data.status;
  if (!status || status == "") {
    return next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  }
  return next();
}

function updateDeliveryValidation(req, res, next) {
  const status = req.body.data.status;
  if (status == "delivered") {
    return next({
      status: 400,
      message: `A delivered order cannot be changed`,
    });
  } else if (
    status == "pending" ||
    status == "preparing" ||
    status == "out-for-delivery"
  ) {
    return next();
  }
  return next({
    status: 400,
    message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
  });
}
function deletePendingValidation(req, res, next) {
  const status = res.locals.order.status;
  if (status == "pending") {
    return next();
  }
  return next({
    status: 400,
    message: `An order cannot be deleted unless it is pending`,
  });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status: "pending",
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

// POST /orders in orders.controller.js is done... other methods not done.

function read(req, res) {
  res.status(200).json({ data: res.locals.order });
}

function update(req, res) {
  const order = res.locals.order;
  // const {orderId}= req.params;
  // const foundOrder = orders.find((order) => order.id === orderId);
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;
  res.json({ data: order });
}

function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id == orderId);
  const deletedOrders = orders.splice(index, 1);
  // orders = deletedOrders;
  res.sendStatus(204);
}

function list(req, res) {
  res.json({ data: orders });
}

module.exports = {
  create: [
    //deliverTo
    //mobileNumber
    //status
    propertyExistsNotDish("deliverTo"),
    propertyExistsNotDish("mobileNumber"),
    validatePropertyNotDish("deliverTo"),
    validatePropertyNotDish("mobileNumber"),
    validationDishes,
    dishQuantityValidation,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    propertyExistsNotDish("deliverTo"),
    propertyExistsNotDish("mobileNumber"),
    propertyExistsNotDish("status"),
    validatePropertyNotDish("deliverTo"),
    validatePropertyNotDish("mobileNumber"),
    validatePropertyNotDish("status"),
    validationDishes,
    dishQuantityValidation,
    updateIdValidation,
    updateStatusValidation,
    updateDeliveryValidation,
    update,
  ],
  delete: [orderExists, deletePendingValidation, destroy],
  list,
  orderExists,
};
