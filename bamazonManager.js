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
var departments = [];

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,// Your port; if not 3306
    user: "root",  // Your username
    password: mysqlPassword.password,  // Your password
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    loadDepartments();
    menuOptions();
});

//departments for adding a new item
function loadDepartments() {
    console.clear();

    var query = "SELECT department_name FROM departments ORDER BY department_name";
    connection.query(query, function (err, res) {
        if (err) throw err;

        res.forEach(function (ea) {
            departments.push(
                ea.department_name
            );
        })
    });
}

//load the items from the database into an array for processing.
//limit - 0 means load and display all. -1 means load all and display, and prompt for inventory changes, any other number means show those with qty < limit.
function loadItemArray(limit) {
    console.clear();
    results = [];
    response = [];
    var query = "SELECT * FROM products";
    //use the same query for low stock
    if (limit > 0) {
        query += ` WHERE stock_quantity < ${limit}`;
    }
    
    connection.query(query, function (err, res) {
      
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
            console.log("There is no inventory that meets your criteria.")
        }
        else {
            displayItems(limit);
        }
        if (limit === -1) {
            //prompt for updates to inventory
            increaseInventory();
        }
        else {
            //go back to the menu
            menuOptions()
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
    return;
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
            //display the current inventory
            loadItemArray(-1);
            
        }
        else if (input.doingWhat === "Add New Product") {
            addProduct();
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
        if (input.itemID === "" && inventory.length > 0) {
            processUpdates();
        }
        //quit
        else if ((input.itemID.toUpperCase() === "Q" || input.itemID === "") && inventory.length === 0) {
            //process.exit(1);
            return;
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
        //let's add the items to an array.
        inventory.push({
            id: item,
            quantity: quantity,
            stock_quantity: response[index].quantityInStock
        });
    }
    increaseInventory();
}

//after they're done entering the items to update, update the inventory and display.
function processUpdates() {
    // update quantity remaining after order

    for (var i = 0; i < inventory.length; i++) {
        //compute the new quantity in stock
        var newQty = parseInt(inventory[i].quantity) + parseInt(inventory[i].stock_quantity);
        updateInventory(inventory[i].id, newQty);
    }
    //display current inventory and menu
    loadItemArray(0);
}

//once the item has been validated, update the inventory
function updateInventory(itemID, newQty) {
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: newQty
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

//these functions are for adding a new item
//will prompt for product name, department, price, quantity
function addProduct() {

    inquirer.prompt([

        {
            type: "input",
            name: "name",
            message: "Product Name"
        },

        {
            type: "list",
            name: "department",
            message: "Select Department",
            choices: departments
        },

        {
            type: "input",
            name: "price",
            message: "Price"
        },

        {
            type: "input",
            name: "qty",
            message: "Quantity in Stock"
        },
    ]).then(function (input) {
        //they've added something to the order and pressed enter.
        //make sure valid entry
        if (input.name === "" || input.department === "" || parseFloat(input.price) < .01 || parseInt(input.qty) < 0) {
            console.log("All data fields are required");
            
        }
        else {
            addToDB(input.name, input.department, parseFloat(input.price), parseInt(input.qty));
        }
        menuOptions();
    });

}

//once the item has been validated, update the inventory
function addToDB(name, department, price, quantity) {
    connection.query(
        "INSERT INTO products SET ?",
            {
                product_name: name,
                department_name: department,
                price: price,                            
                stock_quantity: quantity
            },
        function (err, res) {
            if (err) throw err;

        }
    );
    loadItemArray(0);
}