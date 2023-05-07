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
                choices: ["View all employees", "View all roles", "View all departments", "Add department", "Add role", "Add employee", "Update employee role", "Quit"]
            }
        ]);
        if (choice === "Quit") {
            break;
        } else if (choice === "View all employees") {
            let employees = await data.getEmployees();
            console.log(cTable.getTable(employees));
        } else if (choice === "View all roles") {
            let roles = await data.getRoles();
            console.log(cTable.getTable(roles));
        } else if (choice === "View all departments") {
            let departments = await data.getDepartments();
            console.log(cTable.getTable(departments));
        } else if (choice === "Add department"){
            let newDepartment = await data.addDepartment();
            console.log(`${newDepartment} has been added to the database`);
        } else if (choice === "Add role"){
            let newRole = await data.addRole();
            console.log(`${newRole} has been added to the database`);
        } else if (choice === "Add employee"){
            let newEmployee = await data.addEmployee();
            console.log(`${newEmployee} has been added to the database`);
        } else if (choice === "Update employee role"){
            let updatedRole = await data.updateRole();
            console.log(`${updatedRole}'s role has been updated`);
        }
    }
    await data.close();
}

init();


