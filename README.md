
# bamazon!  Multiple features to an on-line order system
#### Developed by Deb Warrick https://debwarrick.com

* bamazon is an example of using MySQL, in conjunction with NODE and inquirer to provide a user interface
* bamazon can't be run from a URL, it must be executed using Node.js.

## bamazonCustomer.js - buy your items from this CLI interface
## bamazonManager.js - will allow you to:  view products for sale, see those below inventory limits (5), add quantity to inventory, add a new product
## bamazonSupervisor.js - will allow you to run a net profit report, and add a new department.


## How it works

### NODE bamazonCustomer

You will be shown a list of the products in the bamazon database, including the price and the quantity available.
You will enter the item number, and then the quantity you wish to purchase.
You can purchase multiple items in one order.  When you are finished with your order, simply hit enter and your order will be complete.
If you have started an order and wish to cancel, type in Q.  If you order more than we have in stock, we'll let you know so you can adjust.
You will be given an order total at the end.
  
##### Watch me walk you through it.
![](bamazonCustomer.gif)


### NODE bamazonManager

You will be given a menu to select from.  Use the up and down arrows to navigate through.

##### View Products for Sale - will display our current inventory
##### View Low Inventory - will list the item with a in-stock inventory of less than 5 so you know when to reorder.
##### Add to Inventory - will allow you to log the receipt of additional quantity of existing items into inventory.  Enter as many as you have and then complete
##### Add New Product - will allow you to add new products to our inventory


##### Watch me walk you through it.
![](bamazonManager.gif)



### NODE bamazonSupervisor

You will be given a menu to select from.  Use the up and down arrows to navigate through.

##### View Product Sales by Department - will give you a summary report of the profit by department based on the overhead.
##### "Create New Department - will allow you to create a new deparment for item entries.


##### Watch me walk you through it.
![](bamazonSupervisor.gif)

### bamazon uses the following Node.js libraries that you must install.

**inquirer** - to allow for the prompts for the execution.  
**keys** - the MySQL password is stored in a .env file to protect it.  
**dotenv** - used to protect my password
**console.table** - to prettify the Node output.  

You must have valid MySQL credentials loaded into a .env file in order to run it.

## Thank you for checking it out, and have fun!
