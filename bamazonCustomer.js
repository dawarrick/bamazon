//get the environment variable
require("dotenv").config();

//load up the includes
var keys = require("./keys.js");
var mysql = require("mysql");

var inquirer = require("inquirer");
const cTable = require('console.table');
var mysqlPassword = keys.mysql;

var results = [];
var response = [];
var purchases = [];
var orderTotal = 0;
var crlf = '\r\n';

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,// Your port; if not 3306
    user: "root",  // Your username
    password: mysqlPassword.password,  // Your password
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    //console.log("connected as id " + connection.threadId + "\n");
    loadItemArray();
});

//load the items from the database into an array for processing.
function loadItemArray() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        res.forEach(function (ea) {
            response.push({
                id: ea.item_id,
                item: ea.product_name,
                price: ea.price,
                quantityInStock: ea.stock_quantity
            });
            //secondary array for quick lookup of items
            results.push(
                ea.item_id
            );
        })
//display the items in the database
        displayItems();
    });
}

//display the items available for sale
function displayItems() {
    console.table("Available Items",response);
    processInput();
}



//will prompt for order information
function processInput() {

 //prompt for the item ID
    inquirer.prompt([
        {
            type: "input",
            name: "itemID",
            message: "Enter the ID of the item to purchase, <enter> to complete order or Q to quit."
        },
        {
            //only prompt for the quantity if they selected an item
            when: function (resp) {
                return (resp.itemID.toUpperCase() !== "Q" && resp.itemID !== "");
            },
            type: "input",
            name: "quantity",
            message: "Quantity"
        }

    ]).then(function (input) {
        //they've added something to the order and pressed enter.
        if (input.itemID ==="" && purchases.length > 0) {
            processOrder();
        }
        //quit
        else if ((input.itemID.toUpperCase() === "Q" || input.itemID ==="") && purchases.length === 0) {
            process.exit(1);
        }
        //validate the input and process.
        else {
            processItem(parseInt(input.itemID), parseInt(input.quantity));
        }
    });

}

//validate the item and add to purchases array
function processItem(item, quantity) {
    //see if the item ID is valid

    let index = results.indexOf(item);
    if (quantity < 0) {
    console.log("Please Enter a valid quantity");
    }
    else if (index < 0) {
        console.log("Please Enter a valid Item ID");
    }
    //see if sufficient quantity
    else if (response[index].quantityInStock < quantity) {
        console.log(`We only have ${response[index].quantityInStock} in stock, please adjust your order`);
    }
    else {
        //let's add the items to an array.  two decimals
        var item_total = (quantity * parseFloat(response[index].price));
        purchases.push({
            id: item,
            item: response[index].item,
            price: response[index].price,
            quantity: quantity,
            item_total: item_total,
            stock_quantity: response[index].quantityInStock
        });
        orderTotal += item_total;
    }
    processInput();
}

//after they're done entering the order, update the inventory and display the order.
function processOrder() {
    // update quantity remaining after order

    for (var i = 0; i < purchases.length; i++) {
        var newQuantity = parseInt(purchases[i].stock_quantity) - parseInt(purchases[i].quantity);
        //update the stock inventory array
        purchases[i].stock_quantity = newQuantity;
        updateInventory(purchases[i].id, newQuantity);
    }
    displayOrder();
    connection.end();
    return;

}

//once the item has been validated, update the inventory
function updateInventory(itemID, purchaseQty) {
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: purchaseQty
            },
            {
                item_id: itemID
            }
        ],
        function (err, res) {
            if (err) throw err;

        }
    );
}

//this will display the items purchased, and the total amount
function displayOrder() {
    console.table(`Your order`,purchases,`Your order total is: $ ${orderTotal}`);
}
