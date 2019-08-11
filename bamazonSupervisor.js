//get the environment variable
require("dotenv").config();

//load up the includes
var keys = require("./keys.js");
var mysql = require("mysql");

var inquirer = require("inquirer");
const cTable = require('console.table');
var mysqlPassword = keys.mysql;
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

//summary report of profits by department
function viewProductSales() {
    console.clear();
    results = [];
    response = [];
    var query = "SELECT d.id, d.department_name, d.over_head_costs, SUM(IFNULL(p.product_sales,0)) product_sales, SUM(IFNULL(p.product_sales,0))-IFNULL(d.over_head_costs,0) total_profit"
    query += " FROM departments d LEFT JOIN products p ON d.department_name = p.department_name GROUP BY d.id, d.department_name, d.over_head_costs";

    connection.query(query, function (err, res) {

        if (err) throw err;
        console.table(res)
        //go back to the menu
        menuOptions();
    });
}


//will validate what was passed in, and optionally prompt the user if they passed in crap
function menuOptions() {
    // If user didn't enter a command, or entered an invalid one, prompt for one

    inquirer.prompt([
        {
            type: "list",
            name: "doingWhat",
            message: "Select what you would like to do",
            choices: ["View Product Sales by Department", "Create New Department", "Quit"]
        },

    ]).then(function (input) {

        //get a random selection from those previously
        if (input.doingWhat === "View Product Sales by Department") {
            viewProductSales();
        }
        // convert selection to command
        else if (input.doingWhat === "Create New Department") {
            createDepartment();
        }
        //quit
        else {
            process.exit(1);
        }
    });
}


//these functions are for adding a new department
//will prompt for department name and overhead costs for the department
function createDepartment() {

    inquirer.prompt([
        {
            type: "item",
            name: "department",
            message: "Enter Department Name"
        },
        {
            type: "input",
            name: "costs",
            message: "Enter Overhead Costs"
        },

    ]).then(function (input) {
        //they've added a department
        //make sure valid entry
        if (input.department === "" || parseFloat(input.costs) == 0) {
            console.log("All data fields are required");
        }
        else {
            addToDB(input.department, parseFloat(input.costs));
        }
        menuOptions();
    });

}

//once the item has been validated, update the inventory
function addToDB(department, costs) {
    connection.query(
        "INSERT INTO departments SET ?",
        {
            department_name: department,
            over_head_costs: costs
        },
        function (err, res) {
            if (err) throw err;

        }
    );
}
