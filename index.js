const inquirer = require("inquirer");
const path = require('path');
const fs = require('fs');
const cTable = require('console.table');
const greet = require('./Assets/welcome');
const Data = require("./db/query");

async function init() {
    await greet();
    const data = new Data();

    while (true) {
        const {choice} = await inquirer.prompt([
            {
                type: "list",
                name: "choice",
                message: "What would you like to do next?",
                choices: [
                    "View all employees", "View all roles", "View all departments", "View employees by manager", "View employees by department", "View department's budget",
                    "Add department", "Add role", "Add employee",
                    "Update employee role", "Update employee manager",
                    "Delete",
                    "Quit"
                ]
            }
        ]);
        if (choice === "Quit") {
            break;
        } else if (choice === "View all employees") {
            const employees = await data.getEmployees();
            console.log(cTable.getTable(employees));
        } else if (choice === "View all roles") {
            const roles = await data.getRoles();
            console.log(cTable.getTable(roles));
        } else if (choice === "View all departments") {
            const departments = await data.getDepartments();
            console.log(cTable.getTable(departments));
        } else if (choice === "View employees by manager"){
            const employees = await data.getEmployeesByManager();
            console.log(cTable.getTable(employees));
        } else if(choice === "View employees by department"){
            const employees = await data.getEmployeesByDepartment();
            console.log(cTable.getTable(employees));
        } else if (choice === "Add department"){
            const newDepartment = await data.addDepartment();
            console.log(`${newDepartment} has been added to the database`);
        } else if (choice === "Add role"){
            const newRole = await data.addRole();
            console.log(`${newRole} has been added to the database`);
        } else if (choice === "Add employee"){
            const newEmployee = await data.addEmployee();
            console.log(`${newEmployee} has been added to the database`);
        } else if (choice === "Update employee role"){
            const updatedRole = await data.updateRole();
            console.log(`${updatedRole}'s role has been updated`);
        } else if (choice === "Update employee manager"){
            const updatedEmployee = await data.updateManagers();
            console.log(`${updatedEmployee}'s manager has been updated`);
        } else if(choice === "Delete"){
           await data.delete();
        } else if (choice === "View department's budget"){
            const budget = await data.budget();
            console.log(cTable.getTable(budget));
        }
    }
    await data.close();
}

init();


