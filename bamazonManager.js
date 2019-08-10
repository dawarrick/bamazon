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
var inventory = [];
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
    menuOptions();
});

//load the items from the database into an array for processing.
function loadItemArray(limit) {
    console.clear();
    results = [];
    response = [];
    var query = "SELECT * FROM products";
    //use the same query for low stock
    if (limit > 0) {
        query += ` WHERE stock_quantity < ${limit}`;
    }
    //   console.log(query)
    connection.query(query, function (err, res) {
        //console.log(err);
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
        //if no results
        if (results.length === 0) {
            console.log("There is no inventory with less than 5 items in stock.")
            menuOptions();
        }
        else {
            //display the items in the database
            displayItems(limit);
        }
    });
}

//display the items available for sale
function displayItems(limit) {
    if (limit > 0) {
        console.table(`Items with quantity < ${limit}`, response);
    }
    else {
        console.table("Available Items", response);
    }
    if (limit === -1) {
        return;
    }
    else {
        menuOptions();
    }
}

//will validate what was passed in, and optionally prompt the user if they passed in crap
function menuOptions() {
    // If user didn't enter a command, or entered an invalid one, prompt for one

    inquirer.prompt([
        {
            type: "list",
            name: "doingWhat",
            message: "Select what you would like to do",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"]
        },
        /*    {
                //only prompt for the search if one of the first three options selected
                when: function (response) {
                    return (response.doingWhat !== "Pick for me" && response.doingWhat !== "Quit");
                },
                type: "input",
                name: "searchValue",
                message: "What would you like to search for?"
            }*/
    ]).then(function (input) {

        //get a random selection from those previously
        if (input.doingWhat === "View Products for Sale") {
            loadItemArray(0);
        }
        // convert selection to command
        else if (input.doingWhat === "View Low Inventory") {
            loadItemArray(5);
        }
        else if (input.doingWhat === "Add to Inventory") {
            inventory = [];
            increaseInventory();
        }
        else if (input.doingWhat === "Add New Product") {
            command = "movie-this"
        }
        //quit
        else {
            process.exit(1);
        }
    });

}



//will prompt for items to add quantity
function increaseInventory() {

    //prompt for the item ID
    inquirer.prompt([
        {
            type: "input",
            name: "itemID",
            message: "Enter the ID of the item to increment quantity, <enter> to complete order or Q to quit."
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
        if (input.itemID === "" && purchases.length > 0) {
            processUpdates();
        }
        //quit
        else if ((input.itemID.toUpperCase() === "Q" || input.itemID === "") && purchases.length === 0) {
            process.exit(1);
        }
        //validate the input and process.
        else {
            updateItem(parseInt(input.itemID), parseInt(input.quantity));
        }
    });

}

//validate the item and add to purchases array
function updateItem(item, quantity) {
    //see if the item ID is valid

    let index = results.indexOf(item);
    if (quantity < 0) {
        console.log("Please Enter a valid quantity");
    }
    else if (index < 0) {
        console.log("Please Enter a valid Item ID");
    }
    else {
        //let's add the items to an array.  two decimals
        var item_total = (quantity * parseFloat(response[index].price));
        inventory.push({
            id: item,
            quantity: quantity,
        });
    }
    increaseInventory();
}

//after they're done entering the order, update the inventory and display the order.
function processUpdates() {
    // update quantity remaining after order

    for (var i = 0; i < purchases.length; i++) {
        var newQuantity = parseInt(purchases[i].stock_quantity) - parseInt(purchases[i].quantity);
        //update the stock inventory array
        purchases[i].stock_quantity = newQuantity;
        updateInventory(purchases[i].id, newQuantity);
    }
    //console.log(purchases);
    displayOrder();
    connection.end();
    return;

}

//once the item has been validated, update the inventory
function updateInventory(itemID, purchaseQty) {
    //console.log(`updateinventory id ${itemID}  qty ${purchaseQty}`)
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: stock_quantity + purchaseQty
            },
            {
                item_id: itemID
            }
        ],
        function (err, res) {
            if (err) throw err;

        }
    );
    loadItemArray(0);
}

//this will display the items purchased, and the total amount
function displayOrder() {
    console.table(`Your order`, purchases, `Your order total is: $ ${orderTotal}`);
}
